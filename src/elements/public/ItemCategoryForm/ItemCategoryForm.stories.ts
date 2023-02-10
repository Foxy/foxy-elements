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
    sections: ['timestamps'],
    buttons: ['create', 'delete'],
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

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
