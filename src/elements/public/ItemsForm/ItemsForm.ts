import '@vaadin/vaadin-button';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { parseDuration } from '../../../utils/parse-duration';
import { Dropdown, ErrorScreen } from '../../private/index';
import { ItemsFormChangeEvent, ItemsFormSubmitEvent } from './events';
import { Item } from './private/Item';
import { ItemInterface } from './types';

export { Item };

/**
 * A custom element providing a customizable donation form.
 *
 * @fires ItemsForm#change - changed form data.
 * @fires ItemsForm#submit - submitted form data
 * @fires ItemsForm#load -  ProgressEvent instance with server response
 *
 * @slot items - items to be added to the form.
 *
 * @element foxy-items-form
 *
 */
export class ItemsForm extends Translatable {
  /** @readonly */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-error-screen': ErrorScreen,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-dropdown': Dropdown,
      'x-item': Item,
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
          if (!ItemsForm.__validDate(value)) {
            console.error('Invalid start date', value);
            return '';
          }
          return value;
        },
      },
      sub_enddate: {
        type: String,
        converter: value => {
          if (!ItemsForm.__validDateFuture(value)) {
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
            if (!ItemsForm.__validFrequency(f)) {
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
          return freqArray.filter(ItemsForm.__validFrequency);
        },
      },
      items: { type: Array },
      __hasValidItems: { attribute: false },
      __total: { attribute: false },
      __data: { attribute: false },
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
   * Handles the submission of the form
   *
   * - creates a FormData
   * - fill the FormData with item values
   * - add order wide fields to the FormData
   * - submits the form
   */
  private handleSubmit = {
    handleEvent: () => {
      if (this.__data !== null) {
        if (this.dispatchEvent(new ItemsFormSubmitEvent(this.__data!)))
          this.shadowRoot!.querySelector('form')!.submit();
      }
    },
  };

  private __childItemsObserver?: MutationObserver;

  private __hasValidItems = false;

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
      if (ItemsForm.__validFrequency(newfrequency)) {
        this.sub_frequency = newfrequency;
      } else {
        this.sub_frequency = '';
      }
    },
  };

  private __data: FormData = new FormData();

  constructor() {
    super('items-form');
    this.__childItemsObserver = new MutationObserver(this.__observeChildren.bind(this));
    this.__childItemsObserver.observe(this, {
      childList: true,
      attributes: false,
      subtree: true,
    });
    this.updateComplete.then(() => {
      this.__acknowledgeItemElements();
      this.__computeTotalPrice();
      this.__updateData();
    });
  }

  public get items(): ItemInterface[] {
    const temp: ItemInterface[] = [];
    this.__itemElements.forEach(e => temp.push(e.value));
    return temp;
  }

  /**
   * Optional an array of ItemInterface objects with at least the following properties:
   * - name: the name of the item
   * - price: the price of each of this item
   * The following optional properties will be used:
   * - quantity: (defaults to 1) how many of each item are added to the form
   * - image: an image url to be displayed in the form for this item
   * - items: an array of other items that are to be treated as bundled with this item
   * - signatures: an object containing a key value list of previously generated HMAC validation codes
   *
   * Other item properties are accepted and sent to foxy cart.
   * https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters
   */
  public set items(value: ItemInterface[]) {
    this.__removeItems();
    this.__createItemsFromItemArray(value);
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
      <form
        class="overflow-hidden"
        method="POST"
        action="https:://${this.store}/cart"
        data-testid="form"
      >
        <div class="hidden">
          ${[...this.__data.entries()].map(
            ([name, value]) => html`<input type="hidden" name=${name} value=${value} />`
          )}
        </div>

        <section class="items">
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
            ?disabled=${!this.__hasValidItems}
            @click=${this.handleSubmit}
          >
            <span class="total">${this.__submitBtnText(this.__translateAmount(this.total))}</span>
          </vaadin-button>
        </section>
      </form>
    `;
  }

  /** Add new items */
  public addItems(newItems: ItemInterface[]): void {
    for (const p of newItems) {
      const newItem = this.createItem(p);
      this.appendChild(newItem);
      this.__acknowledgeItemElement(newItem as Item);
    }
  }

  /** Remove items */
  public removeItems(itemIds: number[]): void {
    this.__removeItems((p: Item) => itemIds.includes(p.pid));
  }

  public updated(): void {
    const newHasValidItems = !!this.__data;
    if (newHasValidItems != this.__hasValidItems) {
      this.__hasValidItems = newHasValidItems;
    }
    this.dispatchEvent(new ItemsFormChangeEvent(this.__data!));
  }

  public createItem(p: ItemInterface): Element {
    const scopedItem = (this.constructor as any).getScopedTagName('x-item');
    const newItem = document.createElement(scopedItem);
    newItem.value = p;
    newItem.currency = this.currency;
    return newItem;
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
   * An array with both items created as elements and created parameter
   */
  private get __itemElements(): NodeListOf<Item> {
    return this.querySelectorAll('[data-item]');
  }

  /** Create child Items from items array
   */
  private __createItemsFromItemArray(itemsArray: ItemInterface[]) {
    this.addItems(itemsArray);
  }

  /** Removes item from the form based on a condition */
  private __removeItems(condition = (e: Item) => true) {
    this.__itemElements.forEach(p => {
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
   * Add all items from this.__itemElements to a FormData
   *
   * - Iterate of items in itemElements
   * - Add valid items to Form Data
   *
   * @argument FormData fd the FormData instance to fill
   * @return number the number of items added
   **/
  private __formDataFill(fd: FormData): number {
    let added = 0;
    this.__itemElements.forEach(e => {
      if (this.__validItem(e.value as ItemInterface)) {
        this.__formDataAddItem(fd, e.value);
        added++;
      } else {
        console.error('Invalid item', e.value);
      }
    });
    return added;
  }

  /**
   * Adds a item to a form data
   *
   * @argument {FormData} fd the FormData to which the item will be added
   * @argument {Item} the item to add
   **/
  private __formDataAddItem(fd: FormData, p: ItemInterface): void {
    const idKey = 'pid';
    const reservedAttributes = [idKey, 'signatures', 'currency'];
    if (!p[idKey]) {
      throw new Error('Attempt to convert a item without a propper ID');
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
    if (!strDate.match(/^\.5m/) && ItemsForm.__validFrequency(strDate)) {
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
    if (ItemsForm.__validDate(strDate)) {
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

  /** Subscribe to late inserted items.
   *
   * @argument MutationRecord[] the list of changes occurred.
   **/
  private __observeChildren(mutationList: MutationRecord[]): void {
    mutationList.forEach(m => {
      if (m.type == 'childList') {
        m.addedNodes.forEach(n => {
          const e = n as HTMLElement;
          e.addEventListener('change', this.__itemChange.bind(this));
        });
      }
    });
    this.__acknowledgeItemElements();
    this.__computeTotalPrice();
    this.__updateData();
  }

  /** Updates the form on item change */
  private __itemChange(): void {
    this.__computeTotalPrice();
    this.__updateData();
  }

  /** Compute the total price of all items in the form */
  private __computeTotalPrice(): void {
    let total = 0;
    this.__itemElements.forEach(e => {
      const item = e as Item;
      if (item.total) {
        total += Number(item.total);
      }
    });
    this.__total = Number(total.toFixed(2));
  }

  /** Go through all pcroduct elements and executes acknoledges each one */
  private __acknowledgeItemElements(): void {
    this.__itemElements.forEach((e: Element) => {
      const i = e as Item;
      this.__acknowledgeItemElement(i);
    });
  }

  /**
   * Treat this item item element as part of the form:
   *
   * - listen to its change events
   * - set its currency to be the forms currency
   */
  private __acknowledgeItemElement(item: Item) {
    item.addEventListener('change', this.__itemChange.bind(this));
    item.currency = this.currency!;
  }

  /**
   * Checks if item has quantity and price
   *
   * @argument  Item the item to be validated
   * @returns boolean the item is valid
   **/
  private __validItem(p: ItemInterface): boolean {
    return !!(
      p &&
      p.pid &&
      p.quantity &&
      +p.quantity > 0 &&
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

  private __updateData() {
    const data = new FormData();
    const itemsAdded = this.__formDataFill(data);
    if (itemsAdded == 0) return null;
    this.__formDataAddSubscriptionFields(data);
    this.__data = data;
  }
}
