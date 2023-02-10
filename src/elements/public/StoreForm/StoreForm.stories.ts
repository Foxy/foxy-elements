import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/stores/0',
  parent: 'https://demo.api/hapi/stores',
  nucleon: true,
  localName: 'foxy-store-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['is-maintenance-mode', 'create', 'delete'],
    inputs: [
      'store-name',
      'logo-url',
      'store-domain',
      'store-url',
      'store-email',
      'timezone',
      'store-version-uri',
      'from-email',
      'bcc-on-receipt-email',
      'use-email-dns',
      'use-smtp-config',
      'smtp-config',
      'smtp-config-host',
      'smtp-config-port',
      'smtp-config-username',
      'smtp-config-password',
      'smtp-config-security',
      'country',
      'region',
      'postal-code',
      'shipping-address-type',
      'features-multiship',
      'require-signed-shipping-rates',
      'language',
      'locale-code',
      'currency-style',
      'custom-display-id-config',
      'receipt-continue-url',
      'app-session-time',
      'products-require-expires-property',
      'use-cart-validation',
      'checkout-type',
      'customer-password-hash-type',
      'customer-password-hash-config',
      'unified-order-entry-password',
      'single-sign-on-url',
      'webhook-url',
      'webhook-key-cart-signing',
      'webhook-key-xml-datafeed',
      'webhook-key-api-legacy',
      'webhook-key-sso',
    ],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
