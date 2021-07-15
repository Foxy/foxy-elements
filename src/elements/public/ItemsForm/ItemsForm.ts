import '@vaadin/vaadin-button';
import { Dropdown, ErrorScreen } from '../../private/index';
import { ItemsFormChangeEvent, ItemsFormSubmitEvent } from './events';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Item } from './private/Item';
import { ItemInterface } from './types';
import { SignableFields } from './private/SignableFields';
import { parseDuration } from '../../../utils/parse-duration';

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
export class ItemsForm extends SignableFields {
  /** @readonly */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'vaadin-button': customElements.get('vaadin-button'),
      'x-dropdown': Dropdown,
      'x-error-screen': ErrorScreen,
      'x-item': Item,
    };
  }

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __data: { attribute: false },
      __hasValidItems: { attribute: false },
      __total: { attribute: false },
      cart: {
        converter: value => {
          if (value && !['checkout', 'add'].includes(value)) {
            return null;
          }
          return value;
        },
        type: String, // only accepts checkout or add
      },
      currency: { type: String },
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
      readonly: { type: Boolean },
      store: { attribute: 'store', type: String },
      sub_enddate: {
        converter: value => {
          if (!ItemsForm.__validDateFuture(value)) {
            console.error('Invalid end date', value);
            return '';
          }
          return value;
        },
        type: String,
      },
      sub_frequency: { type: String },
      sub_modify: {
        converter: value => {
          if (value === '' || value === 'append') {
            return '';
          } else {
            return 'replace';
          }
        },
        type: String,
      },
      sub_restart: {
        converter: value => {
          if (value === 'true') {
            return value;
          } else {
            return 'auto';
          }
        },
        type: String,
      },
      sub_startdate: {
        converter: value => {
          if (!ItemsForm.__validDate(value)) {
            console.error('Invalid start date', value);
            return '';
          }
          return value;
        },
        type: String,
      },
      sub_token: { type: String },
      target: { type: String },
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
   * Makes the entire form readonly.
   */
  public readonly = false;

  /**
   * Defines target of the form
   *
   * This attribute controls the destination window of the form submission.
   */
  public target = '_top';

  /**
   * Defines the next cart step
   *
   * It can only be either add or checkout.
   * If "add" is chosen, this form will add items to the cart and the user will
   * be directed to the cart with these products added upon submission.
   *
   * If set to "checkout" (this is the default) the user will be directed to
   * checkout.
   */
  public cart = 'checkout';

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
   * it is assumed to be next occurrence of that day of the month, from the
   * current date.
   *
   * See [Products wiki for more details](https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters)
   *
   * ** Example:** `"10"`
   */
  public sub_startdate?: string;

  /**
   * Optional subscription token, unique URL of a subscription, retrieved from
   * the API, XML datafeeds or Admin interface.
   */
  public sub_token?: string;

  /**
   * Optional. Allows the “add to cart” link or form to completely replace the
   * existing subscription loaded
   *
   * Can be either "replace", "append" or "" (a blank string).
   * Using "append" or "" will result in adding these items to an existing
   * subscription in addition to the existing ones.
   *
   * The "append" value is set for convenience, as it describes the behaviour.
   * The submitted value, in this case, will be "". The submitted value, in
   * this case, will be "".
   *
   * Using "replace" results in replacing the existing subscription with the
   * current items.
   * See [Products subscription options](https://wiki.foxycart.com/v/2.0/products/subscriptions#subscription-related_product_options)
   */
  public sub_modify = 'replace';

  /**
   *  Set to "true" to indicate that payment is collectable right now.
   *  Set to "auto" to indicate that payment is collectable right now if the
   *  subscription's past-due amount is greater than 0
   */
  public sub_restart = 'auto';

  /**
   * Optional subscription end date encoded as four integer for the year, two
   * for the month and two for the day.
   *
   * The absence of a sub_enddate, together with a sub_frequency, means a
   * subscription with indefinite and date.
   *
   * See [Products wiki for more details](https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters)
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
        if (this.dispatchEvent(new ItemsFormSubmitEvent(this.__data!))) {
          this.shadowRoot!.querySelector('form')!.submit();
        }
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
      this.__updateData();
    },
  };

  private __data: FormData | null = new FormData();

  constructor() {
    super('items-form');
    this.__childItemsObserver = new MutationObserver(this.__observeChildren.bind(this));
    this.__childItemsObserver.observe(this, {
      attributes: false,
      childList: true,
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
    this.__itemElements.forEach(e => {
      const proxy = new Proxy(e, {
        get: function (target: Item, property: string | number) {
          return target.value[property];
        },
        set: function (target: Item, property: string | number | symbol, value) {
          const allowedAttributes = Object.keys(target.value);
          if (typeof property === 'string' && allowedAttributes.includes(property)) {
            (target as unknown as ItemInterface)[property] = value;
            return true;
          } else {
            return false;
          }
        },
      });
      temp.push(proxy as unknown as ItemInterface);
    });
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
   * Other item properties are accepted and sent to foxy cart
   * See [Products wiki for more details](https://wiki.foxycart.com/v/2.0/products#a_complete_list_of_product_parameters)
   */
  public set items(value: ItemInterface[]) {
    this.__removeItems();
    this.__createItemsFromItemArray(value);
  }

  /**
   * The total value of the items to be submitted.
   *
   * @returns total value of this form.
   */
  public get total(): number {
    return this.__total;
  }

  public render(): TemplateResult {
    if (!this.store || !this.currency) {
      return html`<x-error-screen type="setup_needed" class="relative"></x-error-screen>`;
    }

    return html`
      <div>
        <form
          class="overflow-hidden"
          method="POST"
          target="${this.target}"
          action="https://${this.store}/cart"
          data-testid="form"
          class="hidden"
          hidden
        >
          ${this.__data
            ? html` ${[...this.__data.entries()].map(
                ([name, value]) => html`<input type="hidden" name=${name} value=${value} />`
              )}`
            : ''}
        </form>

        <section class="items">
          <slot></slot>
        </section>

        ${!this.readonly
          ? html`
              <section class="actions flex flex-wrap justify-end m-m">
                ${this.frequencies && this.frequencies.length
                  ? html`
                      <x-dropdown
                        type="text"
                        name="frequency"
                        class="subscription m-s w-full sm-w-auto"
                        lang=${this.lang}
                        .value=${this.sub_frequency ?? '0'}
                        .items=${this.frequencies.concat(['0'])}
                        .getText=${this.__translateFrequency.bind(this)}
                        @change=${this.__handleFrequency}
                      >
                      </x-dropdown>
                    `
                  : ''}

                <vaadin-button
                  class="m-s w-full sm-w-auto"
                  theme="primary"
                  data-testid="submit"
                  ?disabled=${!this.__hasValidItems}
                  @click=${this.handleSubmit}
                >
                  <span class="total">
                    ${this.__submitBtnText(this.__translateAmount(this.total))}
                  </span>
                </vaadin-button>
              </section>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Add new items
   *
   * @param newItems
   */
  public addItems(newItems: ItemInterface[]): void {
    for (const p of newItems) {
      const newItem = this.createItem(p);
      this.appendChild(newItem);
      this.__acknowledgeItemElement(newItem as Item);
    }
  }

  /**
   * Remove items
   *
   * @param itemIds
   */
  public removeItems(itemIds: number[]): void {
    this.__removeItems((p: Item) => itemIds.includes(p.pid));
  }

  public updated(): void {
    this.dispatchEvent(new ItemsFormChangeEvent(this.__data!));
  }

  public createItem(p: ItemInterface): Element {
    const scopedItem = (this.constructor as any).getScopedTagName('x-item');
    const newItem = document.createElement(scopedItem);
    newItem.value = p;
    newItem.currency = this.currency;
    newItem.readonly = this.readonly;
    return newItem;
  }

  private __submitBtnText(value: string): string {
    if (!this.sub_frequency || this.sub_frequency == '0') {
      return this._t('checkout.buy', { value });
    } else {
      const duration = parseDuration(this.sub_frequency);
      if (duration.count === 1) {
        return this._t('checkout.subscribe_single_unit', {
          period: this._t(duration.units).toLowerCase(),
          value,
        });
      } else {
        return this._t('checkout.subscribe_muiltiple_units', {
          period: this.__translateFrequency(this.sub_frequency).toLowerCase(),
          value,
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

  /**
   * Create child Items from items array
   *
   * @param itemsArray
   */
  private __createItemsFromItemArray(itemsArray: ItemInterface[]) {
    this.addItems(itemsArray);
  }

  /**
   * Removes item from the form based on a condition
   *
   * @param condition
   */
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
   * @param name The name of the field
   * @param signature The computed signature to add to the field
   * @param open Whether the field value is customized by the user
   * @returns signedName the name of the field with the signature
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
   * @param fd
   * @param FormData fd the FormData instance to fill
   * @returns number the number of items added
   */
  private __formDataFill(fd: FormData): number {
    let added = 0;
    this.__itemElements.forEach(e => {
      added += this.__formDataAddItem(fd, e);
    });
    this.__formDataAddCartWideSubscriptionFields(fd);
    return added;
  }

  /**
   * Add custom user provided fields
   *
   * @param fd
   */
  private __formDataCustomInputs(fd: FormData) {
    this.querySelectorAll(`[name]`).forEach(e => {
      const el = e as HTMLInputElement;
      if (el.tagName == 'INPUT' && ['checkbox', 'radio'].includes(el.type)) {
        if (!el.checked) return;
      }
      if (el.tagName == 'OPTION') {
        return;
      }
      if (el.value && ['number', 'string'].includes(typeof el.value)) {
        fd.set(el.name, el.value);
      }
    });
  }

  // Reserved attributes are not to be submitted
  // other attributes, included custom attributes added by the user, will be submitted
  private __isAttributeReserved(attribute: string): boolean {
    const reservedAttributes = [
      'alt',
      'currency',
      'description',
      'isChildren',
      'isItem',
      'items',
      'open',
      'pid',
      'signatures',
      'slot',
      'total',
    ];
    return reservedAttributes.includes(attribute);
  }

  /**
   * Adds a item to a form data
   *
   * @param fd the FormData to which the item will be added
   * @param itemEl the item to add
   * @param parent
   */
  private __formDataAddItem(fd: FormData, itemEl: Item, parent: Item | null = null): number {
    let added = 0;
    if (this.__validItem(itemEl)) {
      if (!itemEl.value['pid']) {
        throw new Error('Attempt to convert a item without a propper ID');
      }
      if (parent && parent.getAttribute('code')) {
        itemEl.setAttribute('parent_code', parent.getAttribute('code')!);
      }
      for (let i = 0; i < itemEl.attributes.length; i++) {
        const field = itemEl.attributes[i];
        if (!this.__isAttributeReserved(field.name) && !field.name.startsWith('data-')) {
          let fieldValue: unknown = (itemEl as any)[field.name];
          // Adds a signature if possible
          if (itemEl.code && ['string', 'number'].includes(typeof fieldValue)) {
            if (parent && field.name == 'quantity') {
              fieldValue = Number(field.value) * parent.quantity;
            }
            fd.set(itemEl.signedName(field.name), (fieldValue as string | number).toString());
          }
        }
      }
      added += 1;
      this.__formDataAddSubscriptionFields(fd, itemEl);
    }
    const childItems = itemEl.querySelectorAll('[data-bundled]');
    if (childItems && itemEl.quantity > 0) {
      for (const child of childItems) {
        added += this.__formDataAddItem(fd, child as Item, itemEl);
      }
    }
    return added;
  }

  /**
   * Adds subscription fields to a FormData
   *
   * @param fd the FormData to which subscription fields will be added
   * @param itemEl
   */
  private __formDataAddSubscriptionFields(fd: FormData, itemEl: Item): void {
    // added if sub_frequency is set
    if (this.sub_frequency) {
      for (const s of ['sub_frequency', 'sub_startdate', 'sub_enddate']) {
        if ((this as any)[s]) {
          fd.set(itemEl.signedName(s), (this as any)[s]);
        }
      }
    }
  }

  /**
   * Adds cart wide subscription fields to a FormData
   *
   * @param fd the FormData to which subscription fields will be added
   */
  private __formDataAddCartWideSubscriptionFields(fd: FormData): void {
    if (this.sub_frequency) {
      // added if itself is set
      if (this.sub_token) fd.set(this.signedName('sub_token'), this.sub_token);
      // added regardless
      fd.set(this.signedName('sub_modify'), this.sub_modify);
      fd.set(this.signedName('sub_restart'), this.sub_restart);
    }
  }

  /**
   * Adds cart related fields to a FormData
   *
   * @param fd the FormData to which the cart fields will be added.
   */
  private __formDataAddCartFields(fd: FormData): void {
    if (this.cart) {
      fd.set('cart', this.cart!);
    } else {
      fd.delete('cart');
    }
  }

  /**
   * Validates a string for subscription start date or end date according to
   *
   * @param strDate the date as a string to be used as start or end date.
   * @returns valid date.
   *
   * https://wiki.foxycart.com/v/2.0/products#subscription_product_options
   * See [Products subscription options for more details](https://wiki.foxycart.com/v/2.0/products#subscription_product_options)
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
   * @param strDate the date, as a string, to be checked.
   * @returns  date is a valid future date.
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
   * @param strFrequency the frequency string to be validated.
   * @returns boolean the string is a foxy cart frequency string.
   */
  private static __validFrequency(strFrequency: string | null | undefined): boolean {
    if (!strFrequency) {
      return false;
    } else {
      return !!strFrequency.match(/^(\.5m|\d+[dwmy])$/);
    }
  }

  /**
   * Subscribe to late inserted items.
   *
   * @param mutationList
   * @param MutationRecord[] the list of changes occurred.
   */
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

  /** Go through all product elements and executes acknowledges each one */
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
   *
   * @param item
   */
  private __acknowledgeItemElement(item: Item) {
    item.addEventListener('change', this.__itemChange.bind(this));
    item.currency = this.currency!;
  }

  /**
   * Checks if item has quantity and price
   *
   * @param item to be validated
   * @returns boolean the item is valid
   */
  private __validItem(item: Item): boolean {
    const pid = item.getAttribute('pid');
    const qty = Number(item.getAttribute('quantity'));
    const price = Number(item.getAttribute('price'));
    return !!(pid && qty > 0 && price >= 0);
  }

  /**
   * Translates a frequency string
   *
   * @param frequency string to be translated
   * @returns string the translated string
   */
  private __translateFrequency(frequency: string) {
    if (frequency.startsWith('0')) return this._t('frequency_once');
    if (frequency === '.5m') return this._t('frequency_0_5m');
    const { count, units } = parseDuration(frequency);
    return this._t('frequency', {
      count,
      units: this._t(units, { count }),
    });
  }

  /**
   * Translate a given amount
   *
   * @param amount to be translated
   * @returns string the translated amount
   */
  private __translateAmount(amount: number) {
    return amount.toLocaleString(this.lang, {
      currency: this.currency!,
      minimumFractionDigits: 2,
      style: 'currency',
    });
  }

  private __updateData() {
    this.__data = null;
    const form = this.shadowRoot!.querySelector('form');
    if (!form) return;
    const data = new FormData();
    const itemsAdded = this.__formDataFill(data);
    this.__hasValidItems = !!itemsAdded;
    this.__formDataAddCartFields(data);
    this.__formDataCustomInputs(data);
    this.__data = data;
  }
}
