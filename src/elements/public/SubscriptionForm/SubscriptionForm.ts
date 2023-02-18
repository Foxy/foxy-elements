import type { Data, Settings, Templates, TransactionPageGetter } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { ScopedElementsMap } from '@open-wc/scoped-elements';
import type { InternalCalendar } from '../../internal/InternalCalendar';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { ButtonElement } from '@vaadin/vaadin-button';
import type { FormDialog } from '../FormDialog';
import type { Rels } from '@foxy.io/sdk/backend';

import { Choice, Group, Skeleton } from '../../private/index';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector, Resource } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { parseFrequency } from '../../../utils/parse-frequency';
import { serializeDate } from '../../../utils/serialize-date';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

import {
  getNextTransactionDateConstraints,
  getAllowedFrequencies,
  isNextTransactionDate,
} from '@foxy.io/sdk/customer';

const NS = 'subscription-form';
const Base = ScopedElementsMixin(ResponsiveMixin(TranslatableMixin(InternalForm, NS)));

/**
 * Form element for creating or editing subscriptions.
 *
 * @slot header:before - **new in v1.4.0**
 * @slot header:after - **new in v1.4.0**
 *
 * @slot items:before - **new in v1.4.0**
 * @slot items:after - **new in v1.4.0**
 * @slot items:actions:before - **new in v1.4.0**
 * @slot items:actions:after - **new in v1.4.0**
 *
 * @slot end-date:before - **new in v1.4.0**
 * @slot end-date:after - **new in v1.4.0**
 *
 * @slot next-transaction-date:before - **new in v1.4.0**
 * @slot next-transaction-date:after - **new in v1.4.0**
 *
 * @slot frequency:before - **new in v1.4.0**
 * @slot frequency:after - **new in v1.4.0**
 *
 * @slot transactions:before - **new in v1.4.0**
 * @slot transactions:after - **new in v1.4.0**
 *
 * @slot attributes:before - **new in v1.20.0**
 * @slot attributes:after - **new in v1.20.0**
 *
 * @slot timestamps:before - **new in v1.20.0**
 * @slot timestamps:after - **new in v1.20.0**
 *
 * @slot past-due-amount:before - **new in v1.20.0**
 * @slot past-due-amount:after - **new in v1.20.0**
 *
 * @slot start-date:before - **new in v1.20.0**
 * @slot start-date:after - **new in v1.20.0**
 *
 * @element foxy-subscription-form
 * @since 1.2.0
 */
export class SubscriptionForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-timestamps-control': customElements.get('foxy-internal-timestamps-control'),
      'foxy-internal-async-list-control': customElements.get('foxy-internal-async-list-control'),
      'foxy-internal-number-control': customElements.get('foxy-internal-number-control'),
      'foxy-internal-calendar': customElements.get('foxy-internal-calendar'),
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-nucleon': customElements.get('foxy-nucleon'),
      'vcf-tooltip': customElements.get('vcf-tooltip'),
      'foxy-table': customElements.get('foxy-table'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'iron-icon': customElements.get('iron-icon'),
      'x-skeleton': Skeleton,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getTransactionPageHref: { attribute: false },
      customerAddresses: { attribute: 'customer-addresses' },
      itemCategories: { attribute: 'item-categories' },
      localeCodes: { attribute: 'locale-codes' },
      settings: { type: Object },
      coupons: {},
    };
  }

  getTransactionPageHref: TransactionPageGetter = (_, data: any) => {
    return data?._links['fx:receipt'].href;
  };

  customerAddresses: string | null = null;

  itemCategories: string | null = null;

  localeCodes: string | null = null;

  templates: Templates = {};

  settings: Settings | null = null;

  coupons: string | null = null;

  private readonly __transactionTemplateLoaderId = 'transactionTemplateLoader';

  private readonly __defaultTemplateSetLoaderId = 'defaultTemplateSetLoader';

  private readonly __localeCodesHelperLoaderId = 'localeCodesLoader';

  private readonly __templateSetLoaderId = 'templateSetLoader';

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __renderHeaderSubtitle = () => {
    const { data, lang, ns } = this;

    if (data) {
      let color = 'text-secondary';
      let date: string;
      let key: string;

      if (data.first_failed_transaction_date) {
        color = 'text-error';
        date = data.first_failed_transaction_date;
        key = 'subscription_failed';
      } else if (data.end_date) {
        date = data.end_date;
        const hasEnded = new Date(date).getTime() > Date.now();
        key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
      } else {
        date = data.next_transaction_date ?? new Date().toISOString();
        key = `subscription_${data.is_active ? 'active' : 'inactive'}`;
      }

      const text = html`
        <foxy-i18n
          data-testid="header-subtitle"
          options=${JSON.stringify({ date })}
          class=${color}
          lang=${lang}
          key=${key}
          ns=${ns}
        >
        </foxy-i18n>
      `;

      if (data.first_failed_transaction_date) {
        return html`
          <span id="status" class="flex items-center space-x-xs ${color}">
            ${text}<iron-icon icon="icons:info-outline" class="icon-inline"></iron-icon>
          </span>
          <vcf-tooltip for="status" position="bottom">
            <span class="text-s">${data.error_message}</span>
          </vcf-tooltip>
        `;
      }

      return text;
    }

    return html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`;
  };

  private readonly __renderHeaderTitle = (
    currency: string | undefined,
    currencyDisplay: string | undefined
  ) => {
    const { data, lang, ns } = this;

    if (data) {
      const frequency = parseFrequency(data.frequency);
      const transactionTemplate = this.__transactionTemplate;
      const total = transactionTemplate?.total_order;

      if (typeof currency !== 'string') return html`--`;

      return html`
        <foxy-i18n
          data-testid="header-title"
          options=${JSON.stringify({
            ...frequency,
            amount: `${total} ${currency}`,
            currencyDisplay,
          })}
          lang=${lang}
          key="price_${data.frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
          ns=${ns}
        >
        </foxy-i18n>
      `;
    }

    return html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`;
  };

  private readonly __renderHeader = (
    currencyCode: string | undefined,
    currencyDisplay: string | undefined
  ) => {
    return html`
      <div data-testid="header" class="sm-col-span-2">
        ${this.renderTemplateOrSlot('header:before')}
        <div class="leading-xs text-xxl font-medium truncate">
          ${this.__renderHeaderTitle(currencyCode, currencyDisplay)}
        </div>
        <div class="leading-xs text-l">${this.__renderHeaderSubtitle()}</div>
        ${this.renderTemplateOrSlot('header:after')}
      </div>
    `;
  };

  private readonly __renderItemsActions = () => {
    return html`
      <div class="flex" data-testid="items:actions">
        ${this.renderTemplateOrSlot('items:actions:before')}

        <foxy-i18n
          data-testid="items:actions-label"
          class="flex-1 text-s font-medium text-secondary"
          lang=${this.lang}
          key="item_plural"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('items:actions:after')}
      </div>
    `;
  };

  private readonly __renderItems = () => {
    let itemsHref: string | undefined;

    try {
      const cart = this.__transactionTemplate;
      const url = new URL(cart?._links['fx:items'].href ?? '');
      url.searchParams.set('zoom', 'item_options');
      itemsHref = url.toString();
    } catch {
      itemsHref = undefined;
    }

    return html`
      <div data-testid="items" class="space-y-xs sm-col-span-2">
        ${this.hiddenSelector.matches('items:actions', true) ? '' : this.__renderItemsActions()}

        <foxy-internal-async-list-control
          first=${ifDefined(itemsHref)}
          limit="5"
          infer="items"
          item="foxy-item-card"
        >
        </foxy-internal-async-list-control>
      </div>
    `;
  };

  private readonly __renderEndDate = () => {
    const { disabledSelector, lang, ns } = this;
    const formHiddenSelector = this.hiddenSelector.zoom('end-date:form').toString();

    return html`
      <div class="sm-col-span-2">
        ${this.renderTemplateOrSlot('end-date:before')}

        <foxy-form-dialog
          readonlycontrols=${this.readonlySelector.zoom('end-date:form').toString()}
          disabledcontrols=${disabledSelector.zoom('end-date:form').toString()}
          hiddencontrols="save-button ${formHiddenSelector}"
          data-testid="cancellation-form"
          parent=${this.parent}
          header="end_subscription"
          alert
          form="foxy-cancellation-form"
          href=${this.href}
          lang=${lang}
          id="end-date-form"
          ns=${ns}
          .templates=${this.getNestedTemplates('end-date:form')}
        >
        </foxy-form-dialog>

        <vaadin-button
          data-testid="end-date"
          theme="error"
          class="w-full"
          ?disabled=${!this.data || disabledSelector.matches('end-date', true)}
          @click=${(evt: Event) => {
            const form = this.renderRoot.querySelector('#end-date-form') as FormDialog;
            form.show(evt.currentTarget as ButtonElement);
          }}
        >
          <foxy-i18n key="end_subscription" ns=${ns} lang=${lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('end-date:after')}
      </div>
    `;
  };

  private readonly __checkNextTransactionDateAvailability = (date: Date) => {
    const { settings, data: subscription } = this;

    if (settings && subscription) {
      const value = serializeDate(date);
      return isNextTransactionDate({ value, settings, subscription });
    }

    return date.getTime() >= Date.now();
  };

  private readonly __checkStartDateAvailability = (date: Date) => {
    return date.getTime() >= Date.now();
  };

  private readonly __renderStartDate = () => {
    const { data, lang, ns } = this;

    return html`
      <div data-testid="start-date">
        ${this.renderTemplateOrSlot('start-date:before')}

        <x-group frame>
          <foxy-i18n key="start_date" ns=${ns} lang=${lang} slot="header"></foxy-i18n>
          <foxy-internal-calendar
            start=${ifDefined(data?.start_date.substr(0, 10))}
            value=${ifDefined(data?.start_date)}
            lang=${lang}
            ?readonly=${!this.__isStartDateEditable}
            ?disabled=${this.disabledSelector.matches('start-date', true)}
            .checkAvailability=${this.__checkStartDateAvailability}
            @change=${(evt: Event) => {
              const target = evt.target as InternalCalendar;
              this.edit({ start_date: target.value });
            }}
          >
          </foxy-internal-calendar>
        </x-group>

        ${this.renderTemplateOrSlot('start-date:after')}
      </div>
    `;
  };

  private readonly __renderNextTransactionDate = () => {
    const { data, lang, ns } = this;
    const isActive = !!data?.is_active;

    return html`
      <div data-testid="next-transaction-date">
        ${this.renderTemplateOrSlot('next-transaction-date:before')}

        <x-group frame>
          <foxy-i18n key="next_transaction_date" ns=${ns} lang=${lang} slot="header"></foxy-i18n>
          <foxy-internal-calendar
            start=${ifDefined(data?.next_transaction_date.substr(0, 10))}
            value=${ifDefined(data?.next_transaction_date)}
            lang=${lang}
            ?readonly=${!isActive || this.readonlySelector.matches('next-transaction-date', true)}
            ?disabled=${!data || this.disabledSelector.matches('next-transaction-date', true)}
            .checkAvailability=${this.__checkNextTransactionDateAvailability}
            @change=${(evt: Event) => {
              const target = evt.target as InternalCalendar;
              this.edit({ next_transaction_date: target.value });
            }}
          >
          </foxy-internal-calendar>
        </x-group>

        ${this.renderTemplateOrSlot('next-transaction-date:after')}
      </div>
    `;
  };

  private readonly __renderFrequencyAsDropdown = () => {
    const { data } = this;
    const active = !!data?.is_active;
    const items = this.__frequencies.map(v => ({
      label: this.t(v === '.5m' ? 'twice_a_month' : 'frequency', parseFrequency(v)),
      value: v,
    }));

    return html`
      <vaadin-combo-box
        item-value-path="value"
        item-label-path="label"
        data-testid="frequency"
        ?disabled=${!data || this.disabledSelector.matches('frequency', true)}
        ?readonly=${data && (!active || this.readonlySelector.matches('frequency', true))}
        class="w-full"
        label=${this.t('frequency_label').toString()}
        value=${ifDefined(this.form.frequency)}
        .items=${items}
        @change=${(evt: Event) => {
          this.edit({ frequency: (evt.target as HTMLInputElement).value });
        }}
      >
      </vaadin-combo-box>
    `;
  };

  private readonly __renderFrequencyAsRadioList = () => {
    const { data, lang, ns } = this;

    return html`
      <x-group frame>
        <foxy-i18n key="frequency_label" ns=${ns} lang=${lang} slot="header"></foxy-i18n>

        <x-choice
          default-custom-value="1d"
          data-testid="frequency"
          type="frequency"
          ns=${ns}
          ?custom=${this.settings === null}
          .items=${this.__frequencies}
          .value=${this.form.frequency ?? null}
          ?disabled=${!data || this.disabledSelector.matches('frequency', true)}
          ?readonly=${data && (!data.is_active || this.readonlySelector.matches('frequency', true))}
          @change=${(evt: Event) => {
            this.edit({ frequency: (evt.target as HTMLInputElement).value });
          }}
        >
          ${this.__frequencies.map(
            frequency => html`
              <foxy-i18n
                options=${JSON.stringify(parseFrequency(frequency))}
                slot="${frequency}-label"
                lang=${lang}
                key=${frequency === '.5m' ? 'twice_a_month' : 'frequency'}
                ns=${ns}
              >
              </foxy-i18n>
            `
          )}
        </x-choice>
      </x-group>
    `;
  };

  private readonly __renderFrequency = () => {
    return html`
      <div class="sm-col-span-2">
        ${this.renderTemplateOrSlot('frequency:before')}
        ${this.settings && this.__frequencies.length > 4
          ? this.__renderFrequencyAsDropdown()
          : this.__renderFrequencyAsRadioList()}
        ${this.renderTemplateOrSlot('frequency:after')}
      </div>
    `;
  };

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`items:pagination:card:autorenew-icon ${super.hiddenSelector}`);
  }

  renderBody(): TemplateResult {
    let transactionsHref: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:transactions'].href ?? '');
      url.searchParams.set('order', 'transaction_date desc');
      url.searchParams.set('zoom', 'items');
      transactionsHref = url.toString();
    } catch {
      transactionsHref = undefined;
    }

    const currencyDisplay = this.__store?.use_international_currency_symbol ? 'code' : 'symbol';
    const cart = this.__transactionTemplate;

    let currencyCode: string | null = null;

    if (cart?.currency_code) {
      currencyCode = cart.currency_code;
    } else {
      const allLocaleCodes = this.__localeCodesHelper;
      const localeCode = (this.__templateSet ?? this.__defaultTemplateSet)?.locale_code;
      const localeInfo = localeCode ? allLocaleCodes?.values[localeCode] : void 0;

      if (localeInfo) currencyCode = /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1] ?? null;
    }

    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__transactionTemplateHref)}
        id=${this.__transactionTemplateLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__defaultTemplateSetHref)}
        id=${this.__defaultTemplateSetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__localeCodesHelperHref)}
        id=${this.__localeCodesHelperLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__templateSetHref)}
        id=${this.__templateSetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__storeHref)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div class="relative grid grid-cols-1 sm-grid-cols-2 gap-l">
        ${this.hiddenSelector.matches('header', true)
          ? ''
          : this.__renderHeader(currencyCode ?? void 0, currencyDisplay)}
        ${this.hiddenSelector.matches('items', true) ? '' : this.__renderItems()}
        ${this.__isFrequencyVisible ? this.__renderFrequency() : ''}
        ${this.__isStartDateVisible ? this.__renderStartDate() : ''}
        ${this.__isNextTransactionDateVisible ? this.__renderNextTransactionDate() : ''}

        <foxy-internal-number-control
          suffix=${ifDefined(currencyCode ?? void 0)}
          infer="past-due-amount"
          class="sm-col-span-2"
          min="0"
        >
        </foxy-internal-number-control>

        <foxy-internal-async-list-control
          first=${ifDefined(this.data?._links['fx:attributes'].href)}
          class="sm-col-span-2"
          infer="attributes"
          limit="5"
          form="foxy-attribute-form"
          item="foxy-attribute-card"
        >
        </foxy-internal-async-list-control>

        <foxy-internal-async-list-control
          first=${ifDefined(transactionsHref)}
          class="sm-col-span-2"
          infer="transactions"
          limit="5"
          item="foxy-transaction-card"
          hide-delete-button
          .getPageHref=${this.getTransactionPageHref}
        >
        </foxy-internal-async-list-control>

        <foxy-internal-timestamps-control infer="timestamps" class="sm-col-span-2">
        </foxy-internal-timestamps-control>

        ${this.hiddenSelector.matches('end-date', true) ? '' : this.__renderEndDate()}
      </div>
    `;
  }

  private get __transactionTemplateHref() {
    return this.data?._links['fx:transaction_template'].href;
  }

  private get __defaultTemplateSetHref() {
    const templateSetUri = this.__transactionTemplate?.template_set_uri;

    if (templateSetUri === '') {
      try {
        const url = new URL(this.__store?._links['fx:template_sets'].href ?? '');
        url.searchParams.set('code', 'DEFAULT');
        return url.toString();
      } catch {
        //
      }
    }
  }

  private get __localeCodesHelperHref() {
    if (this.__defaultTemplateSetHref || this.__templateSetHref) {
      return this.localeCodes ?? void 0;
    }
  }

  private get __templateSetHref() {
    const cart = this.__transactionTemplate;
    if (!cart?.currency_code) return cart?.template_set_uri || void 0;
  }

  private get __storeHref() {
    return this.data?._links['fx:store']?.href;
  }

  private get __transactionTemplate() {
    type Loader = NucleonElement<Resource<Rels.TransactionTemplate>>;
    const selector = `#${this.__transactionTemplateLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __defaultTemplateSet() {
    type Loader = NucleonElement<Resource<Rels.TemplateSets>>;
    const selector = `#${this.__defaultTemplateSetLoaderId}`;
    const loader = this.renderRoot.querySelector<Loader>(selector);
    return loader?.data?._embedded['fx:template_sets'][0] ?? null;
  }

  private get __localeCodesHelper() {
    type Loader = NucleonElement<Resource<Rels.LocaleCodes>>;
    const selector = `#${this.__localeCodesHelperLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __templateSet() {
    type Loader = NucleonElement<Resource<Rels.TemplateSet>>;
    const selector = `#${this.__templateSetLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __store() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    const selector = `#${this.__storeLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __isNextTransactionDateVisible() {
    if (this.hiddenSelector.matches('next-transaction-date', true)) return false;
    if (this.data === null) return false;
    if (this.data.end_date && new Date(this.data.end_date).getTime() <= Date.now()) return false;
    if (this.data.is_active === false) return false;
    if (this.settings === null) return true;

    const rules = this.settings.subscriptions.allow_next_date_modification;
    return !!getNextTransactionDateConstraints(this.data, rules);
  }

  private get __isStartDateVisible() {
    if (this.hiddenSelector.matches('start-date', true)) return false;
    return this.__isNextTransactionDateVisible;
  }

  private get __isStartDateEditable() {
    if (this.readonlySelector.matches('start-date', true)) return false;
    if (this.data === null) return false;
    if (this.data.end_date && new Date(this.data.end_date) <= new Date()) return false;
    if (this.data.is_active === false) return false;
    if (this.data.start_date && new Date(this.data.start_date) <= new Date()) return false;

    return this.settings === null;
  }

  private get __isFrequencyVisible() {
    if (this.hiddenSelector.matches('frequency', true)) return false;
    if (this.data === null) return false;
    if (this.data.end_date && new Date(this.data.end_date).getTime() <= Date.now()) return false;
    if (this.data.is_active === false) return false;
    if (this.settings === null) return true;

    const allowedFrequencies = getAllowedFrequencies({
      subscription: this.data,
      settings: this.settings,
    });

    return !allowedFrequencies.next().done;
  }

  private get __frequencies() {
    if (!this.settings || !this.data) return ['.5m', '1m', '1y'];

    const allowedFrequencies = getAllowedFrequencies({
      subscription: this.data,
      settings: this.settings,
    });

    return Array.from(allowedFrequencies);
  }
}
