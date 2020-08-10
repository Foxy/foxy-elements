import { Translatable } from '../../../mixins/translatable';
import { QuickOrderProduct } from './types';
import { html, property } from 'lit-element';
import { Checkbox, Section, Group, I18N } from '../../private/index';

/**
 * This component allows a user to configure a product.
 *
 * The product may be configured using HTML properties or a JS object.
 * Relevant properties are mapped to a QuickOrderProduct object that is used by
 * the QuickOrderForm.
 */
export class ProductItem extends Translatable {
  public static get scopedElements() {
    return {
      'x-checkbox': Checkbox,
      'x-section': Section,
      'x-group': Group,
      'x-number-field': customElements.get('vaadin-number-field'),
      'x-i18n': I18N,
    };
  }

  /** Avoid default shadow root */
  createRenderRoot(): ProductItem {
    return this;
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

  @property({ type: String })
  public code?: string;

  @property({ type: String })
  public parent_code?: string;

  @property({ type: String })
  public quantity?: number;

  @property({ type: String })
  public quantity_max?: number;

  @property({ type: String })
  public quantity_min?: number;

  @property({ type: String })
  public category?: string;

  @property({ type: String })
  public expires?: string;

  @property({ type: String })
  public weight?: string;

  @property({ type: String })
  public length?: number;

  @property({ type: String })
  public width?: number;

  @property({ type: String })
  public height?: number;

  @property({ type: String })
  public shipto?: string;

  @property({ type: String })
  alt?: string;

  @property({ type: Boolean, reflect: true })
  product = true;

  public render() {
    return html`
      <article
        data-product="true"
        class="product flex flex-row flex-wrap justify-between overflow-hidden"
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
        </x-section>
        ${this.__inGroup
          ? ''
          : html` <x-section class="actions p-s min-w-3">
              <x-number-field value="1" min="0" has-controls></x-number-field>
              <x-checkbox data-testid="toggle">${this.__vocabulary.remove}</x-checkbox>
            </x-section>`}
      </article>
    `;
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
    const productProperties = [
      'name',
      'price',
      'image',
      'url',
      'code',
      'parent_code',
      'quantity',
      'quantity_max',
      'quantity_min',
      'category',
      'expires',
      'weight',
      'length',
      'width',
      'height',
      'shipto',
      'id',
      'alt',
    ];
    for (const i of productProperties) {
      if (!(this.value![i] as string | null)) {
        this.value![i] = this.getAttribute(i);
      }
    }
  }
}
