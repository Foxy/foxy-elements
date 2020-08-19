import { Translatable } from '../../../mixins/translatable';
import { QuickOrderProduct, EmptyProduct } from './types';
import { html, property, TemplateResult, queryAll } from 'lit-element';
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
  private static productProperties = Object.keys(EmptyProduct);

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

  // A set of sentences used in the component. They are centralized to ease the
  // implementation of internationalization.
  private __vocabulary = {
    remove: 'Remove',
  };

  /**
   * Instance fields and methods
   */

  // Call Translatable parent with the name of the translation file
  public constructor() {
    super('quick-order');
  }

  // Is this instance child of another product
  private get __isChildProduct() {
    return !!this.value?.parent_code;
  }

  // Default image values to allow the product to be ran out-of-the box with
  // example images.
  private __default_image = {
    src: 'https://www.foxy.io/merchants/shopping-cart-full.svg',
    alt: 'A sketch of a shopping cart with three boxes',
  };

  // Value is the source of truth for the product
  // TODO: evaluate if the product attributes should play this role
  public value: QuickOrderProduct | undefined;

  @property({ type: Number, reflect: true, attribute: 'total-price' })
  public totalPrice?: number = this.__computeTotalPrice();

  @property({ type: String })
  public name?: string;

  @property({ type: String })
  public price?: number = 0;

  @property({ type: String })
  public image?: string;

  @property({ type: String })
  public url?: string;

  @property({ type: String, reflect: true })
  public code?: string | number;

  @property({ type: String })
  public parent_code?: string;

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

  @queryAll('[data-product]')
  public childProducts?: NodeListOf<ProductItem>;

  public updated(changed: unknown): void {
    this.dispatchEvent(new Event('change'));
  }

  /** LitElement life cicle */
  public firstUpdated(): void {
    this.__isInitialAttributesValid();
    this.__propertyToValue();
    this.__setId();
    this.__setCode();
    this.__setParentCode();
    this.__createChildren();
    this.__setTotalPrice();
    if (!this.__isValid()) {
      console.error('Invalid product', this.value);
    }
  }

  private handleQuantity = {
    handleEvent: (ev: Event) => {
      const newValue = Number((ev.target as HTMLInputElement).value);
      if (this.value?.quantity === 0 && newValue) {
        const check = this.shadowRoot?.querySelector('[name=remove]');
        if (check) {
          (check as Checkbox).checked = false;
        }
      }
      this.value!.quantity = newValue;
      this.__setTotalPrice();
    },
  };

  private handleExclude = {
    handleEvent: (ev: Event) => {
      this.value!.quantity = 0;
      this.__setTotalPrice();
    },
  };

  public render(): TemplateResult {
    return html`
      <article
        class="product flex flex-row flex-wrap justify-between ${this.value?.quantity
          ? ''
          : 'removed'}"
      >
        <img
          class="max-w-xs min-w-1 block"
          alt="${this.value?.alt ?? this.__default_image.alt}"
          src="${this.value?.image ?? this.__default_image.src}"
        />
        <x-section class="description flex flex-wrap flex-column p-s min-w-xl">
          <h1>${this.value?.name}</h1>
          <div class="product-description">${this.value?.description}</div>
        </x-section>
        <x-section class="item-info p-s min-w-2">
          <div class="price">${this.value?.price}</div>
          ${this.value?.price != this.totalPrice && this.totalPrice
            ? html`<div class="price total">${this.totalPrice}</div>`
            : ''}
        </x-section>
        ${this.__isChildProduct
          ? ''
          : html` <x-section class="actions p-s min-w-3">
              <x-number-field
                @change=${this.handleQuantity}
                value="${this.value?.quantity}"
                min="0"
                has-controls
              ></x-number-field>
              <x-checkbox name="remove" @change=${this.handleExclude}
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
  private __setId() {
    if (!this.value?.id) {
      this.value!.id = ProductItem.__newId();
    } else {
      // The user provided a custom id
      ProductItem.__acknowledgeId(this.value!.id);
    }
  }

  /**
   * Creates a code if none is provided by the user
   */
  private __setCode() {
    if (!this.code && this.value && !this.value.code) {
      this.value.code = `RAND${Math.random()}`;
      this.code = this.value!.code;
    }
  }

  /**
   * Find if this product item is a child of another product item and sets the parent code accordingly
   */
  private __setParentCode(): void {
    const productParent = this.parentElement;
    if (productParent?.hasAttribute('data-product')) {
      this.value!.parent_code = (productParent as ProductItem).value?.code;
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
    for (const i of ProductItem.productProperties) {
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
    if (this.value && this.value.children && this.value.children.length) {
      for (const p of this.value.children) {
        const product = new ProductItem();
        product.value = p;
        product.__computeTotalPrice();
        this.appendChild(product);
      }
    }
  }

  private __setTotalPrice() {
    this.totalPrice = this.__computeTotalPrice();
  }

  /**
   * The price of the total qty of each of the child products
   */
  private __computeTotalPrice(): number {
    // Get all child products
    const myChildProducts = this.querySelectorAll('[data-product]');
    const myPrice = this.qtyPrice();
    myChildProducts.forEach((e, priceObj) => {
      const p = e as ProductItem;
    });
    return myPrice;
  }

  /**
   * The price of the total qty of this product
   */
  public qtyPrice(): number {
    if (!this.value?.price || !this.value?.quantity) {
      return 0;
    } else {
      const result = this.value.price * this.value.quantity;
      return Number(result.toFixed(2));
    }
  }

  private __isInitialAttributesValid() {
    if (!(this.name && this.price && this.name.length > 0 && this.price >= 0)) {
      console.error('The name and price attributes of a product are required.', {
        name: this.name,
        price: this.price,
      });
    }
    if (this.price! < 0) {
      console.error('Product added with negative price');
    }
    if (this.quantity === 0) {
      console.error('Product added with zero quantity');
    }
    if (this.quantity_min && this.quantity < this.quantity_min) {
      console.error('Quantity amount is less than minimum quantity');
    }
    if (this.quantity_max && this.quantity > this.quantity_max) {
      console.error('Quantity amount is more than maximum quantity');
    }
  }

  /**
   * Constraints Products must eventually adhere to.
   **/
  private __isValid() {
    return (
      this.value &&
      this.value.price! >= 0 &&
      this.value.name &&
      this.value.id &&
      this.value.quantity! >= 0 &&
      (!this.value.quantity_min || this.value.quantity! >= this.value.quantity_min)
    );
  }
}
