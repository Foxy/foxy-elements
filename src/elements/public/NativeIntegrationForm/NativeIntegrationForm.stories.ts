import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/native_integrations/0',
  parent: 'https://demo.api/hapi/native_integrations',
  nucleon: true,
  localName: 'foxy-native-integration-form',
  translatable: true,
  configurable: {
    sections: [
      'provider-group-one',
      'avalara-group-one',
      'avalara-group-two',
      'avalara-group-three',
      'taxjar-group-one',
      'taxjar-group-two',
      'onesource-group-one',
      'onesource-group-two',
      'onesource-group-three',
      'onesource-group-four',
      'onesource-group-five',
      'webhook-json-group-one',
      'webhook-json-group-two',
      'webhook-legacy-xml-group-one',
      'webflow-group-one',
      'webflow-group-two',
      'webflow-group-three',
      'webflow-group-four',
      'zapier-group-one',
      'apple-pay-group-one',
      'custom-tax-group-one',
      'timestamps',
      'header',
    ],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'provider-group-one:provider',
      'avalara-group-one:avalara-service-url',
      'avalara-group-one:avalara-id',
      'avalara-group-one:avalara-key',
      'avalara-group-one:avalara-company-code',
      'avalara-group-two:avalara-category-to-product-tax-code-mappings',
      'avalara-group-three:avalara-use-ava-tax',
      'avalara-group-three:avalara-enable-colorado-delivery-fee',
      'avalara-group-three:avalara-create-invoice',
      'avalara-group-three:avalara-use-address-validation',
      'avalara-group-three:avalara-address-validation-countries',
      'taxjar-group-one:taxjar-api-token',
      'taxjar-group-one:taxjar-create-invoice',
      'taxjar-group-two:taxjar-category-to-product-tax-code-mappings',
      'onesource-group-one:onesource-service-url',
      'onesource-group-one:onesource-external-company-id',
      'onesource-group-one:onesource-from-city',
      'onesource-group-two:onesource-calling-system-number',
      'onesource-group-two:onesource-host-system',
      'onesource-group-three:onesource-company-role',
      'onesource-group-three:onesource-audit-settings',
      'onesource-group-four:onesource-part-number-product-option',
      'onesource-group-five:onesource-product-order-priority',
      'webhook-json-group-one:webhook-json-title',
      'webhook-json-group-one:webhook-json-encryption-key',
      'webhook-json-group-one:webhook-json-url',
      'webhook-json-group-one:webhook-service',
      'webhook-json-group-two:webhook-json-events-subscription-cancelled',
      'webhook-json-group-two:webhook-json-events-transaction-created',
      'webhook-legacy-xml-group-one:webhook-legacy-xml-title',
      'webhook-legacy-xml-group-one:webhook-legacy-xml-url',
      'webhook-legacy-xml-group-one:webhook-service',
      'webflow-group-one:webflow-site-id',
      'webflow-group-one:webflow-site-name',
      'webflow-group-two:webflow-collection-id',
      'webflow-group-two:webflow-collection-name',
      'webflow-group-three:webflow-sku-field-id',
      'webflow-group-three:webflow-sku-field-name',
      'webflow-group-four:webflow-inventory-field-id',
      'webflow-group-four:webflow-inventory-field-name',
      'zapier-group-one:zapier-events',
      'zapier-group-one:zapier-url',
      'apple-pay-group-one:apple-pay-merchant-id',
      'custom-tax-group-one:custom-tax-url',
    ],
  },
};

export default getMeta(summary);

const ext = `store="https://demo.api/hapi/stores/0"`;

export const Playground = getStory({ ...summary, ext, code: true });
export const Legacy = getStory({ ...summary, ext });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Legacy.args.href = 'https://demo.api/hapi/native_integrations/1';
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
