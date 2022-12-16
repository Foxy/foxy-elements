import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'gift-card-code-log-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element representing a gift card code log (`fx:gift_card_code_log`).
 *
 * @element foxy-gift-card-code-log-card
 * @since 1.21.1
 */
export class GiftCardCodeLogCard extends Base<Data> {
  private readonly __giftCardLoaderId = 'giftCardLoader';

  private readonly __storeLoaderId = 'storeLoader';

  renderBody(): TemplateResult {
    const data = this.data;

    const adjustment = data?.balance_adjustment ?? 0;
    const hasTransaction = typeof data?.transaction_id === 'number';

    const titleKey = hasTransaction ? 'title_used' : 'title_updated_via_api';
    const subtitleKey = hasTransaction ? 'subtitle_transaction' : 'subtitle_no_transaction';
    const subtitleOptions = { transaction_id: data?.transaction_id };

    const dateOptions = {
      date_created: data?.date_created,
      month: 'short',
    };

    const adjustmentOptions = {
      currencyDisplay: this.__store?.use_international_currency_symbol ? 'code' : 'symbol',
      signDisplay: 'exceptZero',
      amount: `${adjustment} ${this.__giftCard?.currency_code}`,
    };

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(data?._links?.['fx:gift_card'].href)}
        id=${this.__giftCardLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div class="leading-s">
        <div class="flex justify-between items-center">
          <span class="text-body font-semibold truncate">
            <foxy-i18n infer="" key=${titleKey}></foxy-i18n>
          </span>
          <span class="text-s text-tertiary flex-shrink-0">
            <foxy-i18n infer="" key="date" .options=${dateOptions}></foxy-i18n>
          </span>
        </div>

        <div class="text-s text-secondary truncate">
          <foxy-i18n infer="" key=${subtitleKey} .options=${subtitleOptions}></foxy-i18n>
          <span class="text-tertiary">&bull;</span>
          <span
            class=${classMap({
              'text-tertiary': adjustment === 0,
              'text-success': adjustment > 0,
              'text-error': adjustment < 0,
            })}
          >
            <foxy-i18n infer="" key="adjustment" .options=${adjustmentOptions}></foxy-i18n>
          </span>
        </div>
      </div>
    `;
  }

  get isBodyReady(): boolean {
    return super.isBodyReady && !!this.__giftCard && !!this.__store;
  }

  private get __giftCardLoader() {
    type Loader = NucleonElement<Resource<Rels.GiftCard>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__giftCardLoaderId}`);
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }

  private get __giftCard() {
    return this.__giftCardLoader?.data;
  }

  private get __store() {
    return this.__storeLoader?.data;
  }
}
