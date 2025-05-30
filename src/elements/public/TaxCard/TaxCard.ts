import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

/**
 * Basic card displaying a tax.
 *
 * @element foxy-tax-card
 * @since 1.13.0
 */
export class TaxCard extends TranslatableMixin(InternalCard, 'tax-card')<Data> {
  renderBody(): TemplateResult {
    let taxItemCategoriesHref: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:tax_item_categories'].href ?? '');
      url.searchParams.set('limit', '1');
      taxItemCategoriesHref = url.toString();
    } catch {
      taxItemCategoriesHref = undefined;
    }

    const taxItemCategories = this.__taxItemCategoriesLoader?.data;

    return html`
      <div class="leading-xs">
        <p class="flex items-center gap-m" data-testid="title">
          <span class="font-medium flex-1">${this.data?.name}&ZeroWidthSpace;</span>
          ${taxItemCategories
            ? html`
                <foxy-i18n
                  options=${JSON.stringify({
                    context: taxItemCategories.total_items > 0 ? '' : 'empty',
                    count: taxItemCategories.total_items,
                  })}
                  class="text-xs text-tertiary"
                  infer=""
                  key="tax_item_categories"
                >
                </foxy-i18n>
              `
            : ''}
        </p>

        <p class="text-s text-secondary" data-testid="subtitle">
          ${this.data ? this.__getTypeLabel(this.data) : ''} &bull;
          ${this.data ? this.__getRateLabel(this.data) : ''}
        </p>
      </div>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(taxItemCategoriesHref)}
        id="taxItemCategoriesLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __taxItemCategoriesLoader() {
    type Loader = NucleonElement<Resource<Rels.TaxItemCategories>>;
    return this.renderRoot.querySelector<Loader>('#taxItemCategoriesLoader');
  }

  private __getTypeLabel({ type, country, region, city }: Data) {
    if (type === 'global') return this.t('tax_global');
    if (type === 'union') return this.t('tax_union');
    if (type === 'country') return country;
    if (type === 'region') return `${country}, ${region}`;
    if (type === 'local') return `${country}, ${region}, ${city}`;
    if (type === 'custom_tax_endpoint') return this.t('tax_custom_tax');
  }

  private __getRateLabel({ is_live, rate }: Data) {
    if (!is_live) return this.t('percent', { fraction: rate / 100 });

    const provider = this.data?.service_provider;
    if (provider === 'onesource') return 'Thomson Reuters ONESOURCE';
    if (provider === 'avalara') return 'Avalara AvaTax 15';
    if (provider === 'taxjar') return 'TaxJar';
    if (provider === 'custom_tax') return this.t('tax_rate_provider_custom');

    return this.t('tax_rate_provider_default');
  }
}
