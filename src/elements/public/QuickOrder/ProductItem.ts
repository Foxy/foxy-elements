import { Translatable } from '../../../mixins/translatable';
import { QuickOrderProduct, EmptyProduct } from './types';
import { html, property, internalProperty, TemplateResult } from 'lit-element';
import { Checkbox, Section, Group, I18N } from '../../private/index';

/**
 * This component allows a user to configure a product.
 *
 * The product may be configured using HTML properties or a JS object.
 * Relevant properties are mapped to a QuickOrderProduct object that is used by
 * the QuickOrderForm.
 *
 * The product id may be set manually by the user or created automatically by the component.
 * An error is thrown if an attempt is made to create two products with the same id.
 */
export class ProductItem extends Translatable {
  // A list of product properties as defined in Foxy Cart Documentation

  /**
   * Static fields and methods
   **/

  // A list of all existing ids to guarantee unicity
  private static __existingIds: number[] = [];

  // A list of the product properties
  private static __productProperties = Object.keys(EmptyProduct);

  /**
   * Custom elements used in the component
   */
  public static get scopedElements() {
    return {
      'x-checkbox': Checkbox,
      'x-section': Section,
      'x-group': Group,
      'x-number-field': customElements.get('vaadin-number-field'),
      'x-i18n': I18N,
    };
  }

  /**
   * Creates a new unique id to be used in the form
   *
   * Ids are used to distinguish different products in a single form.
   * Ids are prepended to fields names to allow Foxy Cart to know to what
   * product a particular field relates.
   *
   * @return number the newly created id
   */
  private static __newId(): number {
    // Get the maximum value
    const newId =
      ProductItem.__existingIds.reduce((accum, curr) => (curr > accum ? curr : accum), 0) + 1;
    ProductItem.__acknowledgeId(newId);
    return newId;
  }

  /**
   * Acknowledges an id
   *
   * Ids are acknowledged in order to guarantee they are unique.
   * Throws an exception if the id is already acknowledged.
   *
   * @argument number the id to acknowledge
   */
  private static __acknowledgeId(customId: string | number): void {
    const newId = Number(customId);
    if (ProductItem.__existingIds.includes(newId)) {
      throw new Error('Attempt to create two different products with the same id');
    }
    ProductItem.__existingIds.push(newId);
  }

  /**
   * Instance fields and methods
   */

  // Call Translatable parent with the name of the translation file
  public constructor() {
    super('quick-order');
    this.productId = this.__setId();
    this.updateComplete.then(() => {
      this.__setCode();
      this.__setParentCode();
      this.__createChildren();
      this.__setTotalPrice();
      if (!this.__isValid(true)) {
        console.error('Invalid product', 'in product', this.value);
      }
    });
  }

  // A set of sentences used in the component. They are centralized to ease the
  // implementation of internationalization.
  private __vocabulary = {
    remove: 'Remove',
  };

  // Is this instance child of another product
  private get __isChildProduct() {
    return !!this.value?.parent_code;
  }

  @internalProperty()
  private __modified = false;

  // Default image values to allow the product to be ran out-of-the box with
  // example images.
  private __default_image = {
    src: 'https://www.foxy.io/merchants/shopping-cart-full.svg',
    alt: 'A sketch of a shopping cart with three boxes',
  };

  @property({ type: Object })
  public set value(v: QuickOrderProduct) {
    for (const k in v) {
      let attrValue = '';
      if (typeof v[k] == 'object') {
        attrValue = JSON.stringify(v[k]);
      } else {
        if (v[k]) {
          attrValue = v[k]!.toString();
        }
      }
      this.setAttribute(k, v[k] ? attrValue : '');
    }
  }

  public get value(): QuickOrderProduct {
    const r: any = {};
    const me = this as any;
    for (let i = 0; i < this.attributes.length; i++) {
      r[this.attributes[i].name] = this.attributes[i].value;
    }
    return r as QuickOrderProduct;
  }

  @property({ type: String })
  public currency?: string;

  @property({ type: Number, reflect: true, attribute: 'total' })
  public total?: number = this.__computeTotalPrice();

  @property({ type: String })
  public name?: string;

  @property({ type: Number })
  public price = 0;

  @property({ type: String })
  public image?: string;

  @property({ type: String })
  public url?: string;

  @property({ type: String, reflect: true })
  public code?: string | number;

  @property({ type: String })
  public parent_code?: string | number;

  @property({ type: Number })
  public quantity = 1;

  @property({ type: Number })
  public quantity_max?: number;

  @property({ type: String })
  public quantity_min?: number;

  @property({ type: String })
  public category?: string;

  @property({ type: String })
  public expires?: string;

  @property({ type: String })
  public weight?: string;

  @property({ type: Number })
  public length?: number;

  @property({ type: Number })
  public width?: number;

  @property({ type: Number })
  public height?: number;

  @property({ type: String })
  public shipto?: string;

  @property({ type: String })
  alt?: string;

  @property({ type: String })
  signature?: string;

  @property({ type: Boolean, reflect: true, attribute: 'data-product' })
  isProduct = true;

  @property({ type: Array })
  open = [];

  @property({ type: Array, attribute: 'children' })
  childProducts: QuickOrderProduct[] = [];

  @property({ type: String })
  description = '';

  @property({ type: Number, attribute: 'product-id' })
  productId: number;

  public updated(changed: unknown): void {
    this.__setTotalPrice();
    this.dispatchEvent(new Event('change'));
  }

  private handleQuantity = {
    handleEvent: (ev: Event) => {
      const newValue = Number((ev.target as HTMLInputElement).value);
      if (this.quantity != newValue) {
        this.__modified = true;
      }
      this.quantity = newValue;
    },
  };

  private handleExclude = {
    handleEvent: (ev: Event) => {
      this.quantity = 0;
    },
  };

  public render(): TemplateResult {
    return html`
      <article
        class="product flex flex-row flex-wrap justify-between ${this.quantity
          ? ''
          : 'removed'} ${this.__modified ? 'modified' : ''}"
      >
        <img
          class="max-w-xs min-w-1 block"
          alt="${this.alt ?? this.__default_image.alt}"
          src="${this.image ?? this.__default_image.src}"
        />
        <x-section class="description flex flex-wrap flex-column p-s min-w-xl">
          <h1>${this.name}</h1>
          <div class="product-description">${this.description}</div>
        </x-section>
        <x-section class="item-info p-s min-w-2">
          <div class="price">${this.__translateAmount(this.price)}</div>
          ${this.price != this.total && this.total
            ? html`<div class="price total">${this.__translateAmount(this.total)}</div>`
            : ''}
        </x-section>
        ${this.__isChildProduct
          ? ''
          : html` <x-section class="actions p-s min-w-3">
              <x-number-field
                name="quantity"
                @change=${this.handleQuantity}
                value="${this.quantity}"
                min="0"
                has-controls
              ></x-number-field>
              <x-checkbox
                name="remove"
                @change=${this.handleExclude}
                .checked=${this.quantity ? false : true}
                >${this.__vocabulary.remove}</x-checkbox
              >
            </x-section>`}
        <section class="child-products">
          <slot></slot>
        </section>
      </article>
    `;
  }

  /**
   * Create an ID if none is provided by the user.
   */
  private __setId(): number {
    let productId;
    if (!this.productId) {
      productId = ProductItem.__newId();
      this.setAttribute('product-id', productId.toString());
    } else {
      // The user provided a custom id as an attribute
      ProductItem.__acknowledgeId(this.productId);
      productId = this.productId;
    }
    return productId;
  }

  /**
   * Creates a code if none is provided by the user
   */
  private __setCode(): void {
    if (!this.code) {
      this.code = `RAND${Math.random()}`;
    }
  }

  /**
   * Find if this product item is a child of another product item and sets the parent code accordingly
   */
  private __setParentCode(): void {
    const productParent = this.parentElement;
    if (productParent?.hasAttribute('data-product')) {
      this.parent_code = (productParent as ProductItem).code;
    }
  }

  /** Captures values set as properties to build the value property of the component.  */
  private __propertyToValue(): void {
    if (this.value === undefined) {
      this.value = {
        name: this.name ? this.name : '',
        price: this.price ? this.price : 0,
        quantity: this.quantity,
      };
      if (!(this.name && this.price && this.name.length > 0 && this.price >= 0)) {
        console.error('The name and price attributes of a product are required.', {
          name: this.name,
          price: this.price,
        });
      }
    }
    type T = Partial<Record<string, string | number>>;
    for (const i of ProductItem.__productProperties) {
      if (!(this.value! as T)[i]) {
        const attr = this.getAttribute(i);
        if (attr) {
          (this.value! as T)[i] = attr;
        }
      }
    }
  }

  /**
   * Create child product items from children field.
   */
  private __createChildren(): void {
    if (this.childProducts && this.childProducts.length) {
      this.childProducts.forEach(p => {
        const product = new ProductItem();
        product.value = p;
        product.__computeTotalPrice();
        this.appendChild(product);
      });
    }
  }

  private __setTotalPrice(): void {
    this.total = this.__computeTotalPrice();
  }

  /**
   * The price of the total qty of each of the child products
   */
  private __computeTotalPrice(): number {
    // Get all child products
    const myChildProducts = this.querySelectorAll('[data-product]');
    let myPrice = 0;
    myChildProducts.forEach(e => {
      const p = e as ProductItem;
      p.total && (myPrice += p.total);
    });
    myPrice += this.price;
    myPrice *= this.quantity;
    return myPrice;
  }

  /**
   * The price of the total qty of this product
   */
  public qtyPrice(): number {
    if (!this.price || !this.quantity) {
      return 0;
    } else {
      return this.price * this.quantity;
    }
  }

  /**
   * Constraints Products must eventually adhere to.
   **/
  private __isValid(initial = false): boolean {
    const error = [];
    if (!this.name || !this.name.length) {
      error.push('The name attribute of a product is required.');
    }
    if (this.price === undefined || (initial && this.price == 0)) {
      error.push('The price attribute of a product is required.');
    }
    if (this.price! < 0) {
      error.push('Product added with negative price.');
    }
    if (this.quantity_min && this.quantity! < this.quantity_min) {
      error.push('Quantity amount is less than minimum quantity.');
    }
    if (this.quantity_max && this.quantity! > this.quantity_max) {
      error.push('Quantity amount is more than maximum quantity.');
    }
    if (!this.productId) {
      error.push('The product has no product id');
    }
    console.error(...error);
    return !error.length;
  }

  private __isAcceptableParameter(key: string): boolean {
    // Remove from this.value any unknown key
    if (ProductItem.__productProperties.includes(key)) {
      return true;
    }
    // Avoid overriding class fields
    for (const k in this) {
      if (key == k) {
        return false;
      }
    }
    // Accept custom attributes
    return true;
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 0,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return '';
    }
  }
}
