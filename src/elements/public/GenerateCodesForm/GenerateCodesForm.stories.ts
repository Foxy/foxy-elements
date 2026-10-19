import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/generate_codes/0',
  parent: 'https://demo.api/hapi/generate_codes',
  nucleon: true,
  localName: 'foxy-generate-codes-form',
  translatable: true,
  configurable: {
    buttons: ['create'],
    inputs: ['length', 'number-of-codes', 'prefix', 'example'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Complete = getStory(summary);
export const Error = getStory(summary);
export const AccessDenied = getStory(summary);
export const AccessDeniedOnSave = getStory(summary);
export const Busy = getStory(summary);
export const RestrictedScope = getStory({
  ...summary,
  ext: 'current-user-scope="coupons_read item_categories_read"',
});

Playground.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
AccessDenied.args.href = 'https://demo.api/virtual/denied';
AccessDeniedOnSave.args.href = summary.href?.replace(
  'https://demo.api/',
  'https://demo.api/read-only/'
);
Busy.args.href = 'https://demo.api/virtual/stall';

RestrictedScope.args.href = '';
RestrictedScope.args.parent = 'https://demo.api/hapi/coupons/0/generate_codes';
