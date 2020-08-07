import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, property, query, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './ProductItem';
import { Dropdown } from '../../private/index';

import { QuickOrderProduct, ProductGroup } from './types';

import { Section, Page, Code, I18N, Skeleton } from '../../private/index';

export class QuickOrder extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-product': ProductItem,
      'x-skeleton': Skeleton,
      'x-section': Section,
      'x-i18n': I18N,
      'x-page': Page,
      'x-code': Code,
      'x-dropdown': Dropdown,
    };
  }

  private __defaultSubdomain = 'jamstackecommerceexample.foxycart.com';

  @property({ type: String })
  public storeSubdomain = this.__defaultSubdomain;

  @query('form')
  form?: HTMLFormElement;

  constructor() {
    super('quick-order');
  }

  private __productElements: ProductItem[] = [];

  /**
   * 60d = every 60 days.
   * 2w = every two weeks.
   *      For date calculations, 1w = 7d.
   * 1m = every month.
   *      When you use the m unit, FoxyCart will assign billing to the current (or assigned) day of the month, to be repeated every x months.
   *      The date will be moved up when necessary; if set to the 31st, it will process on the 30th of months with 30 days (or 28th/29th of February).
   * 1y = every year.
   * .5m = twice a month.
   *     IMPORTANT: The .5 value only works with m (months). This value will setup bi-monthly subscriptions, once on the start date, and again 15 days later. Example: if you set it to start on the 3rd, it will run on the 3rd and the 18th of each month.
   *
   */
  private __items = [
    'Every Week',
    'Each week',
    'Each day'
  ];

  private handleSubmit = {
    form: this.form,
    handleEvent: () => {
      const fd: any = new FormData(this.form);
      console.table(fd);
      //this.form!.submit();
    },
  };

  @property({ type: Array })
  products: QuickOrderProduct[] = [];

  public render(): TemplateResult {
    return html`
      <x-page>
        <x-section class="products">
          <form>
          <slot></slot>
          ${this.products.map(this.__productsFromArray)}
          </form>
        </x-section>
        <x-section class="actions">
          <x-dropdown
          data-testid="units"
          .items=${this.__items}
        >
        </x-dropdown>
          <vaadin-button
            type="submit"
            role="submit"
            @click=${this.handleSubmit}>
            <x-i18n key="continue"
                    .ns=${this.ns}
                    .lang=${this.lang}></x-i18n>
          </vaadin-button>
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
