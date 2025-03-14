import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/store_attributes/0',
  parent: 'https://demo.api/hapi/store_attributes',
  nucleon: true,
  localName: 'foxy-filter-attribute-form',
  translatable: true,
  configurable: {
    sections: [],
    buttons: ['action'],
    inputs: ['filter-query', 'filter-name'],
  },
};

export default getMeta(summary);

const ext = `defaults="size=large&color=blue" pathname="/stores/0/transactions"`;

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
