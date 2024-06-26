import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/generate_codes/0',
  parent: 'https://demo.api/hapi/generate_codes',
  nucleon: true,
  localName: 'foxy-generate-codes-form',
  translatable: true,
  configurable: {
    buttons: ['create'],
    inputs: ['length', 'number-of-codes', 'prefix', 'example'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Complete = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Playground.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
