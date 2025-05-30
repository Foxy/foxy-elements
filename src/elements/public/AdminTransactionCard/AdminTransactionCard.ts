import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Data } from './types';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { getResourceId } from '@foxy.io/sdk/core';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../utils/class-map';

const NS = 'admin-transaction-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

/**
 * Basic card displaying a transaction (`fx:transaction`), for use in Foxy Admin only.
 *
 * @element foxy-admin-transaction-card
 * @since 1.46.0
 */
export class AdminTransactionCard extends Base<Data> {
  renderBody(): TemplateResult {
    const store = this.__storeLoader?.data;
    const data = this.data;

    const folder = data?._embedded?.['fx:folder'];
    const items = data?._embedded?.['fx:items'];

    const displayId = data?.display_id || (data ? getResourceId(data._links.self.href) : '');
    const status = data?.status || 'completed';
    const source = data?.source;
    const type = data?.type;

    const statusColors: Record<string, string> = {
      pending_fraud_review: 'text-error',
      declined: 'text-error',
      rejected: 'text-error',
      problem: 'text-error',
    };

    return html`
      <div class="flex items-center gap-xs">
        <span class="font-medium">${displayId}</span>

        ${folder ? this.__renderFolderBadge(folder) : ''}
        ${source ? this.__renderSourceBadge(source) : ''}
        ${data?.is_test ? this.__renderTestBadge() : ''}

        <span class="inline-flex flex-1">&ZeroWidthSpace;</span>

        ${data?.hide_transaction
          ? html`
              <vcf-tooltip for="hidden" theme="light" position="bottom">
                <foxy-i18n infer="" key="hidden_hint"></foxy-i18n>
              </vcf-tooltip>
              <span class="inline-block text-s text-tertiary rounded-s cursor-default" id="hidden">
                ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1em; height: 1em;"><path d="M3 2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3Z" /><path fill-rule="evenodd" d="M3 6h10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm3 2.75A.75.75 0 0 1 6.75 8h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 6 8.75Z" clip-rule="evenodd" /></svg>`}
              </span>
            `
          : ''}

        <foxy-i18n
          options=${JSON.stringify({ value: data?.transaction_date })}
          infer=""
          class="text-s text-tertiary"
          key="time"
        >
        </foxy-i18n>
      </div>

      <div class="text-s text-secondary truncate">
        ${type !== 'updateinfo' && type !== 'subscription_cancellation'
          ? html`
              <foxy-i18n
                options=${JSON.stringify({
                  currencyDisplay: store?.use_international_currency_symbol ? 'code' : 'symbol',
                  amount: `${data?.total_order} ${data?.currency_code}`,
                })}
                class="whitespace-nowrap"
                infer=""
                key="price"
              >
              </foxy-i18n>
              <span>&bull;</span>
            `
          : ''}
        ${items
          ? html`
              <foxy-i18n
                options=${JSON.stringify({
                  count_minus_one: items.length - 1,
                  context: type,
                  first_item: items[0],
                  count: items.length,
                })}
                infer=""
                key="summary"
              >
              </foxy-i18n>
            `
          : ''}
      </div>

      <div class="text-s text-secondary truncate">
        ${data?.customer_first_name} ${data?.customer_last_name} (${data?.customer_email})
      </div>

      <div class="text-s text-secondary truncate">
        <foxy-i18n class=${statusColors[status] || ''} infer="" key="status_${status}"></foxy-i18n>
      </div>

      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id="storeLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  get isBodyReady(): boolean {
    return super.isBodyReady && (!this.data?._links['fx:store'] || !!this.__storeLoader?.data);
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>('#storeLoader');
  }

  private __renderFolderBadge(folder: Data['_embedded']['fx:folder']) {
    const color = folder.color ?? '';
    const knownColors: Record<string, string> = {
      red: 'bg-folder-red text-white',
      red_pale: 'bg-folder-red-pale text-black',
      green: 'bg-folder-green text-white',
      green_pale: 'bg-folder-green-pale text-black',
      blue: 'bg-folder-blue text-white',
      blue_pale: 'bg-folder-blue-pale text-black',
      orange: 'bg-folder-orange text-white',
      orange_pale: 'bg-folder-orange-pale text-black',
      violet: 'bg-folder-violet text-white',
      violet_pale: 'bg-folder-violet-pale text-black',
    };

    return html`
      <span
        class=${classMap({
          'inline-flex items-center gap-xs text-s rounded-s px-xs': true,
          'bg-contrast-5 text-body': !(color in knownColors),
          [knownColors[color] ?? '']: color in knownColors,
        })}
      >
        ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1em; height: 1em;"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z" /></svg>`}
        ${folder?.name || html`<foxy-i18n infer="" key="folder_no_name"></foxy-i18n>`}
      </span>
    `;
  }

  private __renderSourceBadge(source: Data['source']) {
    const sourceType = source.substring(0, 3).toUpperCase() as 'MIT' | 'CIT';

    return html`
      <span class="cursor-default text-s px-xs bg-contrast-5 rounded-s" id="source">
        ${sourceType}
      </span>
      <vcf-tooltip for="source" theme="light" position="bottom">
        <foxy-i18n infer="" key="source_${sourceType}"></foxy-i18n>
      </vcf-tooltip>
    `;
  }

  private __renderTestBadge() {
    return html`
      <foxy-i18n infer="" class="inline-block text-s bg-contrast-5 rounded-s px-xs" key="test">
      </foxy-i18n>
    `;
  }
}
