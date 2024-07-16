import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'https://demo.api/hapi/payment_methods',
  href: 'https://demo.api/hapi/payment_methods/0',
  nucleon: true,
  localName: 'foxy-update-payment-method-form',
  translatable: true,
  configurable: { sections: ['header'], inputs: ['template-set', 'cc-token'] },
};

const demoExt = 'embed-url="https://embed.foxy.io/v1.html?demo=default"';
const noSetExt = 'embed-url="https://embed.foxy.io/v1.html"';

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true, ext: demoExt });
export const WithSet = getStory({ ...summary, ext: demoExt });
export const WithoutSet = getStory({ ...summary, ext: noSetExt });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
