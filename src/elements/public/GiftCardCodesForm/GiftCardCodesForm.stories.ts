import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/gift_card_codes/0',
  parent: 'https://demo.api/hapi/gift_card_codes',
  nucleon: true,
  localName: 'foxy-gift-card-codes-form',
  translatable: true,
  configurable: {
    buttons: ['create'],
    inputs: ['gift-card-codes', 'current-balance'],
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
