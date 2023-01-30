import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { html, LitElement } from 'lit-element';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { getHandler } from './api/index';
import { API } from '../NucleonElement/API';

/**
 * Adapter element for Payments API. This element requires an additional hAPI adapter
 * that will handle authentication and session management.
 *
 * _Payments API is a client-side virtual API layer built on top of hAPI
 * in an attempt to streamline access to stores' payment method settings
 * that is currently a bit quirky due to the legacy functionality. To use
 * Payments API elements with hAPI, wrap them into this node._
 *
 * @element foxy-payments-api
 * @since 1.21.0
 */
export class PaymentsApi extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      paymentMethodSetHostedPaymentGatewaysUrl: {
        attribute: 'payment-method-set-hosted-payment-gateways-url',
      },

      hostedPaymentGatewaysHelperUrl: { attribute: 'hosted-payment-gateways-helper-url' },
      hostedPaymentGatewaysUrl: { attribute: 'hosted-payment-gateways-url' },
      paymentGatewaysHelperUrl: { attribute: 'payment-gateways-helper-url' },
      paymentMethodSetsUrl: { attribute: 'payment-method-sets-url' },
      fraudProtectionsUrl: { attribute: 'fraud-protections-url' },
      paymentGatewaysUrl: { attribute: 'payment-gateways-url' },
    };
  }

  /** URL of the `fx:payment_method_set_hosted_payment_gateways` collection. */
  paymentMethodSetHostedPaymentGatewaysUrl: string | null = null;

  /** URL of the `fx:hosted_payment_gateways` property helper. */
  hostedPaymentGatewaysHelperUrl: string | null = null;

  /** URL of the `fx:hosted_payment_gateways` collection. */
  hostedPaymentGatewaysUrl: string | null = null;

  /** URL of the `fx:payment_gateways` property helper. */
  paymentGatewaysHelperUrl: string | null = null;

  /** URL of the `fx:payment_method_sets` collection. */
  paymentMethodSetsUrl: string | null = null;

  /** URL of the `fx:fraud_protections` collection. */
  fraudProtectionsUrl: string | null = null;

  /** URL of the `fx:payment_gateways` collection. */
  paymentGatewaysUrl: string | null = null;

  private readonly __api = new API(this);

  private readonly __fetch = this.__api.fetch.bind(this.__api);

  private readonly __handleFetch = (evt: Event) => {
    if (!(evt instanceof FetchEvent)) return;
    if (!evt.request.url.startsWith('https://foxy-payments-api.element/')) return;
    if (evt.defaultPrevented) return;

    const {
      paymentMethodSetHostedPaymentGatewaysUrl,
      hostedPaymentGatewaysHelperUrl,
      paymentGatewaysHelperUrl,
      hostedPaymentGatewaysUrl,
      paymentMethodSetsUrl,
      fraudProtectionsUrl,
      paymentGatewaysUrl,
    } = this;

    if (paymentMethodSetHostedPaymentGatewaysUrl === null) return;
    if (hostedPaymentGatewaysHelperUrl === null) return;
    if (paymentGatewaysHelperUrl === null) return;
    if (hostedPaymentGatewaysUrl === null) return;
    if (paymentMethodSetsUrl === null) return;
    if (fraudProtectionsUrl === null) return;
    if (paymentGatewaysUrl === null) return;

    const createGetter = (link: string) => (id: string) => {
      const url = new URL(link);
      if (!url.pathname.endsWith('/')) url.pathname += '/';
      url.pathname += id;
      return url.toString();
    };

    const handler = getHandler({
      hostedPaymentGatewaysHelperUrl,
      paymentGatewaysHelperUrl,
      hostedPaymentGatewaysUrl,
      paymentMethodSetsUrl,
      fraudProtectionsUrl,
      paymentGatewaysUrl,

      getPaymentMethodSetHostedPaymentGatewayUrl: createGetter(
        paymentMethodSetHostedPaymentGatewaysUrl
      ),

      getHostedPaymentGatewayUrl: createGetter(hostedPaymentGatewaysUrl),
      getPaymentMethodSetUrl: createGetter(paymentMethodSetsUrl),
      getFraudProtectionUrl: createGetter(fraudProtectionsUrl),
      getPaymentGatewayUrl: createGetter(paymentGatewaysUrl),

      request: evt.request,
      fetch: this.__fetch,
    });

    if (handler) {
      evt.preventDefault();
      evt.respondWith(handler);
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('fetch', this.__handleFetch);
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('fetch', this.__handleFetch);
  }
}
