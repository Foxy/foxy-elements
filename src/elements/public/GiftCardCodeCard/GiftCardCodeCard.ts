import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'gift-card-code-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element that displays a gift card code (`fx:gift_card_code`).
 *
 * @element foxy-gift-card-code-card
 * @since 1.27.0
 */
export class GiftCardCodeCard extends Base<Data> {
  private readonly __giftCardLoaderId = 'giftCardLoader';

  private readonly __storeLoaderId = 'storeLoader';

  get isBodyReady(): boolean {
    return super.isBodyReady && !!this.__giftCardLoader?.data && !!this.__storeLoader?.data;
  }

  renderBody(): TemplateResult {
    const giftCard = this.__giftCardLoader?.data;
    const store = this.__storeLoader?.data;

    return html`
      <section class="h-s flex flex-col justify-center leading-xs">
        <p class="flex items-center justify-between min-w-0">
          <foxy-i18n
            infer=""
            class="block truncate text-m font-medium"
            key="line_1"
            .options=${this.data}
          >
          </foxy-i18n>
          <foxy-i18n
            infer=""
            class="text-s text-tertiary"
            key="current_balance"
            .options=${{
              currencyDisplay: store?.use_international_currency_symbol ? 'code' : 'symbol',
              value: `${this.data?.current_balance} ${giftCard?.currency_code}`,
            }}
          >
          </foxy-i18n>
        </p>
        <p class="text-s text-secondary min-w-0">
          <foxy-i18n infer="" class="block truncate" key="line_2" .options=${this.data}>
          </foxy-i18n>
        </p>
      </section>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.data?._links['fx:gift_card'].href)}
        id=${this.__giftCardLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __giftCardLoader() {
    type Loader = NucleonElement<Resource<Rels.GiftCard>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__giftCardLoaderId}`);
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }
}
