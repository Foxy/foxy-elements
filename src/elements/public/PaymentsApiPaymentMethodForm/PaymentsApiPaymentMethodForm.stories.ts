import type { TemplateResult } from 'lit-html';

import '../PaymentsApi/index';
import './index';

import { html } from 'lit-html';
import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

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
  decorators: [
    (story: () => TemplateResult): TemplateResult => html`
      <foxy-payments-api
        payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
        hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
        hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
        payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
        payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
        fraud-protections-url="https://demo.api/hapi/fraud_protections"
        payment-gateways-url="https://demo.api/hapi/payment_gateways"
      >
        ${story()}
      </foxy-payments-api>
    `,
  ],
};

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
