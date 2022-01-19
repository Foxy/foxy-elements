import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/email_templates/0',
  parent: 'https://demo.api/hapi/email_templates',
  nucleon: true,
  localName: 'foxy-email-template-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['delete', 'create'],
    inputs: ['description', 'content'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
