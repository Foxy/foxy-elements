import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.foxycart.com/s/admin/customers/0',
  parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
  nucleon: true,
  localName: 'foxy-customer-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['delete', 'create'],
    inputs: ['first-name', 'last-name', 'email', 'tax-id'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
