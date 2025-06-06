import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/webhook_logs/0',
  parent: 'https://demo.api/hapi/webhook_logs',
  nucleon: true,
  localName: 'foxy-webhook-log-card',
  translatable: true,
};

export default getMeta(summary);

const ext = `layout="resource"`;

export const Playground = getStory({ ...summary, code: true });
export const ResourceView = getStory({ ...summary, ext });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
