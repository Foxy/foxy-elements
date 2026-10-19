import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/gift_cards/0',
  parent: 'https://demo.api/hapi/gift_cards',
  nucleon: true,
  localName: 'foxy-gift-card-card',
  translatable: true,
  configurable: { sections: ['title', 'status'] },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const AccessDenied = getStory(summary);
export const Busy = getStory(summary);
export const RestrictedScope = getStory({
  ...summary,
  ext: 'current-user-scope="coupons_read item_categories_read gift_cards_read"',
});

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
AccessDenied.args.href = 'https://demo.api/virtual/denied';
Busy.args.href = 'https://demo.api/virtual/stall';
