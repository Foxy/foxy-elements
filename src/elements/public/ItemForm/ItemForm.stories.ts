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
      'general:name',
      'general:price',
      'general:quantity',
      'general:item-category-uri',
      'general:code',
      'general:parent-code',
      'general:shipto',
      'subscriptions:subscription-frequency',
      'subscriptions:subscription-start-date',
      'subscriptions:subscription-end-date',
      'item-options',
      'dimensions:weight',
      'dimensions:length',
      'dimensions:width',
      'dimensions:height',
      'meta:url',
      'meta:image',
      'meta:quantity-max',
      'meta:quantity-min',
      'meta:expires',
      'discount:discount-name',
      'discount:discount-builder',
      'discount-details',
      'coupon-details',
      'attributes',
    ],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    sections: [
      'timestamps',
      'header',
      'general',
      'subscriptions',
      'dimensions',
      'meta',
      'discount',
    ],
  },
};

const ext = `
  customer-addresses="https://demo.api/hapi/customer_addresses"
  item-categories="https://demo.api/hapi/item_categories"
  locale-codes="https://demo.api/hapi/property_helpers/7"
  store="https://demo.api/hapi/stores/0"
`;

export default getMeta(summary);

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
