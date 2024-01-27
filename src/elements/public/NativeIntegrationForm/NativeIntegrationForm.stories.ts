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
    sections: ['timestamps'],
    buttons: ['delete', 'create'],
    inputs: [
      'provider',
      'avalara-service-url',
      'avalara-id',
      'avalara-key',
      'avalara-company-code',
      'avalara-options',
      'avalara-address-validation-countries',
      'avalara-category-to-product-tax-code-mappings',
      'taxjar-api-token',
      'taxjar-category-to-product-tax-code-mappings',
      'taxjar-options',
      'onesource-service-url',
      'onesource-external-company-id',
      'onesource-calling-system-number',
      'onesource-from-city',
      'onesource-host-system',
      'onesource-company-role',
      'onesource-part-number-product-option',
      'onesource-product-order-priority',
      'onesource-audit-settings',
      'webhook-service',
      'webhook-json-title',
      'webhook-json-encryption-key',
      'webhook-json-url',
      'webhook-json-events',
      'webhook-legacy-xml-title',
      'webhook-legacy-xml-url',
      'webflow-site-id',
      'webflow-site-name',
      'webflow-collection-id',
      'webflow-collection-name',
      'webflow-sku-field-id',
      'webflow-sku-field-name',
      'webflow-inventory-field-id',
      'webflow-inventory-field-name',
      'webflow-auth',
      'zapier-event',
      'zapier-url',
    ],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Legacy = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Legacy.args.href = 'https://demo.api/hapi/native_integrations/1';
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
