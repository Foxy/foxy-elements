import type { Summary } from '../../../storygen/Summary';

import './index';

import { getStory } from '../../../storygen/getStory';
import { getMeta } from '../../../storygen/getMeta';

const summary: Summary = {
  parent: 'https://demo.api/hapi/stores',
  href: 'https://demo.api/hapi/stores/0',
  nucleon: true,
  localName: 'foxy-store-card',
  translatable: true,
  configurable: { sections: ['title', 'subtitle'] },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
