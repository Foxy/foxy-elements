import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const zoom = 'shipping_method,shipping_container,shipping_drop_type';
const summary: Summary = {
  href: `https://demo.api/hapi/store_shipping_methods/0?zoom=${zoom}`,
  parent: `https://demo.api/hapi/store_shipping_methods?zoom=${zoom}`,
  nucleon: true,
  localName: 'foxy-store-shipping-method-form',
  translatable: true,
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const CustomCode = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

CustomCode.args.href = `https://demo.api/hapi/store_shipping_methods/1?zoom=shipping_method`;
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
