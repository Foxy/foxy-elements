import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/cart_templates/0',
  parent: 'https://demo.api/hapi/cart_templates',
  nucleon: true,
  localName: 'foxy-template-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header', 'general', 'source', 'content-warning'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: ['general:description', 'content', 'source:content-html-url', 'source:cache'],
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
