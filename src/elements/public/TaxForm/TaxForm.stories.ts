import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/taxes/0',
  parent: 'https://demo.api/hapi/taxes',
  nucleon: true,
  localName: 'foxy-tax-form',
  translatable: true,
  configurable: {
    sections: ['timestamps', 'header', 'general', 'group-one', 'group-two', 'group-three'],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'group-one:name',
      'group-one:type',
      'group-one:service-provider',
      'group-one:rate',
      'group-two:apply-to-shipping',
      'group-two:exempt-all-customer-tax-ids',
      'group-two:use-origin-rates',
      'group-three:country',
      'group-three:region-select',
      'group-three:region-input',
      'group-three:city',
      'native-integrations',
      'item-categories',
    ],
  },
};

export default getMeta(summary);

const ext = `
  native-integrations="https://demo.api/hapi/native_integrations"
  item-categories="https://demo.api/hapi/item_categories"
  countries="https://demo.api/hapi/property_helpers/3"
  regions="https://demo.api/hapi/property_helpers/4"
`;

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
