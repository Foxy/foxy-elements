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
  private static productProperties = Object.keys(EmptyProduct);

  public static get scopedElements() {
    return {
      'x-checkbox': Checkbox,
      'x-section': Section,
      'x-group': Group,
      'x-number-field': customElements.get('vaadin-number-field'),
      'x-i18n': I18N,
    };
  }

  private static __existingIds: number[] = [];

  private static __newId() {
    // Get the maximum value
    const newId =
      ProductItem.__existingIds.reduce((accum, curr) => (curr > accum ? curr : accum), 0) + 1;
    ProductItem.__addCustomId(newId);
    return newId;
  }

  private static __addCustomId(customId: string | number) {
    const newId = Number(customId);
    if (ProductItem.__existingIds.includes(newId)) {
      throw new Error('Attempt to create two different products with the same id');
    }
    ProductItem.__existingIds.push(newId);
  }

  private __vocabulary = {
    remove: 'Remove',
  };

  public constructor() {
    super('quick-order');
  }

  private get __isChildProduct() {
    return !!this.value?.parent_code;
  }

  /** LitElement life cicle */
  public firstUpdated(): void {
    this.__propertyToValue();
    this.__setId();
    this.__setCode();
    this.__setParentCode();
    this.__createChildren();
    this.__computeTotalPrice();
  }

  private __default_image = {
    src: 'https://www.foxy.io/merchants/shopping-cart-full.svg',
    alt: 'A sketch of a shopping cart with three boxes',
  };

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
  public quantity?: number = 1;

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

  @property({ type: Boolean, reflect: true })
  product = true;

  @property({ type: Array })
  open = [];

  @queryAll('[product]')
  public childProducts?: NodeListOf<ProductItem>;

  public updated(changed: unknown): void {
    this.dispatchEvent(new Event('change'));
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
      <article class="product flex flex-row flex-wrap justify-between overflow-hidden">
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
      ProductItem.__addCustomId(this.value!.id);
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
    if (productParent?.hasAttribute('product')) {
      this.value!.parent_code = (productParent as ProductItem).value?.code;
    }
  }

  /** Captures values set as properties to build the value property of the component.  */
  private __propertyToValue(): void {
    if (this.value === undefined) {
      if (this.name && this.price) {
        this.value = {
          name: this.name,
          price: this.price,
          quantity: 1,
        };
      } else {
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
    if (this.value && !this.value.quantity) {
      this.value.quantity = 1;
      this.quantity = 1;
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
    const myChildProducts = this.querySelectorAll('[product]');
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
}
