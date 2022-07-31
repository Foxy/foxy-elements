import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';
import { NucleonElement } from '../NucleonElement';

const NS = 'gift-card-code-log-card';
const Base = TranslatableMixin(InternalCard, NS);

export class GiftCardCodeLogCard extends Base<Data> {
  private __giftCard: Resource<Rels.GiftCard> | null = null;

  private __store: Resource<Rels.Store> | null = null;

  renderBody(): TemplateResult {
    const balanceAdjustment = this.form.balance_adjustment ?? 0;
    const hasTransaction = typeof this.form.transaction_id === 'number';
    const subtitleKey = hasTransaction ? 'status_used' : 'status_updated_via_api';
    const currency = this.__giftCard?.currency_code;
    const icon = hasTransaction ? 'icons:shopping-cart' : 'icons:settings';
    const lang = this.lang || 'en';

    let formattedBalanceAdjustment: string;

    try {
      formattedBalanceAdjustment = balanceAdjustment.toLocaleString(lang, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        currencyDisplay: this.__store?.use_international_currency_symbol ? 'code' : 'symbol',
        signDisplay: 'exceptZero',
        currency,
        style: 'currency',
      });
    } catch {
      formattedBalanceAdjustment = String(balanceAdjustment);
    }

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(this.form._links?.['fx:gift_card'].href)}
        @update=${(evt: CustomEvent) => {
          const nucleon = evt.currentTarget as NucleonElement<Resource<Rels.GiftCard>>;
          this.__giftCard = nucleon.data;
          this.requestUpdate();
        }}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.form._links?.['fx:store'].href)}
        @update=${(evt: CustomEvent) => {
          const nucleon = evt.currentTarget as NucleonElement<Resource<Rels.Store>>;
          this.__store = nucleon.data;
          this.requestUpdate();
        }}
      >
      </foxy-nucleon>

      <div class="flex items-start gap-s leading-none">
        <iron-icon class="icon-inline text-m" icon=${icon}></iron-icon>

        <div class="flex-1">
          <foxy-i18n
            infer=""
            class="block mb-xs font-semibold"
            key="title"
            .options=${{ date: this.form.date_created }}
          >
          </foxy-i18n>

          <div class="text-secondary">
            <foxy-i18n infer="" key=${subtitleKey}></foxy-i18n>
            ${hasTransaction
              ? html`
                  &bull;
                  <button
                    class="underline"
                    @click=${() => {
                      const event = new CustomEvent('navigation', {
                        composed: true,
                        bubbles: true,
                        detail: this.form._links?.['fx:transaction'].href,
                      });

                      this.dispatchEvent(event);
                    }}
                  >
                    #${this.form.transaction_id}
                  </button>
                `
              : ''}
          </div>
        </div>

        <div
          class=${classMap({
            'font-semibold font-tnum': true,
            'text-success': balanceAdjustment > 0,
            'text-error': balanceAdjustment < 0,
          })}
        >
          ${formattedBalanceAdjustment}
        </div>
      </div>
    `;
  }
}
