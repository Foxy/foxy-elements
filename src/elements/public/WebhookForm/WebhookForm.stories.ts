import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/webhooks/0',
  parent: 'https://demo.api/hapi/webhooks',
  nucleon: true,
  localName: 'foxy-webhook-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header', 'general'],
    inputs: ['general:name', 'url', 'query', 'general:encryption-key', 'general:event-resource'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
  },
};

export default getMeta(summary);

const ext = `resource-uri="https://demo.api/hapi/transactions/0"`;

export const Playground = getStory({ ...summary, code: true });
export const ResourceView = getStory({ ...summary, ext });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
