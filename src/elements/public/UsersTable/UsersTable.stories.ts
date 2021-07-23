import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.foxycart.com/s/admin/stores/0/users',
  localName: 'foxy-users-table',
  nucleon: true,
  translatable: true,
};

const Meta = getMeta(summary);

Meta.argTypes.nameColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.emailColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.rolesColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.lastUpdatedColumn = { control: false, table: { category: 'Static' } };
Meta.argTypes.actionsColumn = { control: false, table: { category: 'Static' } };
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
