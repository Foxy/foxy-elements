import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template',
  parent: 'https://demo.api/hapi/subscriptions',
  nucleon: true,
  localName: 'foxy-admin-subscription-form',
  translatable: true,
  configurable: {
    sections: ['general', 'overdue', 'header', 'timestamps'],
    buttons: ['header:copy-id', 'header:copy-json', 'submit', 'undo', 'create'],
    inputs: [
      'general:start-date',
      'general:end-date',
      'general:next-transaction-date',
      'general:frequency',
      'overdue:past-due-amount',
      'transactions',
      'attributes',
    ],
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
