import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/template_configs/0',
  parent: 'https://demo.api/hapi/template_configs',
  nucleon: true,
  localName: 'foxy-template-config-form',
  translatable: true,
  configurable: {
    inputs: [
      'cart-type',
      'foxycomplete',
      'locations',
      'hidden-fields',
      'cards',
      'checkout-type',
      'consent',
      'fields',
      'google-analytics',
      'segment-io',
      'troubleshooting',
      'custom-config',
      'header',
      'custom-fields',
      'footer',
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
