import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/subscriptions/0?zoom=last_transaction,transaction_template:items',
  parent: 'https://demo.api/hapi/subscriptions',
  nucleon: true,
  localName: 'foxy-subscription-form',
  translatable: true,
  configurable: {
    sections: ['header', 'items', 'items:actions', 'end-date:form:warning', 'transactions'],
    buttons: ['end-date', 'end-date:form:submit'],
    inputs: ['end-date:form:end-date', 'next-transaction-date', 'frequency'],
  },
};

const Meta = getMeta(summary);

Meta.argTypes.settings = { control: false };

export default Meta;

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
