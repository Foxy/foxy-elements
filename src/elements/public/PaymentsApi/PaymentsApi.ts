import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { html, LitElement } from 'lit-element';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { getHandler } from './api/index';
import { API } from '../NucleonElement/API';

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

  paymentMethodSetHostedPaymentGatewaysUrl: string | null = null;

  hostedPaymentGatewaysHelperUrl: string | null = null;

  hostedPaymentGatewaysUrl: string | null = null;

  paymentGatewaysHelperUrl: string | null = null;

  paymentMethodSetsUrl: string | null = null;

  fraudProtectionsUrl: string | null = null;

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
