import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/carts/0',
  parent: 'https://demo.api/hapi/carts',
  nucleon: true,
  localName: 'foxy-cart-form',
  translatable: true,
  configurable: {
    buttons: ['view-as-customer', 'delete', 'create'],
    inputs: [
      'customer-type',
      'customer',
      'template-set-uri',
      'items',
      'applied-coupon-codes',
      'custom-fields',
      'attributes',
      'billing-first-name',
      'billing-last-name',
      'billing-company',
      'billing-phone',
      'billing-address1',
      'billing-address2',
      'billing-country',
      'billing-region',
      'billing-city',
      'billing-postal-code',
      'shipping-first-name',
      'shipping-last-name',
      'shipping-company',
      'shipping-phone',
      'shipping-address1',
      'shipping-address2',
      'shipping-country',
      'shipping-region',
      'shipping-city',
      'shipping-postal-code',
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
