import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'https://demo.api/virtual/recovery',
  nucleon: true,
  localName: 'foxy-access-recovery-form',
  translatable: true,
  configurable: {
    sections: ['message'],
    buttons: ['submit'],
    inputs: ['email'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Error = getStory(summary);
export const Busy = getStory(summary);

Error.args.parent = 'https://demo.api/virtual/empty?status=404';
Busy.args.parent = 'https://demo.api/virtual/stall';
