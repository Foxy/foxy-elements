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
    sections: ['timestamps', 'header'],
    buttons: ['create', 'delete', 'undo', 'submit', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'essentials-group-one',
      'essentials-group-one:store-name',
      'essentials-group-one:logo-url',
      'essentials-group-one:store-domain',
      'essentials-group-one:store-url',

      'essentials-group-two',
      'essentials-group-two:is-maintenance-mode',

      'essentials-group-three',
      'essentials-group-three:store-email',

      'essentials-group-four',
      'essentials-group-four:timezone',
      'essentials-group-four:country',
      'essentials-group-four:region',
      'essentials-group-four:postal-code',
      'essentials-group-four:currency-style',

      'store-secrets',
      'store-secrets:use-single-secret',
      'store-secrets:webhook-key',
      'store-secrets:webhook-key-api-legacy',
      'store-secrets:webhook-key-xml-datafeed',
      'store-secrets:webhook-key-cart-signing',
      'store-secrets:webhook-key-sso',

      'emails',
      'emails:from-email',
      'emails:use-email-dns',
      'emails:use-smtp-config',
      'emails:smtp-config-host',
      'emails:smtp-config-port',
      'emails:smtp-config-username',
      'emails:smtp-config-password',
      'emails:smtp-config-security',
      'emails:send-html-email',

      'shipping',
      'shipping:shipping-address-type',
      'shipping:features-multiship',
      'shipping:require-signed-shipping-rates',

      'cart',
      'cart:app-session-time',
      'cart:products-require-expires-property',
      'cart:use-cart-validation',

      'checkout',
      'checkout:checkout-type',
      'checkout:customer-password-hash-type',
      'checkout:customer-password-hash-config',
      'checkout:unified-order-entry-password',
      'checkout:use-single-sign-on-url',
      'checkout:single-sign-on-url',

      'receipt',
      'receipt:receipt-continue-url',
      'receipt:bcc-on-receipt-email',

      'custom-display-id-config',
      'custom-display-id-config:custom-display-id-config-enabled',
      'custom-display-id-config:custom-display-id-config-start',
      'custom-display-id-config:custom-display-id-config-length',
      'custom-display-id-config:custom-display-id-config-prefix',
      'custom-display-id-config:custom-display-id-config-suffix',
      'custom-display-id-config-transaction-journal-entries-enabled',
      'custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-authcapture-prefix',
      'custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-capture-prefix',
      'custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-void-prefix',
      'custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-refund-prefix',
      'custom-display-id-config-transaction-journal-entries-transaction-separator',

      'xml-datafeed',
      'xml-datafeed:use-webhook',
      'xml-datafeed:webhook-url',
    ],
  },
};

export default getMeta(summary);

const ext = `
  reporting-store-domain-exists="https://demo.api/virtual/empty?status=200"
  customer-password-hash-types="https://demo.api/hapi/property_helpers/9"
  shipping-address-types="https://demo.api/hapi/property_helpers/5"
  h-captcha-site-key="10000000-ffff-ffff-ffff-000000000001"
  timezones="https://demo.api/hapi/property_helpers/2"
  countries="https://demo.api/hapi/property_helpers/3"
  regions="https://demo.api/hapi/property_helpers/4"
`;

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
