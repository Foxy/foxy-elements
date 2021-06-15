import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import { PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';
import { Translatable } from '../../../mixins/translatable';
import { parseDuration } from '../../../utils/parse-duration';
import { CheckboxChangeEvent, ChoiceChangeEvent, DropdownChangeEvent } from '../../private/events';
import { Checkbox, Choice, Dropdown, ErrorScreen, Group, I18N } from '../../private/index';
import { DonationChangeEvent } from './DonationChangeEvent';
import { DonationSubmitEvent } from './DonationSubmitEvent';

interface DonationEventsMap {
  change: typeof DonationChangeEvent;
  submit: typeof DonationSubmitEvent;
}

/**
 * A custom element providing customizable donation forms.
 *
 * @fires Donation#change - Instance of `Donation.events.change`. Emitted after user input triggers a change in the form data.
 * @fires Donation#submit - Instance of `Donation.events.submit`. Emitted when the form is submitted. Cancelling this event will stop the submission.
 *
 * @slot amount - Space below the amount selector, if it's visible.
 * @slot designation - Space below the designation selector, if it's visible.
 * @slot comment - Space below the comment field, if it's visible.
 *
 * @element foxy-donation
 * @since 0.3.0
 */
export class Donation extends Translatable {
  /** @readonly */
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'x-error-screen': ErrorScreen,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-dropdown': Dropdown,
      'x-checkbox': Checkbox,
      'x-choice': Choice,
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  /** @readonly */
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      currency: { type: String },
      custom: { type: Array },
      amount: { type: Number },
      amounts: { type: Array },
      frequency: { type: String },
      frequencies: { type: Array },
      designation: { type: Array },
      designations: { type: Array },
      comment: { type: String },
      anonymity: { reflect: true, type: Boolean },
      anonymous: { reflect: true, type: Boolean },
      image: { type: String },
      store: { type: String },
      name: { type: String },
      code: { type: String },
      url: { type: String },
      cart: { type: String },
      target: { type: String },
      empty: { type: String },
    };
  }

  /** @readonly */
  public static get events(): DonationEventsMap {
    return {
      change: DonationChangeEvent,
      submit: DonationSubmitEvent,
    };
  }

  /**
   * **Required** 3-letter lowercase currency code.
   *
   * **Example:** `"usd"`
   */
  public currency: null | string = null;

  /**
   * **Required** donation amount in specified currency. When more than one amount option
   * is available, this field will contain the selected amount. This value is deliberately not
   * limited to the predefined options: whatever you set it to will show up in the cart.
   *
   * **Example:** `25`
   */
  public amount: null | number = null;

  /**
   * **Required** store subdomain. This is usually the part after before `.foxycart.com`
   * and after `https://`, e.g. the `foxy-demo` bit of `https://foxy-demo.foxycart.com`.
   *
   * **Example:** `"foxy-demo"`
   */
  public store: null | string = null;

  /**
   * **Required** product name for this donation. This will show up in the cart when this form is submitted.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"One-time donation"`
   */
  public name: null | string = null;

  /**
   * Optional parts of the form including a custom ("other") option.
   * Adding `amount` to this array will enable custom amount.
   *
   * **Example:** `["amount"]`
   */
  public custom: null | 'amount'[] = null;

  /**
   * Optional donation amount variants. If this property is set, the form will render
   * the amount selection interface. If this array includes the value of the `amount` property,
   * it will be pre-selected in the form.
   *
   * **Example:** `[25, 50, 75]`
   */
  public amounts: null | number[] = null;

  /**
   * Optional donation frequency string encoded as count (integer) + units (one
   * of: `d` for days, `w` for weeks, `m` for months, `y` for years). A special
   * value for twice a month is also supported: `.5m`. If set, the form will
   * create a subscription with the specified frequency in the cart. This value is deliberately not
   * limited to the predefined options: whatever you set it to will show up in the cart.
   *
   * **Example:** `"1m"`
   */
  public frequency: null | string = null;

  /**
   * Optional donation frequency variants in the same format as `frequency`. If this property is set,
   * the form will render the frequency selection interface. If this array includes
   * the value of the `frequency` property, it will be pre-selected in the form.
   *
   * **Example:** `["7d", ".5m", "1y"]`
   */
  public frequencies: null | string[] = null;

  /**
   * Optional donation designation(s). The form will serialize and pass this value to the cart
   * on submission. This value is deliberately not limited to the predefined options:
   * whatever you set it to will show up in the cart.
   *
   * **Example:** `"Medical Care"`
   * **Example:** `["Medical Care", "Daily Meals"]`
   */
  public designation: null | string = null;

  /**
   * Optional donation designation(s) variants. If this property is set,
   * the form will render the designation selection interface: multiple choice
   * if `designation` is an array and a single choice otherwise. All values overlapping
   * with the `designation` property will be pre-selected in the form.
   *
   * **Example:** `["Medical Care", "Daily Meals", "Area of Greatest Need"]`
   */
  public designations: null | string[] = null;

  /**
   * Optional comment accompanying the donation. If set (even to an empty string),
   * the form will render a comment field. The value of this property will be updated
   * as the customer enters their message and will be added to the order as a custom field in the end.
   *
   * **Example:** `""`
   */
  public comment: null | string = null;

  /**
   * Optional switch controlling visibility of the anonymity checkbox. If set to `true`, the form
   * will render the checkbox. All changes in the value are reflected to the attribute.
   *
   * **Example:** `true`
   */
  public anonymity = false;

  /**
   * Optional switch marking this donation as anonymous via a custom field when set to `true`. When
   * the anonymity checkbox is rendered, also checks or unchecks it depending on the value.
   * All changes in the value are reflected to the attribute.
   *
   * **Example:** `true`
   */
  public anonymous = false;

  /**
   * Optional product image URL (absolute path). This property affects cart UI only.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"https://picsum.photos/320"`
   */
  public image: null | string = null;

  /**
   * Optional product code for this donation. This property affects cart UI only.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"ISBN 978-0-12-345678-9"`
   */
  public code: null | string = null;

  /**
   * Optional product URL for this donation. Accepts a full URL to the product page, starting
   * with `http://` or `https://`, or a relative path to the produt from the store's
   * domain (as configured in the store settings). This property affects cart UI only.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"https://example.com/my-product"`
   */
  public url: null | string = null;

  /**
   * Optional cart
   * If set to 'add' will add items to the cart and, on submit, user is redirected to the cart.
   * If set to 'checkout', the default, on submit user is redirected to checkout directly
   */
  public cart = 'checkout';

  /**
   * Optional empty
   * If set to 'true' clears the contents of the cart prior to adding the donation to the cart
   * If set to 'reset' clears the contents of the cart and cookies prior to adding the donation to the cart
   */
  public empty?: string;

  /**
   * Optional target to display the form response.
   */
  public target = '_top';

  public constructor() {
    super('donation');
  }

  /** Submits the form, emitting a cancelable `submit` event. */
  public submit(): void {
    /* istanbul ignore if  */
    if (this.dispatchEvent(new DonationSubmitEvent())) this.__form.submit();
  }

  public render(): TemplateResult {
    if (!this.currency || !this.amount || !this.store || !this.name) {
      return html`
        <x-error-screen data-testid="error" type="setup_needed" class="relative"></x-error-screen>
      `;
    }

    return html`
      <form
        target="${this.target}"
        class="sr-only"
        method="POST"
        action="https://${this.store}.foxycart.com/cart"
        data-testid="form"
      >
        ${[...this.__data.entries()].map(
          ([name, value]) => html`<input type="hidden" name=${name} value=${value} />`
        )}
      </form>

      <section>
        ${this.amounts && this.amounts.length > 0
          ? html`
              <x-group frame>
                <x-i18n ns=${this.ns} lang=${this.lang} key="amount" slot="header"></x-i18n>
                <x-choice
                  ?custom=${!!this.custom?.includes('amount')}
                  .getText=${(v: string) => this.__translateAmount(parseInt(v, 10))}
                  .items=${this.amounts.map(String)}
                  .value=${this.amount.toString()}
                  type="integer"
                  lang=${this.lang}
                  min="1"
                  ns=${this.ns}
                  data-testid="amount"
                  @change=${(evt: ChoiceChangeEvent) => {
                    const value = parseInt(evt.detail as string);
                    this.amount = isNaN(value) ? /* istanbul ignore next */ 1 : value;
                  }}
                >
                </x-choice>
              </x-group>

              <slot name="amount" class="block my-m"></slot>
            `
          : ''}
      </section>

      <section>
        ${this.designations && this.designations.length > 0
          ? html`
              <x-dropdown
                .label=${this._t('designation').toString()}
                .items=${this.designations}
                .value=${Array.isArray(this.designation)
                  ? '${this.designation[0]}: ${this.designation[1]}'
                  : this.designation}
                data-testid="designation"
                @change=${(evt: DropdownChangeEvent) => {
                  this.designation = evt.detail as string;
                }}
              >
              </x-dropdown>

              <slot name="designation" class="block my-m"></slot>
            `
          : ''}
      </section>

      <section>
        ${typeof this.comment === 'string'
          ? html`
              <vaadin-text-area
                placeholder=${this._t('comment_placeholder').toString()}
                value=${this.comment!}
                label=${this._t('comment_label').toString()}
                class="w-full"
                data-testid="comment"
                @input=${(evt: InputEvent) => {
                  evt.stopPropagation();
                  this.comment = (evt.target as HTMLTextAreaElement).value;
                }}
              >
              </vaadin-text-area>

              <slot name="comment" class="block my-m"></slot>
            `
          : ''}
      </section>

      <section>
        ${this.anonymity
          ? html`
              <x-checkbox
                class="my-m"
                data-testid="anonymity"
                ?checked=${this.anonymous}
                @change=${(evt: CheckboxChangeEvent) => (this.anonymous = evt.detail)}
              >
                ${this._t('anonymous')}
              </x-checkbox>
            `
          : ''}

        <div class="flex flex-wrap -m-s">
          ${this.frequencies && this.frequencies.length > 0
            ? html`
                <div class="flex-1 p-s">
                  <x-dropdown
                    .value=${this.frequency}
                    .items=${this.frequencies}
                    .getText=${this.__translateFrequency.bind(this)}
                    data-testid="frequency"
                    @change=${(evt: DropdownChangeEvent) => {
                      this.frequency = evt.detail as string;
                    }}
                  >
                  </x-dropdown>
                </div>
              `
            : ''}

          <div class="flex-1 p-s">
            <vaadin-button
              class="w-full"
              theme="primary"
              data-testid="submit"
              @click=${() => this.submit()}
            >
              <x-i18n
                .opts=${{
                  amount: this.__translateAmount(this.amount),
                  frequency: this.frequency ? this.__translateFrequency(this.frequency) : '',
                }}
                lang=${this.lang}
                key=${this.frequency && !this.frequencies?.length ? 'donate_recurrently' : 'donate'}
                ns=${this.ns}
              >
              </x-i18n>
            </vaadin-button>
          </div>
        </div>
      </section>
    `;
  }

  public updated(): void {
    this.dispatchEvent(new DonationChangeEvent(this.__data));
  }

  private get __data() {
    const data = new FormData();

    if (typeof this.designation === 'string') {
      data.set('Designation', this.designation.trim());
    }

    if (typeof this.amount === 'number' && typeof this.currency === 'string') {
      data.set('price', `${this.amount.toFixed(2)}${this.currency}`);
    }

    if (this.frequency) data.set('sub_frequency', this.frequency);
    if (typeof this.comment === 'string') data.set('Comment', this.comment.trim());
    if (typeof this.image === 'string') data.set('image', this.image);
    if (typeof this.code === 'string') data.set('code', this.code);
    if (typeof this.name === 'string') data.set('name', this.name.trim());
    if (typeof this.url === 'string') data.set('url', this.url);
    if (typeof this.cart === 'string') data.set('cart', this.cart);
    if (this.empty) data.set('empty', this.empty);
    if (this.anonymous) data.set('Anonymous', 'true');

    data.set('quantity', '1');

    return data;
  }

  private get __form(): HTMLFormElement {
    return this.shadowRoot!.querySelector('form')!;
  }

  private __translateFrequency(frequency: string) {
    if (!frequency || frequency.match(/^\s*$/)) return this._t('frequency_once');
    if (frequency === '.5m') return this._t('frequency_0_5m');

    const { count, units } = parseDuration(frequency);
    return this._t('frequency', {
      units: this._t(units, { count }),
      count,
    });
  }

  private __translateAmount(amount: number) {
    return amount.toLocaleString(this.lang, {
      minimumFractionDigits: 0,
      currency: this.currency!,
      style: 'currency',
    });
  }
}
