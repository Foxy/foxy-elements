import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/template_configs/0',
  parent: 'https://demo.api/hapi/template_configs',
  nucleon: true,
  localName: 'foxy-template-config-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header'],
    buttons: ['create', 'delete', 'undo', 'submit', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'cart-group-one',
      'cart-group-one:cart-type',
      'cart-group-one:cart-display-config-usage',

      'cart-group-two',
      'cart-group-two:cart-display-config-show-product-weight',
      'cart-group-two:cart-display-config-show-product-category',
      'cart-group-two:cart-display-config-show-product-code',
      'cart-group-two:cart-display-config-show-product-options',

      'cart-group-three',
      'cart-group-three:cart-display-config-show-sub-frequency',
      'cart-group-three:cart-display-config-show-sub-startdate',
      'cart-group-three:cart-display-config-show-sub-nextdate',
      'cart-group-three:cart-display-config-show-sub-enddate',

      'cart-group-four',
      'cart-group-four:cart-display-config-hidden-product-options',

      'country-and-region-group-one',
      'country-and-region-group-one:foxycomplete-usage',
      'country-and-region-group-one:foxycomplete-show-combobox',
      'country-and-region-group-one:foxycomplete-combobox-open',
      'country-and-region-group-one:foxycomplete-combobox-close',
      'country-and-region-group-one:foxycomplete-show-flags',
      'country-and-region-group-one:postal-code-lookup',
      'country-and-region-group-one:location-filtering-usage',

      'country-and-region-group-two',
      'country-and-region-group-two:location-filtering-filter-type',
      'country-and-region-group-two:location-filtering-filter-values',

      'country-and-region-group-three',
      'country-and-region-group-three:location-filtering-shipping-filter-type',
      'country-and-region-group-three:location-filtering-shipping-filter-values',

      'country-and-region-group-four',
      'country-and-region-group-four:location-filtering-billing-filter-type',
      'country-and-region-group-four:location-filtering-billing-filter-values',

      'customer-accounts',
      'customer-accounts:checkout-type-account',
      'customer-accounts:checkout-type-default',

      'consent-group-one',
      'consent-group-one:tos-checkbox-settings-usage',
      'consent-group-one:tos-checkbox-settings-url',
      'consent-group-one:tos-checkbox-settings-initial-state',
      'consent-group-one:tos-checkbox-settings-is-hidden',

      'consent-group-two',
      'consent-group-two:eu-secure-data-transfer-consent-usage',

      'consent-group-three',
      'consent-group-three:newsletter-subscribe-usage',

      'supported-cards-group',
      'supported-cards-group:supported-payment-cards',

      'csc-requirements-group',
      'csc-requirements-group:csc-requirements',

      'checkout-fields-group-one',
      'checkout-fields-group-one:custom-checkout-field-requirements-cart-controls',

      'checkout-fields-group-two',
      'checkout-fields-group-two:custom-checkout-field-requirements-billing-address-one',
      'checkout-fields-group-two:custom-checkout-field-requirements-billing-address-two',
      'checkout-fields-group-two:custom-checkout-field-requirements-billing-city',
      'checkout-fields-group-two:custom-checkout-field-requirements-billing-region',
      'checkout-fields-group-two:custom-checkout-field-requirements-billing-postal-code',
      'checkout-fields-group-two:custom-checkout-field-requirements-billing-country',

      'checkout-fields-group-three',
      'checkout-fields-group-three:custom-checkout-field-requirements-billing-first-name',
      'checkout-fields-group-three:custom-checkout-field-requirements-billing-last-name',
      'checkout-fields-group-three:custom-checkout-field-requirements-billing-company',
      'checkout-fields-group-three:custom-checkout-field-requirements-billing-tax-id',
      'checkout-fields-group-three:custom-checkout-field-requirements-billing-phone',
      'checkout-fields-group-three:custom-checkout-field-requirements-coupon-entry',

      'csp',
      'csp-group-one',
      'csp-group-one:csp-enable-csp',
      'csp-group-one:csp-policy-enforce-reporting-endpoint',
      'csp-group-one:csp-policy-enforce-script-src',
      'csp-group-two',
      'csp-group-two:csp-enable-ro-csp',
      'csp-group-two:csp-policy-report-reporting-endpoint',
      'csp-group-two:csp-policy-report-script-src',

      'analytics-config',
      'analytics-config:analytics-config-usage',

      'analytics-config-google-analytics',
      'analytics-config-google-analytics:analytics-config-google-analytics-usage',
      'analytics-config-google-analytics:analytics-config-google-analytics-account-id',
      'analytics-config-google-analytics:analytics-config-google-analytics-include-on-site',

      'analytics-config-google-tag',
      'analytics-config-google-tag:analytics-config-google-tag-usage',
      'analytics-config-google-tag:analytics-config-google-tag-account-id',
      'analytics-config-google-tag:analytics-config-google-tag-send-to',

      'debug',
      'debug:debug-usage',

      'custom-config',
      'custom-script-values-header',
      'custom-script-values-checkout-fields',
      'custom-script-values-multiship-checkout-fields',
      'custom-script-values-footer',
    ],
  },
};

export default getMeta(summary);

const ext = `
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
