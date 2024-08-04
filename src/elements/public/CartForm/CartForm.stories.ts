import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/carts/0?zoom=discounts',
  parent: 'https://demo.api/hapi/carts?zoom=discounts',
  nucleon: true,
  localName: 'foxy-cart-form',
  translatable: true,
  configurable: {
    sections: ['totals', 'timestamps'],
    buttons: [
      'view-as-customer',
      'delete',
      'create',
      'undo',
      'submit',
      'header:copy-id',
      'header:copy-json',
    ],
    inputs: [
      'general',
      'general:template-set-uri',
      'general:language',
      'general:customer-uri',
      'general:customer-email',
      'billing',
      'billing:payment-method-uri',
      'billing:billing-address',
      'billing:billing-address:name',
      'billing:billing-address:name:first-name',
      'billing:billing-address:name:last-name',
      'billing:billing-address:extra',
      'billing:billing-address:extra:company',
      'billing:billing-address:extra:phone',
      'billing:billing-address:address',
      'billing:billing-address:address:address1',
      'billing:billing-address:address:address2',
      'billing:billing-address:address:country',
      'billing:billing-address:address:state',
      'billing:billing-address:address:city',
      'billing:billing-address:address:postal-code',
      'shipping',
      'shipping:use-customer-shipping-address',
      'shipping:shipping-address',
      'shipping:shipping-address:name',
      'shipping:shipping-address:name:first-name',
      'shipping:shipping-address:name:last-name',
      'shipping:shipping-address:extra',
      'shipping:shipping-address:extra:company',
      'shipping:shipping-address:extra:phone',
      'shipping:shipping-address:address',
      'shipping:shipping-address:address:address1',
      'shipping:shipping-address:address:address2',
      'shipping:shipping-address:address:country',
      'shipping:shipping-address:address:state',
      'shipping:shipping-address:address:city',
      'shipping:shipping-address:address:postal-code',
      'items',
      'applied-coupon-codes',
      'custom-fields',
      'attributes',
    ],
  },
};

const ext = `
  payment-card-embed-url="https://embed.foxy.io/v1.html"
  item-categories="https://demo.api/hapi/item_categories?store_id=0"
  template-sets="https://demo.api/hapi/template_sets?store_id=0"
  locale-codes="https://demo.api/hapi/property_helpers/7"
  languages="https://demo.api/hapi/property_helpers/6"
  customers="https://demo.api/hapi/customers?store_id=0"
  countries="https://demo.api/hapi/property_helpers/3"
  regions="https://demo.api/hapi/property_helpers/4"
  coupons="https://demo.api/hapi/coupons?store_id=0"
`;

export default getMeta(summary);

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
