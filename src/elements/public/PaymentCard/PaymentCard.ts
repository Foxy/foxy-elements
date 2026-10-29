import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import * as logos from '../PaymentMethodCard/logos';

import { canReadCollection } from '../../../utils/user-scope';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'payment-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

/**
 * Basic card displaying a payment resource (`fx:payment`).
 *
 * @element foxy-payment-card
 * @since 1.11.0
 */
export class PaymentCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      hostedPaymentGatewaysHelper: { attribute: 'hosted-payment-gateways-helper' },
      paymentGatewaysHelper: { attribute: 'payment-gateways-helper' },
    };
  }

  /** URL of the `fx:hosted_payment_gateways` property helper resource. */
  hostedPaymentGatewaysHelper: string | null = null;

  /** URL of the `fx:payment_gateways` property helper resource. */
  paymentGatewaysHelper: string | null = null;

  private readonly __hostedPaymentGatewaysLoaderId = 'hostedPaymentGatewaysLoader';

  private readonly __paymentGatewaysLoaderId = 'paymentGatewaysLoader';

  private readonly __transactionLoaderId = 'transactionLoader';

  private readonly __storeLoaderId = 'storeLoader';

  renderBody(): TemplateResult {
    const data = this.data;
    const amount = `${data?.amount ?? ''} ${this.__currencyCode}`;
    const amountOptions = { currencyDisplay: this.__currencyDisplay, amount };

    const infoKeys = [
      'processor_response',
      'paypal_payer_id',
      'third_party_id',
      'purchase_order',
    ] as const;

    const score = this.data?.fraud_protection_score ?? 0;
    const scoreColor = score > 0 ? 'text-error' : 'text-success';
    const scoreBackground = score > 0 ? 'bg-error-10' : 'bg-success-10';

    const type = (data?.cc_type ?? 'unknown').toLowerCase() as keyof typeof logos;
    const year = data?.cc_exp_year?.substring(2);
    const month = data?.cc_exp_month;
    const last4Digits = data?.cc_number_masked?.replace(/x/gi, '');

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(this.hostedPaymentGatewaysHelper ?? undefined)}
        id=${this.__hostedPaymentGatewaysLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.paymentGatewaysHelper ?? undefined)}
        id=${this.__paymentGatewaysLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(data?._links['fx:transaction'].href)}
        id=${this.__transactionLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.__canReadStore ? data?._links['fx:store'].href : undefined)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <p class="leading-s">
        <span class="block font-medium text-m" data-testid="line-1">
          <foxy-i18n .options=${amountOptions} infer="" key="price"></foxy-i18n>
          <span>&nbsp;&bull;&nbsp;</span>
          <foxy-i18n .options=${{ value: data?.date_created }} infer="" key="date"></foxy-i18n>
        </span>

        ${this.__gatewayName
          ? html`
              <span class="block text-s text-secondary" data-testid="gateway">
                ${this.__gatewayName}
              </span>
            `
          : ''}
        ${infoKeys.map(key => {
          if (!data?.[key]) return;
          const css = 'block text-s text-tertiary';
          return html`<foxy-i18n class=${css} infer="" key=${key} .options=${data}></foxy-i18n>`;
        })}

        <span class="mt-s flex space-x-s overflow-auto">
          ${month && year && last4Digits
            ? html`
                <span
                  class="truncate flex items-center h-xs rounded-s overflow-hidden bg-contrast-5"
                  data-testid="card-info"
                >
                  <span class="h-xs">${logos[type] ?? logos.unknown}</span>
                  <span class="font-medium px-s">•••• ${last4Digits} ${month}/${year}</span>
                </span>
              `
            : ''}

          <foxy-i18n
            class="truncate flex font-medium h-xs items-center px-s rounded-s text-s ${scoreColor} ${scoreBackground}"
            infer=""
            key="fraud_risk"
            .options=${{ score }}
          >
          </foxy-i18n>
        </span>
      </p>
    `;
  }

  get isBodyReady(): boolean {
    if (!super.isBodyReady) return false;
    if (!this.__currencyCode) return false;
    if (!this.__currencyDisplay) return false;
    if (this.__gatewayName) return true;

    // Wait for both helpers to settle (loaded or failed) instead of waiting for a match:
    // gateway_type can be empty or missing from the helpers, and then it would never match.
    const isSettled = (helper: string | null, loader: NucleonElement<any> | null) => {
      return !helper || !!loader?.data || !!loader?.in('fail');
    };

    return (
      isSettled(this.hostedPaymentGatewaysHelper, this.__hostedPaymentGatewaysLoader) &&
      isSettled(this.paymentGatewaysHelper, this.__paymentGatewaysLoader)
    );
  }

  private get __hostedPaymentGatewaysLoader() {
    type Loader = NucleonElement<Resource<Rels.HostedPaymentGatewaysHelper>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__hostedPaymentGatewaysLoaderId}`);
  }

  private get __paymentGatewaysLoader() {
    type Loader = NucleonElement<Resource<Rels.PaymentGatewaysHelper>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__paymentGatewaysLoaderId}`);
  }

  private get __transactionLoader() {
    type Loader = NucleonElement<Resource<Rels.Transaction>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__transactionLoaderId}`);
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }

  // Payments belong to transactions, so the transaction is always readable here.
  // Without the store the price falls back to the currency symbol.
  private get __canReadStore() {
    return canReadCollection(this.currentUserScope, 'stores');
  }

  private get __currencyDisplay() {
    const store = this.__storeLoader?.data;
    if (!store && !this.__canReadStore) return 'symbol';
    return store ? (store.use_international_currency_symbol ? 'code' : 'symbol') : void 0;
  }

  private get __currencyCode() {
    return this.__transactionLoader?.data?.currency_code;
  }

  private get __gatewayName() {
    const type = this.data?.gateway_type;
    if (type) {
      const gateway = this.__paymentGatewaysLoader?.data?.values[type];
      const hostedGateway = this.__hostedPaymentGatewaysLoader?.data?.values[type];
      return gateway?.name ?? hostedGateway?.name;
    }
  }
}
