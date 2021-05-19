import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.foxycart.com/s/admin/stores/0/transactions?customer_id=0&limit=10&zoom=items',
  nucleon: true,
  localName: 'foxy-transactions-table',
  translatable: true,
};

const Meta = getMeta(summary);

Meta.argTypes.receiptColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.summaryColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.statusColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.priceColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.dateColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.idColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.columns = { control: false };
Meta.argTypes.parent = { control: false };

export default Meta;

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
