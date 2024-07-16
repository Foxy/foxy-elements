import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/items/0',
  parent: 'https://demo.api/hapi/items',
  nucleon: true,
  localName: 'foxy-item-form',
  translatable: true,
  configurable: {
    inputs: [
      'name',
      'price',
      'quantity',
      'subscription-frequency',
      'subscription-start-date',
      'subscription-end-date',
      'discount-name',
      'discount-builder',
      'expires',
      'url',
      'image',
      'quantity-min',
      'quantity-max',
      'shipto',
      'width',
      'height',
      'length',
      'weight',
      'item-category-uri',
      'code',
      'parent-code',
      'discount-details',
      'coupon-details',
      'attributes',
      'item-options',
    ],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    sections: ['timestamps', 'header'],
  },
};

const ext = `
  customer-addresses="https://demo.api/hapi/customer_addresses"
  item-categories="https://demo.api/hapi/item_categories"
  locale-codes="https://demo.api/hapi/property_helpers/7"
`;

export default getMeta(summary);

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
