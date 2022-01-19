import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/customers',
  nucleon: true,
  localName: 'foxy-customers-table',
  translatable: true,
};

const Meta = getMeta(summary);

Meta.argTypes.emailColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.nameColumn = { control: false, table: { category: 'Static' } };
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
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
