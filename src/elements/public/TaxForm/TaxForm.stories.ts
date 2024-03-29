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
    sections: ['timestamps'],
    buttons: [
      'exempt-all-customer-tax-ids',
      'use-origin-rates',
      'apply-to-shipping',
      'create',
      'delete',
    ],
    inputs: ['name', 'type', 'country', 'region', 'city', 'provider', 'rate'],
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
