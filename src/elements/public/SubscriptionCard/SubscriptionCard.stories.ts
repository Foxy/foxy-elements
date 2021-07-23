import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items',
  parent: 'https://demo.foxycart.com/s/admin/stores/0/subscriptions',
  nucleon: true,
  localName: 'foxy-subscription-card',
  translatable: true,
  configurable: { sections: ['default'] },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
