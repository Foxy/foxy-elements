import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-icons/vaadin-icons';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './ProductItem';
import { Dropdown, Section, Page, Code, I18N, Skeleton } from '../../private/index';

import { QuickOrderChangeEvent } from './QuickOrderChangeEvent';
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
 *
 * Product Items are validated before being submited.
 * Code and Id fields are added automatically if not provided.
 */
export class QuickOrder extends Translatable {
  public static get scopedElements(): Record<string, unknown> {
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

  private get __data() {
    const data = new FormData();
    const productsAdded = this.__formDataFill(data);
    if (productsAdded == 0) return;
    this.__formDataAddSubscriptionFields(data);
    return data;
  }

  private __defaultSubdomain = 'jamstackecommerceexample.foxycart.com';
  private __childProductsObserver?: MutationObserver;

  @property({ type: String })
  public currency?: string;

  @property({ type: Number, attribute: 'total', reflect: true })
  public total = 0;

  @property({ type: String, attribute: 'subdomain' })
  public subdomain = this.__defaultSubdomain;

  /** Frequency related attributes */
  @property({ type: String })
  sub_frequency?: string;

  @property({
    type: String,
    converter: value => {
      if (!QuickOrder.__validDate(value)) {
        console.error('Invalid start date', value);
        return '';
      }
      return value;
    },
  })
  sub_startdate?: string;

  @property({
    type: String,
    converter: value => {
      if (!QuickOrder.__validDateFuture(value)) {
        console.error('Invalid end date', value);
        return '';
      }
      return value;
    },
  })
  sub_enddate?: string;

  @property({
    type: Array,
    converter: value => {
      if (value == null) {
        return [];
      }
      const freqArray = JSON.parse(value);
      if (!Array.isArray(freqArray)) {
        console.error('Invalid frequency', `Frequency options must be an array.`);
        return [];
      }
      for (const f of freqArray) {
        if (!QuickOrder.__validFrequency(f)) {
          console.error(
            'Invalid frequency',
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

  @property({ type: Array })
  products: QuickOrderProduct[] = [];

  /**
   * An array with both products created as elements and created parameter
   */
  private __productElements: Array<ProductItem>;

  constructor() {
    super('quick-order');
    this.__productElements = [];
    this.__childProductsObserver = new MutationObserver(this.__observeChildren.bind(this));
    this.__childProductsObserver.observe(this, {
      childList: true,
      attributes: false,
      subtree: true,
    });
    this.updateComplete.then(() => {
      this.__createProductsFromProductArray();
      this.__checkSubdomain();
      this.__findProductElements();
      this.__computeTotalPrice();
    });
  }

  public render(): TemplateResult {
    return html`
      <x-page>
        <form>
          <x-section class="products">
            <slot></slot>
          </x-section>
          ${this.frequencyOptions.length
            ? html` <x-section class="subscription">
                <x-dropdown
                  data-testid="units"
                  @change=${this.__handleFrequency}
                  .items=${this.frequencyOptions.map(e => `${e.number} ${e.period}`)}
                >
                </x-dropdown>
              </x-section>`
            : ''}
        </form>
        <x-section class="summary">
          <div class="total">${this.__translateAmount(this.total)}</div>
        </x-section>
        <x-section class="actions">
          <vaadin-button type="submit" role="submit" @click=${this.handleSubmit}>
            <iron-icon icon="vaadin:cart" slot="prefix"></iron-icon>
            <x-i18n key="continue" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          </vaadin-button>
        </x-section>
      </x-page>
    `;
  }

  /** Create child ProductItems from products array
   */
  private __createProductsFromProductArray() {
    const productsSection = this.querySelector('.products');
    for (const p of this.products) {
      const newProduct = new ProductItem();
      newProduct.value = p;
      productsSection!.appendChild(newProduct);
    }
  }

  public updated(): void {
    this.dispatchEvent(new QuickOrderChangeEvent(this.__data!));
  }

  /**
   * Handles the user input for frequenty field
   * - converts week, year, day and month into first letter only
   * - removes spaces
   * - removes leading zeroes
   * - validates input as propper frequency option
   **/
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

  /**
   * Handles the submission of the form
   *
   * - creates a FormData
   * - fill the FormData with product values
   * - add order wide fields to the FormData
   * - submits the form
   */
  private handleSubmit = {
    handleEvent: () => {
      const request = new XMLHttpRequest();
      request.open('POST', `https://${this.subdomain}/cart`);
      request.send(this.__data);
    },
  };

  /**
   * Adds a signature to a post field
   *
   * This method does not compute the signature. It must be provided.
   *
   * @argument name The name of the field
   * @argument signature The computed signature to add to the field
   * @argument open Whether the field value is customized by the user
   * @return signedName the name of the field with the signature
   */
  private __addSignature(name: string, signature: string, open?: string | boolean): string {
    // Check for malformed signature
    if (signature.length != 64) {
      if (name.match(/(\d+:)?name$/)) {
        console.error('Product', name, 'Wrong signature: ', signature);
      } else {
        console.error('Wrong signature: ', signature);
      }
      throw new Error('There is something wrong with the signature. It should have 64 characters.');
    }
    return `${name}||${signature}${open ? '||open' : ''}`;
  }

  /**
   * Add all products from this.__productElements to a FormData
   *
   * - Iterate of products in productElements
   * - Add valid products to Form Data
   *
   * @argument fd the FormData instance to fill
   * @return added  the number of products added
   **/
  private __formDataFill(fd: FormData): number {
    let added = 0;
    this.__productElements.forEach(e => {
      if (e.value && this.__validProduct(e.value as QuickOrderProduct)) {
        this.__formDataAddProduct(fd, e.value);
        added++;
      } else {
        console.error('Invalid product', e.value);
      }
    });
    return added;
  }

  /** Adds a product to a form data */
  private __formDataAddProduct(fd: FormData, p: QuickOrderProduct): void {
    if (!p['product-id']) {
      throw new Error('Attempt to convert a product without a propper ID');
    }
    const rec = p as Record<string, unknown>;
    for (const key of Object.keys(rec)) {
      if (key !== 'product-id') {
        const fieldValue: unknown = rec[key];
        if (!Array.isArray(fieldValue)) {
          fd.append(`${rec['product-id']}:${key}`, `${fieldValue}`);
        }
      }
    }
  }

  /** Adds subscription fields to a FormData */
  private __formDataAddSubscriptionFields(fd: FormData): void {
    if (this.sub_frequency) {
      fd.append('sub_frequency', this.sub_frequency!);
      if (QuickOrder.__validDate(this.sub_startdate)) {
        fd.append('sub_startdate', this.sub_startdate!);
      }
      if (QuickOrder.__validDateFuture(this.sub_enddate)) {
        fd.append('sub_enddate', this.sub_enddate!);
      }
    }
  }

  /**
   * Validates a string for subscription start date or end date according to
   * https://wiki.foxycart.com/v/2.0/products#subscription_product_options
   */
  private static __validDate(strDate: string | null | undefined): boolean {
    if (strDate === null || strDate === undefined) {
      return false;
    }
    if (strDate.match(/^(\d{1,2}|\d{8})$/)) {
      if (strDate.match(/^\d{2}$/)) {
        if (Number(strDate) > 31) {
          return false;
        }
      }
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
  private static __validDateFuture(strDate: string | null | undefined): boolean {
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
  private static __validFrequency(strFrequency: string | null | undefined): boolean {
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

  /** Subscribe to late inserted products. */
  private __observeChildren(mutationList: MutationRecord[]): void {
    mutationList.forEach(m => {
      if (m.type == 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.DOCUMENT_NODE) {
            const e = n as HTMLElement;
            e.addEventListener('change', this.__productChange);
          }
        });
      }
    });
    this.__findProductElements();
    this.__computeTotalPrice();
  }

  /** Updates the form on product change */
  private __productChange(): void {
    this.__computeTotalPrice();
  }

  private __computeTotalPrice(): void {
    let total = 0;
    this.__productElements.forEach(e => {
      const prod = e as ProductItem;
      if (prod.total) {
        total += Number(prod.total);
      }
    });
    this.total = Number(total.toFixed(2));
  }

  /** Find product elements identified with custom attribute data-product */
  private __findProductElements(): void {
    this.__productElements = [];
    this.querySelectorAll('[data-product]').forEach((e: Element) => {
      const p = e as ProductItem;
      p.addEventListener('change', this.__productChange.bind(this));
      if (!p.currency) {
        p.currency = this.currency;
      }
      this.__productElements.push(p);
    });
  }

  /** Subdomain should not be empty */
  private __checkSubdomain(): void {
    if (this.subdomain === this.__defaultSubdomain) {
      console.error(
        "No 'store-subdomain' atrribute was provided. It is necessary to provide this attribute to use it with your store."
      );
    }
  }

  /** Checks if product has quantity and price */
  private __validProduct(p: QuickOrderProduct): boolean {
    return !!(p.quantity && p.quantity > 0 && p.price && p.price >= 0);
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 0,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return '';
    }
  }
}
