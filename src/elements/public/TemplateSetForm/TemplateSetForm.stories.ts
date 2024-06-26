import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/template_sets/0',
  parent: 'https://demo.api/hapi/template_sets',
  nucleon: true,
  localName: 'foxy-template-set-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['create', 'delete'],
    inputs: [
      'description',
      'code',
      'language',
      'locale-code',
      'payment-method-set-uri',
      'i18n-editor',
    ],
  },
};

export default getMeta(summary);

const ext = `
  payment-method-sets="https://demo.api/hapi/payment_method_sets"
  language-strings="https://demo.api/hapi/property_helpers/10"
  locale-codes="https://demo.api/hapi/property_helpers/7"
  languages="https://demo.api/hapi/property_helpers/6"
`;

export const Playground = getStory({ ...summary, code: true, ext });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
