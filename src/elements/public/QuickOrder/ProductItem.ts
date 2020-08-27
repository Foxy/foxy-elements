import { Translatable } from '../../../mixins/translatable';
import { Product } from './types';
import { Price } from './private/index';
import { html, property, internalProperty, TemplateResult } from 'lit-element';
import { Checkbox, Section, Group, I18N } from '../../private/index';

/**
 * This component allows a user to configure a product.
 *
 * The product may be configured using HTML properties or a JS object.
 *
 */
export class ProductItem extends Translatable implements Product {
  // A list of product properties as defined in Foxy Cart Documentation

  [k: string]: any;

  /**
   * Static fields and methods
   **/

  // A list of all existing ids to guarantee unicity
  private static __existingIds: number[] = [];

  /**
   * Custom elements used in the component
   */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-checkbox': Checkbox,
      'x-section': Section,
      'x-group': Group,
      'x-number-field': customElements.get('vaadin-number-field'),
      'x-i18n': I18N,
      'x-price': Price,
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

  public constructor() {
    super('quick-order');
    this.__childProductsObserver = new MutationObserver(this.__observeChildren.bind(this));
    this.__childProductsObserver.observe(this, {
      childList: true,
      attributes: false,
      subtree: true,
    });
    this.updateComplete.then(() => {
      if (!this.getAttribute('combined')) {
        this.setAttribute('product', 'true');
      }
      this.__setCode();
      this.__setParentCode();
      this.__createChildren();
      this.__acknowledgeChildProducts();
      this.__setTotalPrice();
      if (!this.__isValid()) {
        console.error('Invalid product', 'in product', this.value);
      }
    });
  }

  private __childProductsObserver?: MutationObserver;

  // A set of sentences used in the component. They are centralized to ease the
  // implementation of internationalization.
  private __vocabulary = {
    remove: 'Remove',
  };

  @internalProperty()
  private __modified = false;

  // Default image values to allow the product to be ran out-of-the box with
  // example images.
  private __default_image = {
    src: 'https://www.foxy.io/merchants/shopping-cart-full.svg',
    alt: 'A sketch of a shopping cart with three boxes',
  };

  @property({ type: Object })
  public set value(v: Product) {
    for (const k in v) {
      let attrValue = '';
      if (typeof v[k as keyof Product] == 'object') {
        attrValue = JSON.stringify(v[k as keyof Product]);
      } else {
        if (v[k as keyof Product] || v[k as keyof Product] === 0) {
          attrValue = v[k as keyof Product]!.toString();
        }
      }
      this.setAttribute(k, v[k as keyof Product] ? attrValue : '');
    }
  }

  public get value(): Product {
    const r: Partial<Record<keyof Product, unknown>> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      r[this.attributes[i].name] = this.attributes[i].value;
    }
    return r as Product;
  }

  @property({ type: String, reflect: true })
  public currency?: string;

  @property({ type: Number, reflect: true, attribute: 'total' })
  public total?: number = this.__computeTotalPrice();

  @property({ type: String })
  public name?: string;

  @property({ type: Number })
  public price?: number;

  @property({ type: String })
  public image?: string;

  @property({ type: String })
  public url?: string;

  @property({ type: String, reflect: true })
  public code?: string | number;

  @property({ type: String })
  public parent_code?: string | number;

  @property({ type: Number, reflect: true })
  public quantity = 1;

  @property({ type: Number })
  public quantity_max?: number;

  @property({ type: String })
  public quantity_min?: number;

  @property({ type: String })
  public category?: string;

  @property({ type: String })
  public expires?: string;

  @property({ type: Number })
  public weight?: number;

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

  @property({ type: Boolean, reflect: true, attribute: 'product' })
  isProduct = true;

  @property({ type: Boolean, reflect: true, attribute: 'combined' })
  isChildProduct = false;

  @property({ type: Array, attribute: 'children' })
  childProducts: Product[] = [];

  @property({ type: String })
  description = '';

  @property({ type: Object })
  signature?: Record<string, string>;

  @property({ type: Object })
  open?: Record<string, string>;

  @property({ type: Number, reflect: true })
  public pid: number = ProductItem.__newId();

  @internalProperty()
  private get __childPrices(): number[] {
    const childPrices: number[] = [];
    const myChildProducts = this.querySelectorAll('[combined]');
    myChildProducts.forEach(e => {
      const p = e as ProductItem;
      if (p.total) {
        childPrices.push(p.total);
      }
    });
    return childPrices;
  }

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
    if (!this.__isValid()) {
      return html``;
    }
    return html`
      <article
        class="product flex flex-row flex-wrap justify-between ${this.quantity ? '' : 'removed'} ${
      this.__modified ? 'modified' : ''
    }"
      >
        <img
          class="max-w-xs min-w-1 block w-full sm:w-auto flex-grow"
          alt="${this.alt ?? this.__default_image.alt}"
          src="${this.image ?? this.__default_image.src}"
        />
        <section class="description p-s min-w-xl w-full sm:w-auto flex-third">
          <h1 class="text-primary text-bold font-size-m">${this.name}</h1>
          <div class="product-description">
            ${this.description}
          </div>
        </section>
        <section class="item-info p-s min-w-2 w-full sm:w-auto flex-grow">
          <div class="price text-right text-primary p-s">
            <x-price .price=${this.price}
                     .prices=${this.__childPrices}
                     .currency=${this.currency}
                     .quantity=${this.quantity}>
            </x-price>
          ${
            this.isChildProduct
              ? ''
              : html` <div class="quantity p-s min-w-3 w-full md:w-auto">
                  <x-number-field
                    class="w-full"
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
                </div>`
          }
        </section>
        <section class="child-products w-full p-s">
          <slot></slot>
        </section>
      </article>
    `;
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
    if (productParent?.hasAttribute('product')) {
      this.parent_code = (productParent as ProductItem).code;
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
        product.currency = this.currency;
        product.__computeTotalPrice();
        this.__acknowledgeProduct(product);
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
    const myChildProducts = this.querySelectorAll('[combined]');
    let myPrice = 0;
    myChildProducts.forEach(e => {
      const p = e as ProductItem;
      p.total && (myPrice += p.total);
    });
    myPrice += this.price!;
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
  private __isValid(): boolean {
    const error = [];
    if (!this.name || !this.name.length) {
      error.push('The name attribute of a product is required.');
    }
    if (!this.price && this.price !== 0) {
      error.push('The price attribute of a product is required.');
    }
    if (this.price && this.price! < 0) {
      error.push('Product added with negative price.');
    }
    if (this.quantity_min && this.quantity && this.quantity < this.quantity_min) {
      error.push('Quantity amount is less than minimum quantity.');
    }
    if (this.quantity_max && this.quantity && this.quantity > this.quantity_max) {
      error.push('Quantity amount is more than maximum quantity.');
    }
    if (!this.pid) {
      error.push('The product has no product id');
    }
    console.error(...error);
    return !error.length;
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 0,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return 'No currency available';
    }
  }

  private __observeChildren(mutationList: MutationRecord[]): void {
    mutationList.forEach(m => {
      if (m.type == 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.DOCUMENT_NODE) {
            this.__acknowledgeProduct(n as ProductItem);
          }
        });
      }
    });
    this.__setTotalPrice();
  }

  private __acknowledgeChildProducts() {
    this.shadowRoot
      ?.querySelectorAll('[product]')
      .forEach(e => this.__acknowledgeProduct(e as ProductItem));
    this.querySelectorAll('[product]').forEach(e => this.__acknowledgeProduct(e as ProductItem));
  }

  private __acknowledgeProduct(e: ProductItem): void {
    e.addEventListener('change', this.__setTotalPrice.bind(this));
    e.isProduct = false;
    e.isChildProduct = true;
  }
}
