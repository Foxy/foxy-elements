import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/gift_card_codes/0',
  parent: 'https://demo.api/hapi/gift_card_codes',
  nucleon: true,
  localName: 'foxy-gift-card-code-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header', 'logs', 'settings'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: ['settings:code', 'settings:current-balance', 'settings:end-date', 'customer'],
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
