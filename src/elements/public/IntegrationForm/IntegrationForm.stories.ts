import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/integrations/0',
  parent: 'https://demo.api/hapi/integrations',
  nucleon: true,
  localName: 'foxy-integration-form',
  translatable: true,
  configurable: {
    sections: ['header', 'table'],
    buttons: ['create', 'delete', 'message'],
    inputs: ['project-name', 'project-description'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const AccessDenied = getStory(summary);
export const AccessDeniedOnSave = getStory(summary);
export const Busy = getStory(summary);
export const RestrictedScope = getStory({
  ...summary,
  ext: 'current-user-scope="webhooks_read reporting_read integrations_read"',
});

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
AccessDenied.args.href = 'https://demo.api/virtual/denied';
AccessDeniedOnSave.args.href = summary.href?.replace(
  'https://demo.api/',
  'https://demo.api/read-only/'
);
Busy.args.href = 'https://demo.api/virtual/stall';
