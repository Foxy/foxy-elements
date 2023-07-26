import type { PropertyDeclarations } from 'lit-element';

import { LitElement } from 'lit-element';
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
      paymentMethodSetHostedPaymentGatewayBaseUrl: {
        attribute: 'payment-method-set-hosted-payment-gateway-base-url',
      },

      paymentMethodSetHostedPaymentGatewaysUrl: {
        attribute: 'payment-method-set-hosted-payment-gateways-url',
      },

      hostedPaymentGatewaysHelperUrl: { attribute: 'hosted-payment-gateways-helper-url' },
      hostedPaymentGatewayBaseUrl: { attribute: 'hosted-payment-gateway-base-url' },
      hostedPaymentGatewaysUrl: { attribute: 'hosted-payment-gateways-url' },
      paymentGatewaysHelperUrl: { attribute: 'payment-gateways-helper-url' },
      paymentMethodSetBaseUrl: { attribute: 'payment-method-set-base-url' },
      paymentMethodSetsUrl: { attribute: 'payment-method-sets-url' },
      fraudProtectionBaseUrl: { attribute: 'fraud-protection-base-url' },
      fraudProtectionsUrl: { attribute: 'fraud-protections-url' },
      paymentGatewayBaseUrl: { attribute: 'payment-gateway-base-url' },
      paymentGatewaysUrl: { attribute: 'payment-gateways-url' },
    };
  }

  /**
   * Base URL of the `fx:payment_method_set_hosted_payment_gateway` resource (without ID).
   * @example https://api.foxy.io/payment_method_set_hosted_payment_gateways/
   */
  paymentMethodSetHostedPaymentGatewayBaseUrl: string | null = null;

  /**
   * URL of the `fx:payment_method_set_hosted_payment_gateways` collection.
   * @example https://api.foxy.io/stores/0/payment_method_set_hosted_payment_gateways
   */
  paymentMethodSetHostedPaymentGatewaysUrl: string | null = null;

  /**
   * URL of the `fx:hosted_payment_gateways` property helper.
   * @example https://api.foxy.io/property_helpers/hosted_payment_gateways
   */
  hostedPaymentGatewaysHelperUrl: string | null = null;

  /**
   * Base URL of the `fx:hosted_payment_gateway` resource (without ID).
   * @example https://api.foxy.io/hosted_payment_gateways/
   */
  hostedPaymentGatewayBaseUrl: string | null = null;

  /**
   * URL of the `fx:hosted_payment_gateways` collection.
   * @example https://api.foxy.io/stores/0/hosted_payment_gateways
   */
  hostedPaymentGatewaysUrl: string | null = null;

  /**
   * URL of the `fx:payment_gateways` property helper.
   * @example https://api.foxy.io/property_helpers/payment_gateways
   */
  paymentGatewaysHelperUrl: string | null = null;

  /**
   * Base URL of the `fx:payment_method_set` resource (without ID).
   * @example https://api.foxy.io/payment_method_sets/
   */
  paymentMethodSetBaseUrl: string | null = null;

  /**
   * URL of the `fx:payment_method_sets` collection.
   * @example https://api.foxy.io/stores/0/payment_method_sets
   */
  paymentMethodSetsUrl: string | null = null;

  /**
   * Base URL of the `fx:fraud_protection` resource (without ID).
   * @example https://api.foxy.io/fraud_protections/
   */
  fraudProtectionBaseUrl: string | null = null;

  /**
   * URL of the `fx:fraud_protections` collection.
   * @example https://api.foxy.io/stores/0/fraud_protections
   */
  fraudProtectionsUrl: string | null = null;

  /**
   * Base URL of the `fx:payment_gateway` resource (without ID).
   * @example https://api.foxy.io/payment_gateways/
   */
  paymentGatewayBaseUrl: string | null = null;

  /**
   * URL of the `fx:payment_gateways` collection.
   * @example https://api.foxy.io/stores/0/payment_gateways
   */
  paymentGatewaysUrl: string | null = null;

  private readonly __api = new API(this);

  private readonly __fetch = this.__api.fetch.bind(this.__api);

  private readonly __handleFetch = (evt: Event) => {
    if (!(evt instanceof FetchEvent)) return;
    if (!evt.request.url.startsWith('https://foxy-payments-api.element/')) return;
    if (evt.defaultPrevented) return;

    const {
      paymentMethodSetHostedPaymentGatewaysUrl,
      paymentMethodSetHostedPaymentGatewayBaseUrl = paymentMethodSetHostedPaymentGatewaysUrl,
      hostedPaymentGatewaysHelperUrl,
      paymentGatewaysHelperUrl,
      hostedPaymentGatewaysUrl,
      hostedPaymentGatewayBaseUrl = hostedPaymentGatewaysUrl,
      paymentMethodSetsUrl,
      paymentMethodSetBaseUrl = paymentMethodSetsUrl,
      fraudProtectionsUrl,
      fraudProtectionBaseUrl = fraudProtectionsUrl,
      paymentGatewaysUrl,
      paymentGatewayBaseUrl = paymentGatewaysUrl,
    } = this;

    if (paymentMethodSetHostedPaymentGatewaysUrl === null) return;
    if (paymentMethodSetHostedPaymentGatewayBaseUrl === null) return;
    if (hostedPaymentGatewaysHelperUrl === null) return;
    if (paymentGatewaysHelperUrl === null) return;
    if (hostedPaymentGatewaysUrl === null) return;
    if (hostedPaymentGatewayBaseUrl === null) return;
    if (paymentMethodSetsUrl === null) return;
    if (paymentMethodSetBaseUrl === null) return;
    if (fraudProtectionsUrl === null) return;
    if (fraudProtectionBaseUrl === null) return;
    if (paymentGatewaysUrl === null) return;
    if (paymentGatewayBaseUrl === null) return;

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

      getHostedPaymentGatewayUrl: createGetter(hostedPaymentGatewayBaseUrl),
      getPaymentMethodSetUrl: createGetter(paymentMethodSetBaseUrl),
      getFraudProtectionUrl: createGetter(fraudProtectionBaseUrl),
      getPaymentGatewayUrl: createGetter(paymentGatewayBaseUrl),

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

  createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('fetch', this.__handleFetch);
  }
}
