import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { parseFrequency } from '../../../utils/parse-frequency';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'admin-subscription-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

/**
 * Card element representing a subscription (`fx:subscription`).
 * Admin-only.
 *
 * @element foxy-admin-subscription-card
 * @since 1.21.0
 */
export class AdminSubscriptionCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      localeCodes: { attribute: 'locale-codes' },
    };
  }

  /**
   * URL of the `fx:locale_codes` property helper.
   * This will be used to determine the currency code for subscriptions that link to a
   * transaction template without the code.
   */
  localeCodes: string | null = null;

  private readonly __transactionTemplateLoaderId = 'transactionTemplateLoader';

  private readonly __defaultTemplateSetLoaderId = 'defaultTemplateSetLoader';

  private readonly __localeCodesHelperLoaderId = 'localeCodesLoader';

  private readonly __templateSetLoaderId = 'templateSetLoader';

  private readonly __customerLoaderId = 'customerLoader';

  private readonly __itemsLoaderId = 'itemsLoader';

  private readonly __storeLoaderId = 'storeLoader';

  renderBody(): TemplateResult {
    const isFailed = !!this.data?.first_failed_transaction_date;
    const customer = this.__customer;
    const cart = this.__transactionTemplate;

    const priceKey = this.__priceKey;
    const priceOptions = this.__priceOptions;
    const summaryOptions = this.__summaryOptions;
    const summaryKey = this.__summaryKey;
    const statusKey = this.__statusKey;
    const statusOptions = this.__statusOptions;

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
        href=${ifDefined(this.__customerHref)}
        id=${this.__customerLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__itemsHref)}
        id=${this.__itemsLoaderId}
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

      <div class="text-left leading-s text-tertiary">
        <div class="flex items-center space-x-s">
          <span class="block flex-1 font-medium text-body truncate">
            ${summaryOptions && summaryKey
              ? html`<foxy-i18n infer="" key=${summaryKey} .options=${summaryOptions}></foxy-i18n>`
              : html`&ZeroWidthSpace;`}
          </span>
          <span class="text-s">
            ${priceOptions && priceKey
              ? html`<foxy-i18n infer="" key=${priceKey} .options=${priceOptions}></foxy-i18n>`
              : html`&ZeroWidthSpace;`}
          </span>
        </div>

        <div class="truncate text-s ${isFailed ? 'text-error' : 'text-secondary'}">
          ${statusOptions && statusKey
            ? html`<foxy-i18n infer="" key=${statusKey} .options=${statusOptions}></foxy-i18n>`
            : html`&ZeroWidthSpace;`}
        </div>

        <div class="text-tertiary truncate text-s">
          ${customer?.first_name} ${customer?.last_name} (${cart?.customer_email})
        </div>
      </div>
    `;
  }

  get isBodyReady(): boolean {
    return (
      super.isBodyReady &&
      !!this.__items &&
      !!this.__currencyCode &&
      !!this.__currencyDisplay &&
      !!this.__customer
    );
  }

  private get __transactionTemplateHref() {
    const data = this.data;

    if (!data) return;
    if ('_embedded' in data && 'fx:transaction_template' in data._embedded) return;

    const url = new URL(this.data?._links['fx:transaction_template'].href ?? '');
    url.searchParams.set('zoom', 'items');
    return url.toString();
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

  private get __customerHref() {
    if ('fx:customer' in (this.data?._embedded ?? {})) return;
    return this.data?._links['fx:customer']?.href;
  }

  private get __itemsHref() {
    const cart = this.__transactionTemplate;

    if (!cart) return;
    if ('_embedded' in cart && 'fx:items' in cart._embedded) return;

    const url = new URL(cart._links['fx:items'].href);
    url.searchParams.set('limit', '1');
    return url.toString();
  }

  private get __storeHref() {
    return this.data?._links['fx:store']?.href;
  }

  private get __transactionTemplate() {
    const data = this.data;

    if (data && '_embedded' in data && 'fx:transaction_template' in data._embedded) {
      type Cart = Resource<Rels.TransactionTemplate>;
      type CartWithItems = Resource<Rels.TransactionTemplate, { zoom: 'items' }>;
      return data._embedded['fx:transaction_template'] as Cart | CartWithItems;
    } else {
      type Loader = NucleonElement<Resource<Rels.TransactionTemplate, { zoom: 'items' }>>;
      const selector = `#${this.__transactionTemplateLoaderId}`;
      return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
    }
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

  private get __customer() {
    const data = this.data;

    if (data && '_embedded' in data && 'fx:customer' in data._embedded) {
      return data._embedded['fx:customer'] as Resource<Rels.Customer>;
    } else {
      type Loader = NucleonElement<Resource<Rels.Customer>>;
      const selector = `#${this.__customerLoaderId}`;
      return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
    }
  }

  private get __items() {
    type Cart = Resource<Rels.TransactionTemplate>;
    type CartWithItems = Resource<Rels.TransactionTemplate, { zoom: 'items' }>;

    const cart = this.__transactionTemplate as Cart | CartWithItems | null;

    if (cart && '_embedded' in cart && 'fx:items' in cart._embedded) {
      const items = cart._embedded['fx:items'];

      return {
        array: items,
        count: items.length,
        isApproximateCount: items.length === 20,
      };
    }

    type Loader = NucleonElement<Resource<Rels.Items>>;
    const loader = this.renderRoot.querySelector<Loader>(`#${this.__itemsLoaderId}`);
    if (!loader?.data) return null;

    return {
      array: loader.data._embedded['fx:items'],
      count: loader.data.total_items,
      isApproximateCount: false,
    };
  }

  private get __store() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    const selector = `#${this.__storeLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __currencyDisplay() {
    const useCode = this.__store?.use_international_currency_symbol;

    if (useCode === true) return 'code';
    if (useCode === false) return 'symbol';
  }

  private get __summaryOptions() {
    const { array, count } = this.__items ?? {};
    if (array && count) return { firstItem: array[0], count, countMinus1: count - 1 };
  }

  private get __summaryKey() {
    const items = this.__items;
    if (items) return items.isApproximateCount ? 'summary_approximate' : 'summary';
  }

  private get __statusOptions() {
    const data = this.data;

    if (data === null) return;
    if (data.first_failed_transaction_date) return { date: data.first_failed_transaction_date };
    if (data.end_date) return { date: data.end_date };
    if (data.is_active === false) return {};
    if (new Date(data.start_date) > new Date()) return { date: data.start_date };

    return { date: data.next_transaction_date };
  }

  private get __currencyCode() {
    const cart = this.__transactionTemplate;

    if (cart?.currency_code) {
      return cart.currency_code as string;
    } else {
      const allLocaleCodes = this.__localeCodesHelper;
      const localeCode = (this.__templateSet ?? this.__defaultTemplateSet)?.locale_code;
      const localeInfo = localeCode ? allLocaleCodes?.values[localeCode] : void 0;

      if (localeInfo) return /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1];
    }
  }

  private get __priceOptions() {
    const currencyDisplay = this.__currencyDisplay;
    if (currencyDisplay === undefined) return;

    const currencyCode = this.__currencyCode;
    if (currencyCode === undefined) return;

    const totalOrder = this.__transactionTemplate?.total_order;
    if (totalOrder === undefined) return;

    const frequency = this.data?.frequency;
    if (frequency === undefined) return;

    return {
      ...parseFrequency(frequency),
      amount: `${totalOrder} ${currencyCode}`,
      currencyDisplay,
    };
  }

  private get __statusKey() {
    const data = this.data;

    if (data === null) return;
    if (data.first_failed_transaction_date) return 'subscription_failed';
    if (data.end_date) {
      const hasEnded = new Date(data.end_date).getTime() > Date.now();
      return hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
    }

    if (data.is_active === false) return 'subscription_inactive';
    if (new Date(data.start_date) > new Date()) return 'subscription_will_be_active';

    return 'subscription_active';
  }

  private get __priceKey() {
    const frequency = this.data?.frequency;
    if (frequency) return `price_${frequency === '.5m' ? 'twice_a_month' : 'recurring'}`;
  }
}
