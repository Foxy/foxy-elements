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
    inputs: ['user:email', 'store:store-domain', 'store:store-email', 'store:store-url', 'scope'],
  },
};

const extAdmin = `default-domain="foxycart.com" layout="admin" current-user-scope="store_full_access"`;
const extUser = `default-domain="foxycart.com" layout="user"`;

const extAdminRestricted = [
  'default-domain="foxycart.com"',
  'layout="admin"',
  'current-user-scope="customers_read customers_write transactions_read transactions_resend user_invitations_read user_invitations_write"',
].join(' ');

const extAdminReadonlyScope = [
  'default-domain="foxycart.com"',
  'layout="admin"',
  'current-user-scope="customers_read customers_write transactions_read"',
].join(' ');

// Narrower than store_full_access, but still fully covers the demo invitation's scope
// (`transactions_read transactions_resend customers_write item_categories_read reporting_read`,
// where `customers_write` needs both `customers_read` and `customers_write` to be grantable).
// `user_invitations_write` is included so the form's own `readonlySelector` doesn't lock
// the scope for the separate scope-edit rule. Every other restricted-granter story
// in this file renders locked; this one exists to prove a narrow-but-sufficient granter can
// still edit.
const extAdminNarrowGranterCanEdit = [
  'default-domain="foxycart.com"',
  'layout="admin"',
  [
    'current-user-scope="transactions_read transactions_resend',
    'customers_read customers_write item_categories_read reporting_read',
    'user_invitations_write"',
  ].join(' '),
].join(' ');

export default getMeta(summary);

export const AdminLayoutPlayground = getStory({ ...summary, ext: extAdmin, code: true });
export const UserLayoutPlayground = getStory({ ...summary, ext: extUser, code: true });
export const AdminLayoutEmpty = getStory({ ...summary, ext: extAdmin });
export const UserLayoutEmpty = getStory({ ...summary, ext: extUser });
export const Error = getStory({ ...summary, ext: extAdmin });
export const Busy = getStory({ ...summary, ext: extAdmin });
export const AdminLayoutRestrictedGranter = getStory({
  ...summary,
  ext: extAdminRestricted,
  code: true,
});
export const AdminLayoutNewRestrictedGranter = getStory({ ...summary, ext: extAdminRestricted });
export const AdminLayoutReadonlyScope = getStory({
  ...summary,
  ext: extAdminReadonlyScope,
  code: true,
});
export const AdminLayoutNarrowGranterCanEdit = getStory({
  ...summary,
  ext: extAdminNarrowGranterCanEdit,
  code: true,
});

AdminLayoutEmpty.args.href = '';
UserLayoutEmpty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
AdminLayoutNewRestrictedGranter.args.href = '';
