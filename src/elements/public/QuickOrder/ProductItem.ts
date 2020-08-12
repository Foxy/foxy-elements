import { Translatable } from '../../../mixins/translatable';
import { QuickOrderProduct, EmptyProduct } from './types';
import { html, property, TemplateResult } from 'lit-element';
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
  }

  private __default_image = {
    src: 'https://www.foxy.io/merchants/shopping-cart-full.svg',
    alt: 'A sketch of a shopping cart with three boxes',
  };

  public value: QuickOrderProduct | undefined;

  @property({ type: String })
  public name?: string;

  @property({ type: String })
  public price?: number;

  @property({ type: String })
  public image?: string;

  @property({ type: String })
  public url?: string;

  @property({ type: String, reflect: true })
  public code?: string | number;

  @property({ type: String })
  public parent_code?: string;

  @property({ type: Number })
  public quantity?: number;

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

  public updated(changed: unknown): void {
    this.dispatchEvent(new Event('change'));
  }

  private handleQuantity = {
    handleEvent: (ev: Event) => {
      this.quantity = Number((ev.target as HTMLInputElement).value);
    },
  };

  private handleExclude = {
    handleEvent: (ev: Event) => {
      console.log(ev.target);
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
        </x-section>
        ${this.__isChildProduct
          ? ''
          : html` <x-section class="actions p-s min-w-3">
              <x-number-field
                @change=${this.handleQuantity}
                value="1"
                min="0"
                has-controls
              ></x-number-field>
              <x-checkbox @change=${this.handleExclude} data-testid="toggle"
                >${this.__vocabulary.remove}</x-checkbox
              >
            </x-section>`}
        <slot></slot>
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
  private __setParentCode() {
    const productParent = this.parentElement;
    if (productParent?.hasAttribute('product')) {
      this.value!.parent_code = (productParent as ProductItem).value?.code;
    }
  }

  /** Captures values set as properties to build the value property of the component.  */
  private __propertyToValue() {
    if (this.value === undefined) {
      if (this.name && this.price) {
        this.value = {
          name: this.name,
          price: this.price,
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
  }

  /**
   * Create child product items from children field.
   */
  private __createChildren() {
    if (this.value && this.value.children && this.value.children.length) {
      for (const p of this.value.children) {
        const product = new ProductItem();
        product.value = p;
        this.appendChild(product);
      }
    }
  }
}
