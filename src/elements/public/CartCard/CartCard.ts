import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'cart-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

/**
 * Card element displaying cart summary.
 *
 * @element foxy-cart-card
 * @since 1.21.0
 */
export class CartCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      localeCodes: { type: String, attribute: 'locale-codes' },
    };
  }

  localeCodes: string | null = null;

  private readonly __defaultTemplateSetLoaderId = 'defaultTemplateSetLoader';

  private readonly __localeCodesHelperLoaderId = 'localeCodesLoader';

  private readonly __templateSetLoaderId = 'templateSetLoader';

  private readonly __itemsLoaderId = 'itemsLoader';

  private readonly __storeLoaderId = 'storeLoader';

  renderBody(): TemplateResult {
    const statusOptions = this.__statusOptions;
    const line1Options = this.__line1Options;
    const line1Key = this.__line1Key;
    const line2Options = this.__line2Options;
    const line2Key = this.__line2Key;
    const data = this.data;

    return html`
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

      <div class="text-left leading-s">
        <div class="flex items-center space-x-s">
          <span class="flex-1 font-semibold text-body truncate">
            ${line1Options && line1Key
              ? html`<foxy-i18n infer="" key=${line1Key} .options=${line1Options}></foxy-i18n>`
              : html`&ZeroWidthSpace;`}
          </span>
          <span class="text-s text-tertiary">
            ${data
              ? html`<foxy-i18n infer="" key="status" .options=${statusOptions}></foxy-i18n>`
              : html`&ZeroWidthSpace;`}
          </span>
        </div>

        <div class="truncate text-s text-secondary">
          ${line2Key
            ? html`<foxy-i18n infer="" key=${line2Key} .options=${line2Options}></foxy-i18n>`
            : html`&ZeroWidthSpace;`}
        </div>

        <div class="text-tertiary truncate text-s">
          ${data
            ? data.customer_email
              ? html`${data.customer_email}`
              : html`<foxy-i18n infer="" key="no_customer"></foxy-i18n>`
            : html`&ZeroWidthSpace;`}
        </div>
      </div>
    `;
  }

  get isBodyReady(): boolean {
    const isLoaded = !!this.__line1Options && !!this.__statusOptions && !!this.__line2Key;
    return super.isBodyReady && isLoaded;
  }

  private get __defaultTemplateSetHref() {
    const templateSetUri = this.data?.template_set_uri;

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
    // TODO: remove the directive below once SDK is updated
    // @ts-expect-error SDK types are incomplete
    const currencyCode = this.data?.currency_code as string | undefined;

    if (!currencyCode) return this.data?.template_set_uri || void 0;
  }

  private get __itemsHref() {
    const data = this.data;

    if (!data) return;
    if ('_embedded' in data && 'fx:items' in data._embedded) return;

    const url = new URL(data._links['fx:items'].href);

    url.searchParams.set('order', 'price desc');
    url.searchParams.set('limit', '1');

    return url.toString();
  }

  private get __storeHref() {
    return this.data?._links['fx:store']?.href;
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

  private get __items() {
    const data = this.data;

    if (data && '_embedded' in data && 'fx:items' in data._embedded) {
      const items = data._embedded['fx:items'];

      return {
        array: items,
        count: items.length,
        isApproximateCount: items.length === 20,
      };
    }

    type Loader = NucleonElement<Resource<Rels.Items>>;
    const loader = this.renderRoot.querySelector<Loader>(`#${this.__itemsLoaderId}`);

    if (!loader?.data) return;

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

  private get __currencyCode() {
    const data = this.data;

    if (data && 'currency_code' in data) {
      // TODO: remove the directive below once the SDK is updated
      // @ts-expect-error SDK types are incomplete
      return data.currency_code as string;
    } else {
      const allLocaleCodes = this.__localeCodesHelper;
      const localeCode = (this.__templateSet ?? this.__defaultTemplateSet)?.locale_code;
      const localeInfo = localeCode ? allLocaleCodes?.values[localeCode] : void 0;

      if (localeInfo) return /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1];
    }
  }

  private get __line1Options() {
    const totalOrder = this.data?.total_order;
    if (totalOrder === undefined) return;

    const currencyDisplay = this.__currencyDisplay;
    if (currencyDisplay === undefined) return;

    const currencyCode = this.__currencyCode;
    if (currencyCode === undefined) return;

    const count = this.__items?.count;
    if (count === undefined) return;

    return { amount: `${totalOrder} ${currencyCode}`, currencyDisplay, count };
  }

  private get __line1Key() {
    const items = this.__items;
    if (items) return items.isApproximateCount ? 'line_1_approximate' : 'line_1';
  }

  private get __line2Options() {
    const items = this.__items;

    if (items === undefined) return;
    if (items.count === 0) return;

    return { firstItem: items.array[0], count: items.count };
  }

  private get __line2Key() {
    const items = this.__items;
    if (items) return items.count === 0 ? 'line_2_no_items' : 'line_2';
  }

  private get __statusOptions() {
    const data = this.data;
    if (data) return { dateCreated: data.date_created };
  }
}
