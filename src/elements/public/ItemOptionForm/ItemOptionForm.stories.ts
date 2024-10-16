import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/item_options/0',
  parent: 'https://demo.api/hapi/item_options',
  nucleon: true,
  localName: 'foxy-item-option-form',
  translatable: true,
  configurable: {
    inputs: [
      'general',
      'general:name',
      'general:value',
      'mods',
      'mods:price-mod',
      'mods:weight-mod',
    ],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    sections: ['timestamps', 'header'],
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
