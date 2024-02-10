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
    buttons: ['delete', 'create'],
    sections: ['timestamps'],
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
