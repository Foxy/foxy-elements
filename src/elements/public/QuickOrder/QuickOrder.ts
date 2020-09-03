import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-icons/vaadin-icons';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './ProductItem';
import { Dropdown, Section, Page, Code, I18N, Skeleton, ErrorScreen } from '../../private/index';

import { QuickOrderChangeEvent, QuickOrderResponseEvent, QuickOrderSubmitEvent } from './events';
import { Product } from './types';

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
      'x-error-screen': ErrorScreen,
      'x-i18n': I18N,
      'x-page': Page,
      'x-code': Code,
      'x-dropdown': Dropdown,
    };
  }

  private get __data(): FormData | null {
    const data = new FormData();
    const productsAdded = this.__formDataFill(data);
    if (productsAdded == 0) return null;
    this.__formDataAddSubscriptionFields(data);
    return data;
  }

  private __childProductsObserver?: MutationObserver;

  @property({ type: String })
  public currency?: string;

  @property({ type: Number, attribute: 'total', reflect: true })
  public total = 0;

  @property({ type: String, attribute: 'store' })
  public store?: string;

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
      if (!value) {
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
      return freqArray;
    },
  })
  public frequencies: string[] = [];

  @property({ type: Array })
  products: Product[] = [];

  /**
   * An array with both products created as elements and created parameter
   */
  private get __productElements(): NodeListOf<ProductItem> {
    return this.querySelectorAll('[product]');
  }

  constructor() {
    super('quick-order');
    this.__childProductsObserver = new MutationObserver(this.__observeChildren.bind(this));
    this.__childProductsObserver.observe(this, {
      childList: true,
      attributes: false,
      subtree: true,
    });
    this.updateComplete.then(() => {
      this.__createProductsFromProductArray();
      this.__acknowledgeProductElements();
      this.__computeTotalPrice();
    });
  }

  public render(): TemplateResult {
    if (!this.store || !this.currency) {
      return html`<x-error-screen type="setup_needed" class="relative"></x-error-screen>`;
    }
    return html`
      <form class="shadow-xl max-w-xl mx-auto m-m ">
        <section class="products">
          <slot></slot>
        </section>
        <x-section class="actions w-full sm:w-auto">
          <div class="flex justify-end">
            ${this.frequencies && this.frequencies.length
              ? html` <div class="subscription flex-1 p-s flex-grow sm:flex-grow-0">
                  <x-dropdown
                    type="text"
                    name="frequency"
                    lang=${this.lang}
                    .value=${'freq.just_this_once'}
                    .items=${this.frequencies.concat(['freq.just_this_once'])}
                    .getText=${(v: string) => {
                      const friendly = this.__friendlyFreq(v);
                      return `${friendly.number ? friendly.number + ' ' : ''}${friendly.period}`;
                    }}
                    @change=${this.__handleFrequency}
                  >
                  </x-dropdown>
                </div>`
              : ''}
            <div class="flex-1 p-s flex-grow sm:flex-grow-0">
              <vaadin-button class="w-full" type="button" role="submit" @click=${this.handleSubmit}>
                <iron-icon icon="vaadin:cart" slot="prefix"></iron-icon>
                <x-i18n key="form.continue" .ns=${this.ns} .lang=${this.lang}></x-i18n>
                <span class="total font-bold text-primary"
                  >${this.__translateAmount(this.total)}</span
                >
              </vaadin-button>
            </div>
          </div>
        </x-section>
      </form>
    `;
  }

  /** Add new products */
  public addProducts(newProducts: Product[]) {
    for (const p of newProducts) {
      const newProduct = this.createProduct(p);
      this.appendChild(newProduct);
      this.__acknowledgeProductElement(newProduct as ProductItem);
    }
    if (this.products != newProducts) {
      this.products.concat(newProducts);
    }
  }

  /** Remove products */
  public removeProducts(productIds: number[]) {
    this.__removeProductsFromProductArray((p: ProductItem) => productIds.includes(p.pid));
  }

  /** Create child ProductItems from products array
   */
  private __createProductsFromProductArray() {
    this.addProducts(this.products);
  }

  /** Removes product items from the form based on a condition */
  private __removeProductsFromProductArray(condition = (e: ProductItem) => true) {
    this.__productElements.forEach(p => {
      if (condition(p)) {
        p.remove();
      }
    });
  }

  public updated(changedProperties: Map<string, any>): void {
    if (changedProperties.get('products') != undefined) {
      this.__removeProductsFromProductArray();
      this.__createProductsFromProductArray();
    }
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
      } else {
        this.sub_frequency = '';
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
      this.dispatchEvent(new QuickOrderSubmitEvent(this.__data!));
      if (this.__data !== null) {
        const request = new XMLHttpRequest();
        request.open('POST', `https://${this.store}/cart`, true);
        request.onload = (e: ProgressEvent<EventTarget>) => {
          this.dispatchEvent(new QuickOrderResponseEvent(e));
        };
        request.send(this.__data);
      }
    },
  };

  public onSubmissionResponse(e: ProgressEvent<EventTarget>) {
    console.log(e);
  }

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
    this.__productElements?.forEach(e => {
      if (this.__validProduct(e.value as Product)) {
        this.__formDataAddProduct(fd, e.value);
        added++;
      } else {
        console.error('Invalid product', e.value);
      }
    });
    return added;
  }

  /** Adds a product to a form data */
  private __formDataAddProduct(fd: FormData, p: Product): void {
    const idKey = 'pid';
    const reservedAttributes = [idKey, 'signatures', 'currency'];
    if (!p[idKey]) {
      throw new Error('Attempt to convert a product without a propper ID');
    }
    const rec = p as Record<string, unknown>;
    for (let key of Object.keys(rec)) {
      if (!reservedAttributes.includes(key)) {
        const fieldValue: unknown = rec[key];
        // Adds a signature if possible
        if (p.code && p.signatures && p.signatures[key]) {
          key = this.__addSignature(key, p.signatures[key], p.open && p.open[key]);
        }
        // Prepend the id
        if (!Array.isArray(fieldValue)) {
          fd.append(`${rec[idKey]}:${key}`, `${fieldValue}`);
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
  private __friendlyFreq(value: string): FrequencyOption {
    if (value == 'freq.just_this_once') {
      return {
        number: 0,
        period: this._t('freq.just_this_once'),
        periodCode: '',
      };
    }
    const matches = value.match(/^(\.?\d+)([dwmy])$/);
    if (!matches) {
      throw new Error(this._t('error.invalid_frequency'));
    }
    const friendlyTimeSpan: { [name: string]: string } = {
      d: this._t('freq.day'),
      w: this._t('freq.week'),
      m: this._t('freq.month'),
      y: this._t('freq.year'),
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
    this.__acknowledgeProductElements();
    this.__computeTotalPrice();
  }

  /** Updates the form on product change */
  private __productChange(): void {
    this.__computeTotalPrice();
  }

  private __computeTotalPrice(): void {
    let total = 0;
    this.__productElements?.forEach(e => {
      const prod = e as ProductItem;
      if (prod.total) {
        total += Number(prod.total);
      }
    });
    this.total = Number(total.toFixed(2));
  }

  private __acknowledgeProductElements(): void {
    this.__productElements?.forEach((e: Element) => {
      const p = e as ProductItem;
      this.__acknowledgeProductElement(p);
    });
  }

  private __acknowledgeProductElement(p: ProductItem) {
    p.addEventListener('change', this.__productChange.bind(this));
    if (!p.currency) {
      p.currency = this.currency;
    }
  }

  /** Checks if product has quantity and price */
  private __validProduct(p: Product): boolean {
    return !!(
      p &&
      p.pid &&
      p.quantity &&
      p.quantity > 0 &&
      (p.price || p.price === 0) &&
      p.price >= 0
    );
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 2,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return '';
    }
  }

  createProduct(p: Product): Element {
    const newProduct = new ProductItem();
    newProduct.value = { ...p, currency: this.currency };
    return newProduct;
  }
}
