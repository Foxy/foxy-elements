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
    sections: ['timestamps', 'header'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'shipping-method-uri',
      'shipping-container-uri',
      'shipping-drop-type-uri',
      'destinations',
      'authentication-key',
      'meter-number',
      'endpoint',
      'accountid',
      'password',
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
