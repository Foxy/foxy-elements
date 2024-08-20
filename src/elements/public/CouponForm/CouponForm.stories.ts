import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/coupons/0',
  parent: 'https://demo.api/hapi/coupons',
  nucleon: true,
  localName: 'foxy-coupon-form',
  translatable: true,
  configurable: {
    inputs: [
      'general:name',
      'rules',
      'coupon-codes',
      'item-option-restrictions',
      'product-code-restrictions',
      'category-restrictions',
      'uses:number-of-uses-allowed',
      'uses:number-of-uses-allowed-per-customer',
      'uses:number-of-uses-allowed-per-code',
      'timeframe:start-date',
      'timeframe:end-date',
      'taxes:inclusive-tax-rate',
      'options:multiple-codes-allowed',
      'options:combinable',
      'options:exclude-category-discounts',
      'options:exclude-line-item-discounts',
      'options:is-taxable',
      'options:shared-codes-allowed',
      'options:customer-auto-apply',
      'customer-subscription-restrictions',
      'customer-attribute-restrictions',
      'attributes',
    ],
    sections: ['timestamps', 'header', 'general', 'uses', 'timeframe', 'options', 'taxes'],
    buttons: [
      'import',
      'generate',
      'delete',
      'create',
      'submit',
      'undo',
      'header:copy-id',
      'header:copy-json',
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
