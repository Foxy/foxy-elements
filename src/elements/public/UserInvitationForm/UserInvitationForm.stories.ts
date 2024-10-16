import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/user_invitations/0',
  parent: 'https://demo.api/hapi/user_invitations',
  nucleon: true,
  localName: 'foxy-user-invitation-form',
  translatable: true,
  configurable: {
    sections: ['header'],
    buttons: ['delete', 'create', 'accept', 'reject', 'resend', 'revoke', 'leave', 'invite-again'],
    inputs: ['user:email', 'store:store-domain', 'store:store-email', 'store:store-url'],
  },
};

const extAdmin = `default-domain="foxycart.com" layout="admin"`;
const extUser = `default-domain="foxycart.com" layout="user"`;

export default getMeta(summary);

export const AdminLayoutPlayground = getStory({ ...summary, ext: extAdmin, code: true });
export const UserLayoutPlayground = getStory({ ...summary, ext: extUser, code: true });
export const AdminLayoutEmpty = getStory({ ...summary, ext: extAdmin });
export const UserLayoutEmpty = getStory({ ...summary, ext: extUser });
export const Error = getStory({ ...summary, ext: extAdmin });
export const Busy = getStory({ ...summary, ext: extAdmin });

AdminLayoutEmpty.args.href = '';
UserLayoutEmpty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
