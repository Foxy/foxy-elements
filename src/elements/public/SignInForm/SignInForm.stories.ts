import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'foxy://auth/session',
  nucleon: true,
  localName: 'foxy-sign-in-form',
  translatable: true,
  configurable: {
    sections: ['error'],
    buttons: ['submit'],
    inputs: ['email', 'password'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
