import type { TemplateResult } from 'lit-html';

import '../PaymentsApi/index';
import './index';

import type { FetchEvent } from '../NucleonElement/FetchEvent';

import { html } from 'lit-html';
import { createRouter } from '../../../server/router/createRouter';
import { createDataset } from '../../../server/hapi/createDataset';
import { defaults } from '../../../server/hapi/defaults';
import { links } from '../../../server/hapi/links';
import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const withPaymentsApi = (content: TemplateResult) => html`
  <foxy-payments-api
    payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
    hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
    hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
    payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
    payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
    fraud-protections-url="https://demo.api/hapi/fraud_protections"
    payment-gateways-url="https://demo.api/hapi/payment_gateways"
  >
    ${content}
  </foxy-payments-api>
`;

const summary: Summary = {
  parent: 'https://foxy-payments-api.element/payment_presets/0/payment_methods',
  href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods/R0',
  nucleon: true,
  localName: 'foxy-payments-api-payment-method-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'description',
      'account-id',
      'account-key',
      'third-party-key',
      'test-account-id',
      'test-account-key',
      'test-third-party-key',
      'three-d-secure-toggle',
      'three-d-secure-response',
    ],
  },
};

export default {
  ...getMeta(summary),
  decorators: [(story: () => TemplateResult): TemplateResult => withPaymentsApi(story())],
};

const ext = `
  payment-preset="https://foxy-payments-api.element/payment_presets/0"
  store="https://demo.api/hapi/stores/0"
`;

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';

/**
 * Adds PayPal Platform to the hosted gateway helper and answers connect requests.
 * With `gateway`, hosted gateway 0 becomes a PayPal Platform gateway with those fields.
 * `connection_url` is `about:blank`, so a successful connect blanks the story.
 */
function withPayPal(params: { gateway?: Record<string, unknown>; ppcpSupported?: boolean }) {
  return (story: () => TemplateResult): TemplateResult => {
    const dataset = createDataset();
    const hostedHelper = dataset.property_helpers[1] as unknown as {
      values: Record<string, unknown>;
    };
    hostedHelper.values.paypal_platform = {
      name: 'PayPal',
      id_description: 'PayPal email',
      key_description: '',
      third_party_key_description: '',
      test_id: '',
      test_key: '',
      test_third_party_key: '',
      supports_auth_only: false,
      supports_3d_secure: 0,
      supports_card_verification: false,
      additional_fields: null,
      is_deprecated: false,
    };

    if (params.gateway) {
      Object.assign(dataset.hosted_payment_gateways[0], {
        description: 'PayPal',
        type: 'paypal_platform',
        ...params.gateway,
      });
    }

    const router = createRouter({ defaults, dataset, links });

    const handleFetch = async (evt: FetchEvent) => {
      if (evt.request.url.endsWith('/connect_gateway')) {
        const request = evt.request.clone();
        evt.respondWith(
          request.json().then(body => {
            if (body.options?.paypal_product_type === 'ppcp' && params.ppcpSupported === false) {
              const message =
                "PayPal direct card payments ('ppcp') are not supported in your store's country. Please use 'express_checkout' instead.";
              const error = { _embedded: { 'fx:errors': [{ logref: 'id-0', message }] } };
              return new Response(JSON.stringify(error), { status: 403 });
            }

            return new Response(JSON.stringify({ connection_url: 'about:blank' }), { status: 201 });
          })
        );
      } else if (evt.request.url.startsWith('https://demo.api/hapi/')) {
        router.handleEvent(evt);
      }
    };

    // Needs its own foxy-payments-api inside the mock: the layer's hAPI requests bubble up
    // from that element, so a mock inside the meta decorator's copy would never see them.
    return html`<div @fetch=${handleFetch}>${withPaymentsApi(story())}</div>`;
  };
}

const hostedHref = 'https://foxy-payments-api.element/payment_presets/0/payment_methods/H0C0';

export const PayPalNewConnection = getStory({ ...summary, ext });
PayPalNewConnection.args.href = '';
Object.assign(PayPalNewConnection, { decorators: [withPayPal({})] });

export const PayPalUnsupportedCountry = getStory({ ...summary, ext });
PayPalUnsupportedCountry.args.href = '';
Object.assign(PayPalUnsupportedCountry, { decorators: [withPayPal({ ppcpSupported: false })] });

export const PayPalConnectedPayPalOnly = getStory({ ...summary, ext });
PayPalConnectedPayPalOnly.args.href = hostedHref;
Object.assign(PayPalConnectedPayPalOnly, {
  decorators: [
    withPayPal({ gateway: { test_account_id: 'merchant@example.com', test_third_party_key: '' } }),
  ],
});

export const PayPalConnectedWithCards = getStory({ ...summary, ext });
PayPalConnectedWithCards.args.href = hostedHref;
Object.assign(PayPalConnectedWithCards, {
  decorators: [
    withPayPal({
      gateway: { test_account_id: 'merchant@example.com', test_third_party_key: 'MERCHANT123' },
    }),
  ],
});
