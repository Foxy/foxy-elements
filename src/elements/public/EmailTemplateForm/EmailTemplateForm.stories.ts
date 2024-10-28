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
    sections: ['timestamps', 'header', 'general', 'html-source', 'text-source'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'general:description',
      'general:template-language',
      'general:toggle',
      'general:subject',
      'content-html',
      'html-source:content-html-url',
      'html-source:cache',
      'content-text',
      'text-source:content-text-url',
      'text-source:cache',
    ],
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
