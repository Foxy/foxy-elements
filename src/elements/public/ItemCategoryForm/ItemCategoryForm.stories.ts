import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/item_categories/0',
  parent: 'https://demo.api/hapi/item_categories',
  nucleon: true,
  localName: 'foxy-item-category-form',
  translatable: true,
  configurable: {
    sections: ['header', 'general', 'delivery', 'handling-and-discount', 'emails', 'timestamps'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'general:name',
      'general:code',
      'taxes',
      'handling-and-discount:handling-fee-type',
      'handling-and-discount:handling-fee',
      'handling-and-discount:handling-fee-percentage',
      'handling-and-discount:handling-fee-minimum',
      'handling-and-discount:discount-name',
      'handling-and-discount:discount-builder',
      'delivery:item-delivery-type',
      'delivery:max-downloads-per-customer',
      'delivery:max-downloads-time-period',
      'delivery:shipping-flat-rate',
      'delivery:shipping-flat-rate-type',
      'delivery:default-weight',
      'delivery:default-weight-unit',
      'delivery:default-length-unit',
      'delivery:customs-value',
      'emails:gift-recipient-email-template-uri',
    ],
  },
};

const ext = `
  email-templates="https://demo.api/hapi/email_templates"
  taxes="https://demo.api/hapi/taxes"
`;

export default getMeta(summary);

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
