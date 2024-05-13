import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/gift_cards/0',
  parent: 'https://demo.api/hapi/gift_cards',
  nucleon: true,
  localName: 'foxy-gift-card-form',
  translatable: true,
  configurable: {
    inputs: [
      'name',
      'currency',
      'expires',
      'codes',
      'product-restrictions',
      'category-restrictions',
      'attributes',
    ],
    sections: ['timestamps'],
    buttons: ['create', 'delete'],
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
