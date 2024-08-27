import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/store_shipping_methods/0?zoom=shipping_method',
  parent: 'https://demo.api/hapi/store_shipping_methods?zoom=shipping_method',
  nucleon: true,
  localName: 'foxy-store-shipping-method-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header', 'general', 'destinations', 'account'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'general:shipping-method-uri',
      'general:shipping-container-uri',
      'general:shipping-drop-type-uri',
      'destinations:use-for-domestic',
      'destinations:use-for-international',
      'account:use-custom-account',
      'account:authentication-key',
      'account:meter-number',
      'account:accountid',
      'account:password',
      'endpoint',
      'custom-code',
      'services',
    ],
  },
};

const ext = `shipping-methods="https://demo.api/hapi/shipping_methods"`;

export default getMeta(summary);

export const Playground = getStory({ ...summary, ext, code: true });
export const CustomCode = getStory({ ...summary, ext });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

CustomCode.args.href = `https://demo.api/hapi/store_shipping_methods/1?zoom=shipping_method`;
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
