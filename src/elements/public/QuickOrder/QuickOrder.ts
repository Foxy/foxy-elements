import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-icons/vaadin-icons';
import { html, property, query, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './ProductItem';
import { Dropdown, Section, Page, Code, I18N, Skeleton } from '../../private/index';

import { QuickOrderProduct } from './types';

export interface FrequencyOption {
  number: number;
  period: string;
  periodCode: string;
}

/**
 * This Quick Order Form accepts products either as a JS array or as child elements of type ProductItem
 *
 * Product Elements are found by retrieving both product-item elements within and without shadow root.
 */
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

  @property({ type: String })
  sub_frequency?: string;

  @property({ type: String })
  sub_startdate?: string;

  @property({ type: String })
  sub_enddate?: string;

  @query('form')
  form?: HTMLFormElement;

  /**
   * An array with both products created as elements and created parameter
   */
  private get __productElements(): Array<ProductItem> {
    const insideShadow = this.shadowRoot?.querySelectorAll('[product]');
    const outsideShadow = this.querySelectorAll('[product]');
    const result: Array<ProductItem> = [];
    insideShadow?.forEach(e => {
      result.push(e as ProductItem);
    });
    outsideShadow?.forEach(e => {
      result.push(e as ProductItem);
    });
    return result;
  }

  constructor() {
    super('quick-order');
  }

  private __handleFrequency = {
    handleEvent: (ev: CustomEvent) => {
      const newfrequency = (ev as CustomEvent).detail
        .replace(/([wydm])\w*/, '$1')
        .replace(/ /g, '')
        .replace(/^0/, '');
      if (QuickOrder.__validFrequency(newfrequency)) {
        this.sub_frequency = newfrequency;
      }
    },
  };

  private handleSubmit = {
    form: this.form,
    handleEvent: () => {
      const fd: FormData = new FormData(this.form);
      this.__productElements?.forEach(e => {
        if (e.value) {
          this.__fillFormData(fd, e.value);
        }
      });
      if (this.sub_frequency) {
        fd.append('sub_frequency', this.sub_frequency!);
        if (QuickOrder.__validDate(this.sub_startdate)) {
          fd.append('sub_startdate', this.sub_startdate!);
        }
        if (QuickOrder.__validDateFuture(this.sub_enddate)) {
          fd.append('sub_enddate', this.sub_enddate!);
        }
      }
      fd.forEach(console.log);
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
            ${this.products.map(p => html`<x-product .value=${p}></x-product>`)}
          </form>
        </x-section>
        <x-section class="actions">
          ${this.frequencyOptions.length
            ? html`<x-dropdown
                data-testid="units"
                @change=${this.__handleFrequency}
                .items=${this.frequencyOptions.map(e => `${e.number} ${e.period}`)}
              >
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

  /**
   * Fills a FormData object with values from a QuickOrder Product
   *
   * Prefixes names with the id of the product
   */
  private __fillFormData(fd: FormData, p: QuickOrderProduct) {
    if (!p.id) {
      throw new Error('Attempt to convert a product without a propper ID');
    }
    const rec = p as Record<string, unknown>;
    for (const key of Object.keys(rec)) {
      if (key !== 'id') {
        const fieldValue: unknown = rec[key];
        if (!Array.isArray(fieldValue)) {
          fd.append(`${rec['id']}:${key}`, `${fieldValue}`);
        }
      }
    }
  }

  /**
   * Validates a string for subscription start date or end date according to
   * https://wiki.foxycart.com/v/2.0/products#subscription_product_options
   */
  private static __validDate(strDate: string | null | undefined) {
    if (strDate === null || strDate === undefined) {
      return false;
    }
    if (strDate.match(/^(\d{1,2}|\d{8})$/)) {
      return true;
    }
    if (!strDate.match(/^.5m/) && QuickOrder.__validFrequency(strDate)) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a string date is in the future
   */
  private static __validDateFuture(strDate: string | null | undefined) {
    let valid = false;
    if (QuickOrder.__validDate(strDate)) {
      if (strDate!.match(/^\d{8}/)) {
        const now = new Date();
        valid = now.toISOString().replace(/(-|T.*)/g, '') <= strDate!;
      } else {
        valid = true;
      }
    }
    return valid;
  }

  /**
   * Checks if a frequency complies with possible values
   */
  private static __validFrequency(strFrequency: string | null | undefined) {
    if (!strFrequency) {
      return false;
    } else {
      return !!strFrequency.match(/^(\.5m|\d+[dwmy])$/);
    }
  }

  /**
   * Returns an object with human friendly values for a given frequency
   */
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
}
