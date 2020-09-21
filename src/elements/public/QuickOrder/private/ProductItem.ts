import '@vaadin/vaadin-text-field/vaadin-integer-field';
import { css, CSSResultArray, html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { ErrorScreen, I18N } from '../../../private/index';
import { ImageDescription, Product } from '../types';
import { Preview } from './Preview';
import { Price } from './Price';

/**
 * This component allows a user to configure a product.
 *
 * The product may be configured using HTML properties or a JS object.
 *
 */
export class ProductItem extends Translatable {
  // A list of product properties as defined in Foxy Cart Documentation

  /** @readonly */
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
            'price price price' / 5.5rem auto 6.5rem;
          grid-column-gap: 1.5rem;
        }

        @media (min-width: 640px) {
          article.product-item {
            grid:
              'picture description description  quantity'
              'picture children children  children'
              'picture price price price' / 5.5rem auto 6.5rem 6.5rem;
            grid-column-gap: 1.5rem;
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

        .product-summary {
          position: relative;
        }

        .product-summary::after {
          content: ' ';
          display: block;
          position: absolute;
          width: 100vw;
          border-bottom: solid thin var(--lumo-shade-10pct);
          left: 0;
          bottom: 0;
        }

        :host([combined]:last-of-type) .product-summary::after {
          content: none;
        }

        .w-preview {
          width: 5.5rem;
        }

        .h-preview {
          height: 5.5rem;
        }
      `,
    ];
  }

  /** @readonly */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'x-error-screen': ErrorScreen,
      'x-preview': Preview,
      'x-price': Price,
      'x-i18n': I18N,
    };
  }

  /** @readonly */
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
      signatures: {
        type: Object,
        converter: value => {
          const v = (JSON.parse(value!) as unknown) as Record<string, string>;
          for (const k of Object.keys(v)) {
            if ((v[k] as string).length != 64) {
              console.error(
                'There is something wrong with the signature. It should have 64 characters.'
              );
            }
          }
          return v;
        },
      },
    };
  }

  public readonly rel = 'product_item';

  /**
   * **Required** the name of the product.
   *
   * **Example:** `"Dog food"`
   */
  public name?: string;

  /**
   * **Required** the price of a unit of this item
   *
   * **Example:** `10`
   */
  public price?: number;

  /**
   * 3-letter lowercase currency code.
   * It is provided by the form if not set.
   *
   * **Example:** `"usd"`
   */
  public currency?: string;

  /**
   * Optional an image url to be displayed in the form.
   */
  public image?: string;

  /**
   * Optional the alt text for the image
   */
  public alt?: string;

  /**
   * Optional an image url to be displayed in the foxy cart once the custumer reaches the cart.
   */
  public url?: string;

  /**
   * Optional product code. This property affects cart UI only.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"ISBN 978-0-12-345678-9"`
   */
  public code?: string | number;

  /**
   * Optional parent code. This property affects cart UI only.
   * It causes Foxy Cart to recognize the parent-child relationship between two products.
   *
   * Nested products set this property automatically.
   *
   * **Example:** `"ISBN 978-0-12-345678-9"`
   */
  public parent_code?: string | number;

  /**
   * **Required** The quantity of this product in the cart.
   */
  public quantity = 1;

  /**
   * Optional quantity max. The maximum number of items of these to be added.
   */
  public quantity_max?: number;

  /**
   * Optional quantity min. The minimum number of items of these to be added.
   */
  public quantity_min?: number;

  /**
   * Optional category. Sets the category this product is in.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"heavy"`
   */
  public category?: string;

  /**
   * Optional expires. Sets the expiration time of this product.
   *
   * Advanced usage only: This property affects cart UI only.
   * This web component will not react to this property.
   *
   * The product cannot be purchased after expiration, but if it is part of a
   * subscription, it remains in the subscription as long as it stands.
   *
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `15`
   */
  public expires?: string;

  /**
   * Optional per product weight. This property affects cart UI only.
   */
  public weight?: number;

  /**
   * Optional. Specify a ship-to address for a specific product.
   *
   * Advanced usage only: This property affects cart UI only.
   * This element does not provide any means for the user to specify this property.
   */
  public shipto?: string;

  /**
   * Optional. An array of child products.
   *
   * Each child product is an object that can have any of the public properties of this element.
   * Child elements will be created accordingly.
   */
  public products: Product[] = [];

  /**
   * Optional. The description for a product.
   */
  public description = '';

  /**
   * Optional open: An Object with key, value pairs where the key is a product
   * attribute and the value is a previously computed HMAC validation code.
   *
   * **Important security information:** this web component does not generate or validates the HMAC validation code.
   * Please, refer to [the Product Verification page](https://wiki.foxycart.com/v/2.0/hmac_validation) for more information and tools for generating the codes.
   */
  public signatures?: Record<string, string>;

  /**
   * Optional open: An Object with key, value pairs where the key is a product
   * attribute and the value is a boolean indicating that the property is editable by the user.
   *
   * **Advanced use only**: this web component does not provide means for the user to alter product attributes.
   *
   * See [Product Verification](https://wiki.foxycart.com/v/2.0/hmac_validation) for more information.
   */
  public open?: Record<string, boolean>;

  /**
   * Optional length.  This property affects cart UI only.
   */
  public length?: number;

  /**
   * Optional width.  This property affects cart UI only.
   */
  public width?: number;

  /**
   * Optional height.  This property affects cart UI only.
   */
  public height?: number;

  /**
   * The total price of this product.
   *
   * It takes into account child products and the quantity.
   */
  public total?: number = this.__computeTotalPrice();

  /** A boolean indicating that this element is a product **/
  protected isProduct = true;

  /** Boolean indicating that this product is a child product */
  protected isChildProduct = false;

  /**
   * A unique id set to the product. Advanced usage only.
   */
  public readonly pid: number = ProductItem.__newId();

  // A list of all existing ids to guarantee unicity
  private static __existingIds: number[] = [];

  private __childProductsObserver?: MutationObserver;

  private __modified = false;

  private __childPrices: number[] = [];

  private __images: ImageDescription[] = [];

  private __childrenCount = 0;

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

  public get value(): Product {
    const r: Partial<Record<keyof Product, unknown>> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      r[this.attributes[i].name] = this.attributes[i].value;
    }
    return r as Product;
  }

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

  public updated(changed: Map<string, unknown>): void {
    if (changed.get('products') != undefined) {
      this.__createProducts();
    }
    this.__setTotalPrice();
    this.dispatchEvent(new Event('change'));
  }

  public render(): TemplateResult {
    if (!this.__isValid()) {
      return html`<x-error-screen type="setup_needed" class="relative"></x-error-screen>`;
    }

    if (this.isChildProduct) {
      const removedStyle = this.quantity ? '' : 'removed opacity-50';
      return html`
        <article
          class="py-s font-lumo text-s leading-m product-summary duration-100 flex justify-between ${removedStyle}"
        >
          <div class="description text-s">
            <h1 class="text-header font-medium">${this.name}</h1>
            <section class="description text-secondary">
              ${this.description ? html`<p>${this.description}</p>` : ''}
              <slot></slot>
            </section>
          </div>

          ${this.quantity < 2
            ? ''
            : html`
                <section class="quantity font-medium text-tertiary whitespace-no-wrap">
                  ${this._t('product.items', { quantity: this.quantity })}
                </section>
              `}
        </article>
      `;
    } else {
      return html`
        <article
          class="font-lumo leading-m product-item duration-100 ${this.quantity
            ? ''
            : 'removed opacity-50'} ${this.__modified ? 'modified' : ''}"
        >
          <x-preview
            class="w-preview h-preview"
            .image=${this.image}
            .quantity=${this.quantity}
            .items=${[...this.querySelectorAll('[combined]')].map(child => ({
              quantity: (child as ProductItem).quantity,
              image: (child as ProductItem).image ?? '',
            }))}
          >
          </x-preview>

          <section class="description min-w-xl w-full mt-l sm:w-auto sm:mt-0">
            <h1 class="text-header font-medium text-l leading-none mb-m">${this.name}</h1>
            <div class="product-description text-secondary text-s">
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
            <vaadin-integer-field
              class="w-full p-0"
              name="quantity"
              @change=${this.__handleQuantity}
              value="${this.quantity}"
              min="0"
              has-controls
            >
            </vaadin-integer-field>

            ${this.quantity > 1 && this.price
              ? html`
                  <div class="price-each text-secondary text-xs text-center mt-xs">
                    ${this.__translateAmount(this.price!)} ${this._t('price.each')}
                  </div>
                `
              : ''}
          </section>

          <section class="child-products w-full ${this.__childrenCount ? 'mt-s' : ''}">
            <slot name="products"></slot>
          </section>
        </article>
      `;
    }
  }

  public getImageDescription(): ImageDescription {
    return {
      src: this.image,
      alt: this.alt,
      quantity: this.quantity,
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
        type AConstructorTypeOf<T> = new (...args: unknown[]) => T;
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
    if (!this.currency) {
      error.push('The product has no currency');
    }
    console.error(...error);
    return !error.length;
  }

  private __translateAmount(amount: number) {
    return amount.toLocaleString(this.lang, {
      minimumFractionDigits: 2,
      currency: this.currency ? this.currency : '',
      style: 'currency',
    });
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
    if (this.code) {
      e.parent_code = this.code;
    }
  }

  /** React to changes in child products */
  private __changedChildProduct() {
    // Reset child attributes lists
    const newProductPrices: number[] = [];
    const newProductImages: ImageDescription[] = [];
    let newChildrenCount = 0;

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

    if (this.image && newProductImages.length === 0) {
      newProductImages.push(this.getImageDescription());
    }

    // Update atributes regarding child products
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
