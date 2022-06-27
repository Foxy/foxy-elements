import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/shipments/0',
  parent: 'https://demo.api/hapi/shipments',
  nucleon: true,
  localName: 'foxy-shipment-card',
  translatable: true,
  configurable: {},
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Readonly = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Readonly.args.href = 'https://demo.api/hapi/shipments/1';
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
