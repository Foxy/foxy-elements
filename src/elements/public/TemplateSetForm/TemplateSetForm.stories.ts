import '../PaymentsApi/index';
import './index';

import { html, TemplateResult } from 'lit-html';
import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/template_sets/0',
  parent: 'https://demo.api/hapi/template_sets',
  nucleon: true,
  localName: 'foxy-template-set-form',
  translatable: true,
  configurable: {},
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
