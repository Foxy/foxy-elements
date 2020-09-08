import { Translatable } from '../../../mixins/translatable';
import { Product, ImageDescription } from './types';
import { Price, Picture, PictureGrid } from './private/index';
import { html, css, PropertyDeclarations, CSSResultArray, TemplateResult } from 'lit-element';
import { Checkbox, Section, Group, I18N, ErrorScreen } from '../../private/index';

/**
 * This component allows a user to configure a product.
 *
 * The product may be configured using HTML properties or a JS object.
 *
 */
export class ProductItem extends Translatable implements Product {
  // A list of product properties as defined in Foxy Cart Documentation

  [k: string]: any;

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        article.product-item {
          margin: 0 auto;
          display: grid;
          grid:
            'picture picture quantity'
            'description description description'
            'children children children'
            'price price price' / 88px auto 104px;
          grid-column-gap: 32px;
        }
        @media (min-width: 640px) {
          article.product-item {
            grid:
              'picture description description  quantity'
              'picture children children  children'
              'picture price price price' / 88px auto 100px 104px;
            grid-column-gap: 32px;
          }
        }
        section.quantity {
          grid-area: quantity;
        }
        section.description {
          grid-area: description;
        }
        section.price {
          grid-area: price;
        }
        section.child-products {
          grid-area: children;
        }
        ::slotted([combined].last\\:border-b-0:last-child) {
          border-bottom-width: 0 !important;
        }
      `,
    ];
  }

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
      'x-picture': Picture,
      'x-picture-grid': PictureGrid,
      'x-error-screen': ErrorScreen,
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
    ProductItem.__existingIds.push(newId);
    return newId;
  }

  /**
   * Instance fields and methods
   */

  public constructor() {
    super('quick-order');
    this.__childProductsObserver = new MutationObserver(this.__observeProducts.bind(this));
    this.__childProductsObserver.observe(this, {
      childList: true,
      attributes: false,
      subtree: true,
    });
    this.updateComplete.then(() => {
      this.__setCode();
      this.__createProducts();
      this.__acknowledgeChildProducts();
      this.__changedChildProduct();
      if (!this.__isValid()) {
        console.error('Invalid product', 'in product', this.value);
      }
    });
  }

  private __childProductsObserver?: MutationObserver;

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __modified: {},
      category: { type: String },
      code: { type: String, reflect: true },
      currency: { type: String, reflect: true },
      expires: { type: String },
      height: { type: Number },
      image: { type: String },
      length: { type: Number },
      name: { type: String },
      parent_code: { type: String },
      price: { type: Number },
      quantity: { type: Number, reflect: true },
      quantity_max: { type: Number },
      quantity_min: { type: String },
      shipto: { type: String },
      total: { type: Number, reflect: true, attribute: 'total' },
      url: { type: String },
      value: { type: Object },
      weight: { type: Number },
      width: { type: Number },
      __childPrices: {},
      __childrenCount: {},
      __images: {},
      alt: { type: String },
      description: { type: String },
      isChildProduct: { type: Boolean, reflect: true, attribute: 'combined' },
      isProduct: { type: Boolean, reflect: true, attribute: 'product' },
      open: { type: Object },
      pid: { type: Number, reflect: true },
      products: { type: Array, attribute: 'products' },
      signatures: { type: Object },
    };
  }

  private __modified = false;

  public set value(v: Product) {
    for (const k in v) {
      let attrValue = '';
      if (typeof v[k as keyof Product] == 'object') {
        attrValue = JSON.stringify(v[k as keyof Product]);
      } else {
        const key = k as keyof Product;
        if ((v[key] && v[key] !== 'undefined') || v[key] === 0) {
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

  public currency?: string;

  public total?: number = this.__computeTotalPrice();

  public name?: string;

  public price?: number;

  public image?: string;

  public url?: string;

  public code?: string | number;

  public parent_code?: string | number;

  public quantity = 1;

  public quantity_max?: number;

  public quantity_min?: number;

  public category?: string;

  public expires?: string;

  public weight?: number;

  public length?: number;

  public width?: number;

  public height?: number;

  public shipto?: string;

  public alt?: string;

  public isProduct = true;

  public isChildProduct = false;

  public products: Product[] = [];

  public description = '';

  public signatures?: Record<string, string>;

  public open?: Record<string, boolean>;

  public pid: number = ProductItem.__newId();

  private __childPrices: number[] = [];

  private __images: ImageDescription[] = [];

  private __childrenCount = 0;

  public updated(changed: Map<string, any>): void {
    if (changed.get('products') != undefined) {
      this.__createProducts();
    }
    this.__setTotalPrice();
    this.dispatchEvent(new Event('change'));
  }

  private __handleQuantity = {
    handleEvent: (ev: Event) => {
      const newValue = Number((ev.target as HTMLInputElement).value);
      this.quantity = newValue;
      this.__modified = true;
      this.__images = ([this.getImageDescription()] as ImageDescription[]).concat(
        this.__images.slice(1, this.__images.length)
      );
    },
  };

  public render(): TemplateResult {
    if (!this.__isValid()) {
      return html`<x-error-screen type="setup_needed" class="relative"></x-error-screen>`;
    }
    if (this.isChildProduct) {
      return html`
        <article
          class="product-summary duration-100 flex justify-between py-m ${this.quantity
            ? ''
            : 'removed opacity-50'}"
        >
          <div class="description">
            <h1 class="text-header font-bold text-m mb-s leading-none">
              ${this.name}
            </h1>
            <section class="description text-secondary">
              ${this.description ? html`<p>${this.description}</p>` : ''}
              <slot></slot>
            </section>
          </div>
          ${this.quantity < 2
            ? ''
            : html` <section class="quantity w-xxl font-normal text-secondary">
                ${this._t('product.items', { quantity: this.quantity })}
              </section>`}
        </article>
      `;
    } else {
      return html`
        <article
          class="product-item duration-100 py-m ${this.quantity ? '' : 'removed opacity-50'} ${this
            .__modified
            ? 'modified'
            : ''}"
        >
          <x-picture-grid .images=${this.__images}></x-picture-grid>
          <section class="description min-w-xl w-full mt-l sm:w-auto sm:mt-0">
            <h1 class="text-header font-bold text-l leading-none mb-m">${this.name}</h1>
            <div class="product-description text-secondary">
              ${this.description}
              <slot></slot>
            </div>
          </section>
          <section class="price text-left text-header text-l">
            <x-price
              .price=${this.price}
              .prices=${this.__childPrices}
              .currency=${this.currency}
              .quantity=${this.quantity}
            >
            </x-price>
          </section>
          <section class="quantity max-w-xxs w-full md:w-auto text-s">
            <x-number-field
              class="w-full p-0"
              name="quantity"
              @change=${this.__handleQuantity}
              value="${this.quantity}"
              min="0"
              has-controls
            ></x-number-field>
            ${this.quantity > 1 && this.price
              ? html`<div class="price-each text-secondary text-xs text-center">
                  ${this.__translateAmount(this.price!)} ${this._t('price.each')}
                </div>`
              : ''}
          </section>
          <section class="child-products w-full ${this.__childrenCount ? 'mt-m' : ''}">
            <slot name="products"></slot>
          </section>
        </article>
      `;
    }
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
   * Create child product items from products field.
   */
  private __createProducts(): void {
    if (this.products && this.products.length) {
      this.products.forEach(p => {
        // Use a reference to the constructor of the instance in order to avoid issues in tests
        type AConstructorTypeOf<T> = new (...args: any[]) => T;
        const productConstructor = this.constructor;
        const product = new (productConstructor as AConstructorTypeOf<ProductItem>)();
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
    if (!this.__childPrices) {
      if (!this.price) return 0;
      return this.price * this.quantity;
    }
    let myPrice = 0;
    this.__childPrices.forEach(p => {
      myPrice += p;
    });
    myPrice += this.price!;
    myPrice *= this.quantity;
    return myPrice;
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
    if (!this.currency) {
      error.push('The product has no currency');
    }
    console.error(...error);
    return !error.length;
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 2,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return this._t('error.no_currency');
    }
  }

  private __observeProducts(mutationList: MutationRecord[]): void {
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
    e.addEventListener('change', this.__changedChildProduct.bind(this));
    e.isProduct = false;
    e.isChildProduct = true;
    e.classList.add('border-b', 'border-shade-5', 'last:border-b-0');
    if (this.code) {
      e.parent_code = this.code;
    }
  }

  public getImageDescription(): ImageDescription {
    return {
      src: this.image,
      alt: this.alt,
      quantity: this.quantity,
    };
  }

  /** React to changes in child products */
  private __changedChildProduct() {
    // Reset child attributes lists
    const newProductPrices: number[] = [];
    const newProductImages: ImageDescription[] = [];
    let newChildrenCount = 0;
    if (this.image) {
      newProductImages.push(this.getImageDescription());
    }
    // Create collection functions
    const collectPrices = (p: ProductItem) => {
      if (p.total !== undefined) {
        newProductPrices.push(p.total);
      }
    };
    const collectImages = (p: ProductItem) => {
      newProductImages.push(p.getImageDescription());
    };
    const countChildren = () => (newChildrenCount += 1);
    // Collect information of every child
    this.__onEachChildProduct([collectPrices, collectImages, countChildren]);
    // Update atributes reggarding child products
    this.__childPrices = newProductPrices;
    this.__images = newProductImages;
    this.__childrenCount = newChildrenCount;
    this.__setTotalPrice();
  }

  /** Execute a list of actions against all child products */
  private __onEachChildProduct(actions: ((c: ProductItem) => void)[]) {
    const myChildProducts = this.querySelectorAll('[combined]');
    for (const c of myChildProducts) {
      for (const actOn of actions) {
        actOn(c as ProductItem);
      }
    }
  }
}
