import '@vaadin/vaadin-button';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { parseDuration } from '../../../utils/parse-duration';
import { Dropdown, ErrorScreen } from '../../private/index';
import { QuickOrderChangeEvent, QuickOrderResponseEvent, QuickOrderSubmitEvent } from './events';
import { ProductItem } from './private/ProductItem';
import { Product } from './types';

export { ProductItem };

/**
 * A custom element providing a customizable donation form.
 *
 * @fires QuickOrder#change - changed form data.
 * @fires QuickOrder#submit - submitted form data
 * @fires QuickOrder#load -  ProgressEvent instance with server response
 *
 * @slot products - products to be added to the form.
 *
 * @element foxy-quick-order
 *
 */
export class QuickOrder extends Translatable {
  /** @readonly */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-error-screen': ErrorScreen,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-dropdown': Dropdown,
      'x-product': ProductItem,
    };
  }

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      currency: { type: String },
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
      __hasValidProducts: { attribute: false },
      __total: { attribute: false },
    };
  }

  /**
   * **Required** store subdomain, It is similar to mystore.foxycart.com,
   * unless you use a custom subdomain.
   *
   * **Examples:** `"mystore.foxycart.com"` `"custom.mycoolstore.com"`
   */
  public store?: string;

  /**
   * **Required** 3-letter lowercase currency code.
   *
   * **Example:** `"usd"`
   */
  public currency?: string;

  /**
   * Optional frequency string encoded as count (integer) + units (one of: `d`
   * for days, `w` for weeks, `m` for months, `y` for years). A special value
   * for twice a month is also supported: `.5m`. If set, the form will create a
   * subscription with the specified frequency in the cart.
   *
   * **Example:** `"1m"`
   */
  public sub_frequency?: string;

  /**
   * Optional subscription start date encoded as four integer for the year, two
   * for the month and two for the day. If only two or one digits are provided,
   * it is assumed to be next occurence of that day of the month, from the
   * current date.
   *
   * For more options https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters
   *
   * ** Example:** `"10"`
   */
  public sub_startdate?: string;

  /**
   * Optional subscription end date encoded as four integer for the year, two
   * for the month and two for the day.
   *
   * The absence of a sub_enddate, together with a sub_frequency, means a
   * subscription with indefinite and date.
   *
   * For more options https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters
   *
   * ** Example:** `"20221010"`
   */
  public sub_enddate?: string;

  /**
   * Optional frequency variants in the same format as `frequency`. If this property is set,
   * the form will render the frequency selection interface. If this array includes
   * the value of the `frequency` property, it will be pre-selected in the form.
   *
   * **Example:** `["7d", ".5m", "1y"]`
   */
  public frequencies: string[] = [];

  /**
   * Optional an array of Product objects with at least the following properties:
   * - name: the name of the product
   * - price: the price of each of this product
   * The following optional properties will be used:
   * - quantity: (defaults to 1) how many of each product are added to the form
   * - image: an image url to be displayed in the form for this product
   * - products: an array of other products that are to be treated as bundled with this product
   * - signatures: an object containing a key value list of previously generated HMAC validation codes
   *
   * Other product properties are accepted and sent to foxy cart.
   * https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters
   */
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

  private __total = 0;

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

  /**
   * The total value of the items to be submitted.
   */
  public get total(): number {
    return this.__total;
  }

  public render(): TemplateResult {
    if (!this.store || !this.currency) {
      return html`<x-error-screen type="setup_needed" class="relative"></x-error-screen>`;
    }

    return html`
      <form class="overflow-hidden">
        <section class="products">
          <slot></slot>
        </section>

        <section class="actions flex flex-wrap justify-end m-m">
          ${this.frequencies && this.frequencies.length
            ? html`
                <x-dropdown
                  type="text"
                  name="frequency"
                  class="subscription m-s w-full sm:w-auto"
                  lang=${this.lang}
                  .value=${'0'}
                  .items=${this.frequencies.concat(['0'])}
                  .getText=${this.__translateFrequency.bind(this)}
                  @change=${this.__handleFrequency}
                >
                </x-dropdown>
              `
            : ''}

          <vaadin-button
            class="m-s w-full sm:w-auto"
            theme="primary"
            data-testid="submit"
            ?disabled=${!this.__hasValidProducts}
            @click=${this.handleSubmit}
          >
            <span class="total">${this.__submitBtnText(this.__translateAmount(this.total))}</span>
          </vaadin-button>
        </section>
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
    newProduct.value = p;
    newProduct.currency = this.currency;
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
      if (duration.count === 1) {
        return this._t('checkout.subscribe_single_unit', {
          value,
          period: this._t(duration.units).toLowerCase(),
        });
      } else {
        return this._t('checkout.subscribe_muiltiple_units', {
          value,
          period: this.__translateFrequency(this.sub_frequency).toLowerCase(),
        });
      }
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
   * @argument string name The name of the field
   * @argument string signature The computed signature to add to the field
   * @argument string open Whether the field value is customized by the user
   * @return string signedName the name of the field with the signature
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
   * @argument FormData fd the FormData instance to fill
   * @return number the number of products added
   **/
  private __formDataFill(fd: FormData): number {
    let added = 0;
    this.__productElements.forEach(e => {
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
   * @argument string strDate the date as a string to be used as start or end date.
   *
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
    if (!strDate.match(/^\.5m/) && QuickOrder.__validFrequency(strDate)) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a string date is in the future.
   *
   * @argument string strdate the date, as a string, to be checked.
   * @returns boolean the date is a valid future date.
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
   *
   * @argument string strFrequency the frequency string to be validated.
   * @returns boolean the string is a foxy cart frequency string.
   */
  private static __validFrequency(strFrequency: string | null | undefined): boolean {
    if (!strFrequency) {
      return false;
    } else {
      return !!strFrequency.match(/^(\.5m|\d+[dwmy])$/);
    }
  }

  /** Subscribe to late inserted products.
   *
   * @argument MutationRecord[] the list of changes occurred.
   **/
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

  /** Compute the total price of all products in the form */
  private __computeTotalPrice(): void {
    let total = 0;
    this.__productElements.forEach(e => {
      const prod = e as ProductItem;
      if (prod.total) {
        total += Number(prod.total);
      }
    });
    this.__total = Number(total.toFixed(2));
  }

  /** Go through all pcroduct elements and executes acknoledges each one */
  private __acknowledgeProductElements(): void {
    this.__productElements.forEach((e: Element) => {
      const p = e as ProductItem;
      this.__acknowledgeProductElement(p);
    });
  }

  /**
   * Treat this product item element as part of the form:
   *
   * - listen to its change events
   * - set its currency to be the forms currency
   */
  private __acknowledgeProductElement(p: ProductItem) {
    p.addEventListener('change', this.__productChange.bind(this));
    p.currency = this.currency!;
  }

  /**
   * Checks if product has quantity and price
   *
   * @argument  Product the product to be validated
   * @returns boolean the product is valid
   **/
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

  /**
   * Translates a frequency string
   *
   * @argument string the frequency string to be translated
   * @returns string the translated string
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

  /**
   * Translate a given amount
   *
   * @argument number the amount to be translated
   * @returns string the translated amount
   */
  private __translateAmount(amount: number) {
    return amount.toLocaleString(this.lang, {
      minimumFractionDigits: 2,
      currency: this.currency!,
      style: 'currency',
    });
  }
}
