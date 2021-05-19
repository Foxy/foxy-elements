import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'foxy://auth/recover',
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

Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
