import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'https://demo.api/hapi/payment_methods',
  href: 'https://demo.api/hapi/payment_methods/0',
  nucleon: true,
  localName: 'foxy-payment-method-card',
  translatable: true,
  configurable: {
    sections: ['actions'],
    buttons: ['actions:delete', 'actions:update'],
  },
};

const demoExt = 'embed-url="https://embed.foxy.io/v1.html?demo=default"';

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const WithCardEditable = getStory({ ...summary, ext: demoExt });
export const WithCardReadonly = getStory(summary);
export const NoCardEditable = getStory({ ...summary, ext: demoExt });
export const NoCardReadonly = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

NoCardReadonly.args.href = 'https://demo.api/hapi/payment_methods/1';
NoCardEditable.args.href = 'https://demo.api/hapi/payment_methods/1';
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
