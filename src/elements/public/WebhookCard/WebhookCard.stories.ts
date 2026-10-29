import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/webhooks/0',
  parent: 'https://demo.api/hapi/webhooks',
  nucleon: true,
  localName: 'foxy-webhook-card',
  translatable: true,
};

const ext = `resource-uri="https://demo.api/hapi/transactions/0"`;

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const ResourceView = getStory({ ...summary, ext });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const AccessDenied = getStory(summary);
export const Busy = getStory(summary);
export const RestrictedScope = getStory({
  ...summary,
  ext: 'current-user-scope="webhooks_read reporting_read"',
});

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
AccessDenied.args.href = 'https://demo.api/virtual/denied';
Busy.args.href = 'https://demo.api/virtual/stall';
