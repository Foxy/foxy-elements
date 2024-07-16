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
    sections: ['timestamps', 'header'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'name',
      'code',
      'handling-fee-type',
      'handling-fee',
      'handling-fee-percentage',
      'handling-fee-minimum',
      'item-delivery-type',
      'max-downloads-per-customer',
      'max-downloads-time-period',
      'shipping-flat-rate',
      'shipping-flat-rate-type',
      'default-weight',
      'default-weight-unit',
      'default-length-unit',
      'customs-value',
      'discount-name',
      'discount-builder',
      'admin-email-template-uri',
      'customer-email-template-uri',
      'gift-recipient-email-template-uri',
      'taxes',
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
