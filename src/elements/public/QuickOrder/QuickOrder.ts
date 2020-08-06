import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './ProductItem';

import { QuickOrderProduct, ProductGroup } from './types';

import { Section, Page, Code, I18N, Skeleton } from '../../private/index';

export class QuickOrder extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'x-product': ProductItem,
      'x-skeleton': Skeleton,
      'x-section': Section,
      'x-i18n': I18N,
      'x-page': Page,
      'x-code': Code,
    };
  }

  private __defaultSubdomain = 'jamstackecommerceexample.foxycart.com';

  @property({ type: String })
  public storeSubdomain = this.__defaultSubdomain;

  constructor() {
    super('quick-order');
  }

  private __productElements: ProductItem[] = [];

  @property({ type: Array })
  products: QuickOrderProduct[] = [];

  public render(): TemplateResult {
    return html`
      <x-page>
        <x-section class="products">
          <slot></slot>
          ${this.products.map(this.__productsFromArray)}
        </x-section>
      </x-page>
    `;
  }

  /** Renders either a group or a single product */
  private __productsFromArray(p: QuickOrderProduct | ProductGroup) {
    if (p.products && Array.isArray(p.products) && p.products.length) {
      return html` <article
        data-product="true"
        class="product group  border border-contrast-10 rounded p-m"
      >
        ${p.products.map((i: QuickOrderProduct) => html`<x-product .value=${i}></x-product>`)}
      </article>`;
    } else {
      return html`<x-product .value=${p}></x-product>`;
    }
  }

  private __findProducts() {
    this.querySelectorAll('[data-product=true]').forEach(p =>
      this.__productElements.push(p as ProductItem)
    );
  }
}
