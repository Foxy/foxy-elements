import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-icons/vaadin-icons';
import { parseDuration } from '../../../utils/parse-duration';
import { html, css, CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { ProductItem } from './private/ProductItem';
import { Dropdown, Section, Page, Code, I18N, Skeleton, ErrorScreen } from '../../private/index';

import { QuickOrderChangeEvent, QuickOrderResponseEvent, QuickOrderSubmitEvent } from './events';
import { Product } from './types';

export { ProductItem };
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

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        ::slotted([product].last\\:border-b-0:last-child) {
          border-bottom-width: 0 !important;
        }
      `,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      currency: { type: String },
      total: { type: Number, attribute: 'total', reflect: true },
      store: { type: String, attribute: 'store' },
      sub_frequency: { type: String },
      sub_startdate: {
        type: String,
        converter: value => {
          if (!QuickOrder.__validDate(value)) {
            console.error('Invalid start date', value);
            return '';
          }
          return value;
        },
      },
      sub_enddate: {
        type: String,
        converter: value => {
          if (!QuickOrder.__validDateFuture(value)) {
            console.error('Invalid end date', value);
            return '';
          }
          return value;
        },
      },
      frequencies: {
        converter: (value, type) => {
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
          return freqArray.filter(QuickOrder.__validFrequency);
        },
      },
      products: { type: Array },
      __hasValidProducts: {},
    };
  }

  public store?: string;

  public total = 0;

  public currency?: string;

  /** Frequency related attributes */
  public sub_frequency?: string;

  public sub_startdate?: string;

  public sub_enddate?: string;

  public frequencies: string[] = [];

  public products: Product[] = [];

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

  private __childProductsObserver?: MutationObserver;

  private __hasValidProducts = false;

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
      <form class="shadow-xl max-w-xl rounded-l mx-auto sm:my-m p-s sm:p-l">
        <section class="products">
          <slot></slot>
        </section>
        <x-section class="actions w-full sm:w-auto flex justify-end">
          <div
            class="grid grid-flow-row grid-rows-2 grid-cols-1 sm:grid-rows-1 sm:grid-flow-col sm:grid-cols-2 gap-m"
          >
            ${this.frequencies && this.frequencies.length
              ? html` <div class="subscription">
                  <x-dropdown
                    type="text"
                    name="frequency"
                    lang=${this.lang}
                    .value=${'0'}
                    .items=${this.frequencies.concat(['0'])}
                    .getText=${this.__translateFrequency.bind(this)}
                    @change=${this.__handleFrequency}
                  >
                  </x-dropdown>
                </div>`
              : ''}
            <div class="sm:col-start-2">
              <vaadin-button
                class="w-full "
                theme="primary"
                role="submit"
                ?disabled=${!this.__hasValidProducts}
                @click=${this.handleSubmit}
              >
                <span class="total font-normal"
                  >${this.__submitBtnText(this.__translateAmount(this.total))}</span
                >
              </vaadin-button>
            </div>
          </div>
        </x-section>
      </form>
    `;
  }

  /** Add new products */
  public addProducts(newProducts: Product[]): void {
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
  public removeProducts(productIds: number[]): void {
    this.__removeProductsFromProductArray((p: ProductItem) => productIds.includes(p.pid));
  }

  public updated(changedProperties: Map<string, any>): void {
    if (changedProperties.get('products') != undefined) {
      this.__removeProductsFromProductArray();
      this.__createProductsFromProductArray();
    }
    const newHasValidProducts = !!this.__data;
    if (newHasValidProducts != this.__hasValidProducts) {
      this.__hasValidProducts = newHasValidProducts;
    }
    this.dispatchEvent(new QuickOrderChangeEvent(this.__data!));
  }

  public createProduct(p: Product): Element {
    const scopedProduct = (this.constructor as any).getScopedTagName('x-product');
    const newProduct = document.createElement(scopedProduct);
    newProduct.value = { ...p, currency: this.currency };
    return newProduct;
  }

  private get __data(): FormData | null {
    const data = new FormData();
    const productsAdded = this.__formDataFill(data);
    if (productsAdded == 0) return null;
    this.__formDataAddSubscriptionFields(data);
    return data;
  }

  private __submitBtnText(value: string): string {
    if (!this.sub_frequency || this.sub_frequency == '0') {
      return this._t('checkout.buy', { value });
    } else {
      const duration = parseDuration(this.sub_frequency);
      return this._t('checkout.subscribe', {
        value,
        period: this._t(duration.units).toLowerCase(),
      });
    }
  }

  /**
   * An array with both products created as elements and created parameter
   */
  private get __productElements(): NodeListOf<ProductItem> {
    return this.querySelectorAll('[product]');
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

  /**
   * Adds a product to a form data
   *
   * @argument {FormData} fd the FormData to which the product will be added
   * @argument {Product} the product to add
   **/
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

  /**
   * Adds subscription fields to a FormData
   *
   * @argument {FormData} fd the FormData to which subscription fields will be added
   **/
  private __formDataAddSubscriptionFields(fd: FormData): void {
    if (this.sub_frequency) {
      fd.append('sub_frequency', this.sub_frequency!);
      if (this.sub_startdate) {
        fd.append('sub_startdate', this.sub_startdate!);
      }
      if (this.sub_enddate) {
        fd.append('sub_enddate', this.sub_enddate!);
      }
    }
  }

  /**
   * Validates a string for subscription start date or end date according to
   *
   *
   * @argument strDate the date as a string to be used as start or end date.
   *
   * @see https://wiki.foxycart.com/v/2.0/products#subscription_product_options
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
   * TODO: This same method is available in Donation Form
   */
  private __translateFrequency(frequency: string) {
    if (frequency.startsWith('0')) return this._t('frequency_once');
    if (frequency === '.5m') return this._t('frequency_0_5m');
    const { count, units } = parseDuration(frequency);
    return this._t('frequency', {
      units: this._t(units, { count }),
      count,
    });
  }

  /** Subscribe to late inserted products. */
  private __observeChildren(mutationList: MutationRecord[]): void {
    mutationList.forEach(m => {
      if (m.type == 'childList') {
        m.addedNodes.forEach(n => {
          const e = n as HTMLElement;
          e.addEventListener('change', this.__productChange.bind(this));
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
      p.classList.add('border-b', 'border-shade-5', 'last:border-b-0');
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
}
