import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/user_invitations/0',
  parent: 'https://demo.api/hapi/user_invitations',
  nucleon: true,
  localName: 'foxy-user-invitation-card',
  translatable: true,
  configurable: { sections: ['title', 'subtitle'] },
};

const extUser = `default-domain="foxycart.com" layout="user"`;
const extAdmin = `default-domain="foxycart.com" layout="admin"`;

export default getMeta(summary);

export const AdminLayoutPlayground = getStory({ ...summary, ext: extAdmin, code: true });
export const UserLayoutPlayground = getStory({ ...summary, ext: extUser, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
