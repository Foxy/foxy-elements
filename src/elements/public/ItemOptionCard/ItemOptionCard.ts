import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'item-option-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying an item option.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-item-option-card
 * @since 1.17.0
 */
export class ItemOptionCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      localeCodes: { type: String, attribute: 'locale-codes' },
    };
  }

  localeCodes: string | null = null;

  private readonly __transactionTemplateLoaderId = 'transactionTemplateLoader';

  private readonly __defaultTemplateSetLoaderId = 'defaultTemplateSetLoader';

  private readonly __localeCodesHelperLoaderId = 'localeCodesLoader';

  private readonly __transactionLoaderId = 'transactionLoader';

  private readonly __templateSetLoaderId = 'templateSetLoader';

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __cartLoaderId = 'cartLoader';

  renderBody(): TemplateResult {
    const currencyDisplay = this.__store?.use_international_currency_symbol ? 'code' : 'symbol';
    const transaction = this.__transaction;

    let currencyCode: string | null = null;

    if (transaction) {
      currencyCode = transaction.currency_code;
    } else {
      const cart = this.__cart ?? this.__transactionTemplate;

      if (cart && 'currency_code' in cart) {
        // TODO: remove the directive below once the SDK is updated
        // @ts-expect-error SDK types are incomplete
        currencyCode = cart.currency_code;
      } else {
        const allLocaleCodes = this.__localeCodesHelper;
        const localeCode = (this.__templateSet ?? this.__defaultTemplateSet)?.locale_code;
        const localeInfo = localeCode ? allLocaleCodes?.values[localeCode] : void 0;

        if (localeInfo) currencyCode = /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1] ?? null;
      }
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
        href=${ifDefined(this.__transactionHref)}
        id=${this.__transactionLoaderId}
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

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__cartHref)}
        id=${this.__cartLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      ${super.renderBody({
        title: data => {
          if (!currencyCode || !currencyDisplay) return html`&ZeroWidthSpace;`;

          let priceMod: string;

          try {
            priceMod = Math.abs(data.price_mod).toLocaleString(this.lang || 'en', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
              currencyDisplay: currencyDisplay,
              currency: currencyCode,
              style: 'currency',
            });
          } catch {
            priceMod = '--';
          }

          return html`${data.name} &bull; ${priceMod} &bull; ${data.weight_mod}`;
        },
        subtitle: data => html`${data.value}`,
      })}
    `;
  }

  private get __transactionTemplateHref() {
    try {
      const links = this.data?._links as Partial<Record<string, { href: string }>> | undefined;
      const url = new URL(links?.['fx:subscription']?.href ?? '');
      url.searchParams.set('zoom', 'transaction_template');
      return url.toString();
    } catch {
      //
    }
  }

  private get __defaultTemplateSetHref() {
    const templateSetUri = (this.__cart ?? this.__transactionTemplate)?.template_set_uri;

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

  private get __transactionHref() {
    return this.data?._links['fx:transaction']?.href;
  }

  private get __templateSetHref() {
    const cart = this.__cart ?? this.__transactionTemplate;
    // TODO: remove the directive below once SDK is updated
    // @ts-expect-error SDK types are incomplete
    const currencyCode = cart?.currency_code as string | undefined;

    if (!currencyCode) return cart?.template_set_uri || void 0;
  }

  private get __storeHref() {
    return this.data?._links['fx:store']?.href;
  }

  private get __cartHref() {
    const links = this.data?._links as Partial<Record<string, { href: string }>> | undefined;
    return links?.['fx:cart']?.href;
  }

  private get __transactionTemplate() {
    type Loader = NucleonElement<Resource<Rels.Subscription, { zoom: 'transaction_template' }>>;
    const selector = `#${this.__transactionTemplateLoaderId}`;
    const loader = this.renderRoot.querySelector<Loader>(selector);
    return loader?.data?._embedded['fx:transaction_template'] ?? null;
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

  private get __transaction() {
    type Loader = NucleonElement<Resource<Rels.Transaction>>;
    const selector = `#${this.__transactionLoaderId}`;
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

  private get __cart() {
    type Loader = NucleonElement<Resource<Rels.Cart>>;
    const selector = `#${this.__cartLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }
}
