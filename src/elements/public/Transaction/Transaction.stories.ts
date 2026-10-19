import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/transactions/0?zoom=folder,applied_taxes,discounts,shipments,gift_card_code_logs:gift_card,gift_card_code_logs:gift_card_code',
  parent: 'https://demo.api/hapi/transactions',
  nucleon: true,
  localName: 'foxy-transaction',
  translatable: true,
  configurable: {},
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Readonly = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const AccessDenied = getStory(summary);
export const Busy = getStory(summary);
export const RestrictedScope = getStory({
  ...summary,
  ext: 'current-user-scope="transactions_read customers_read"',
});

Readonly.args.href =
  'https://demo.api/hapi/transactions/1?zoom=folder,applied_taxes,discounts,shipments,gift_card_code_logs:gift_card,gift_card_code_logs:gift_card_code';

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
AccessDenied.args.href = 'https://demo.api/virtual/denied';
Busy.args.href = 'https://demo.api/virtual/stall';
