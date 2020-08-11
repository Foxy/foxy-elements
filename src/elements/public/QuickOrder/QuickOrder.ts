import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-icons/vaadin-icons';
import { html, property, query, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './ProductItem';
import { Dropdown, Section, Page, Code, I18N, Skeleton } from '../../private/index';

import { QuickOrderProduct, ProductGroup } from './types';

export interface FrequencyOption {
  number: number;
  period: string;
  periodCode: string;
}

export class QuickOrder extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'iron-icon': customElements.get('iron-icon'),
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

  @property({
    type: Array,
    converter: value => {
      if (value == null) {
        return [];
      }
      const freqArray = JSON.parse(value);
      if (!Array.isArray(freqArray)) {
        console.error(`Frequency options must be an array.`);
        return [];
      }
      for (const f of freqArray) {
        if (!QuickOrder.__validFrequency(f)) {
          console.error(
            `Invalid frequency option.
              Please, check https://wiki.foxycart.com/v/2.0/products#subscription_product_options for possible values.
              Each frequency must be a in the format:
              - 1d (a number followed by d, for day)
              - 1w (a number followed by w, for week)
              - 1m (a number followed by m, for month)
              - 1y (a number followed by y, for year)
              or .5m (no other decimals are allowed, and this is only for months)
              `,
            f
          );
          return [];
        }
      }
      return freqArray.map(e => QuickOrder.__friendlyFreq(e));
    },
  })
  public frequencyOptions: FrequencyOption[] = [];

  @query('form')
  form?: HTMLFormElement;

  constructor() {
    super('quick-order');
  }

  private static __friendlyFreq(value: string): FrequencyOption {
    const matches = value.match(/^(\.?\d+)([dwmy])$/);
    if (!matches) {
      throw new Error('Invalid frequency string');
    }
    const friendlyTimeSpan: { [name: string]: string } = {
      d: 'day',
      w: 'week',
      m: 'month',
      y: 'year',
    };
    return {
      number: Number(matches[1]),
      period: friendlyTimeSpan[matches[2]],
      periodCode: matches[2],
    };
  }

  /**
   * Checks if a frequency complies with possible values
   */
  private static __validFrequency(strFrequency: string | null) {
    if (strFrequency === null) {
      return false;
    } else {
      return !!strFrequency.match(/^(\.5m|\d+[dwmy])$/);
    }
  }

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
          ${this.frequencyOptions.length
            ? html`<x-dropdown .items=${this.frequencyOptions.map(e => `${e.number} ${e.period}`)}>
              </x-dropdown>`
            : ''}
          <vaadin-button type="submit" role="submit" @click=${this.handleSubmit}>
            <iron-icon icon="vaadin:user-heart" slot="prefix"></iron-icon>
            <x-i18n key="continue" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          </vaadin-button>
        </x-section>
      </x-page>
    `;
  }

  /** Renders either a group or a single product */
  private __productsFromArray(p: QuickOrderProduct | ProductGroup) {
    if (p.products && Array.isArray(p.products) && p.products.length) {
      return html` <article
        data-product-group="true"
        class="product group  border border-contrast-10 rounded p-m"
      >
        ${(p.products as QuickOrderProduct[]).map(
          (i: QuickOrderProduct) => html`<x-product .value=${i}></x-product>`
        )}
      </article>`;
    } else {
      return html`<x-product .value=${p}></x-product>`;
    }
  }
}
