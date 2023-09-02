import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/passkeys/0',
  parent: 'https://demo.api/hapi/passkeys',
  nucleon: true,
  localName: 'foxy-passkey-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['create', 'delete'],
    inputs: [],
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
