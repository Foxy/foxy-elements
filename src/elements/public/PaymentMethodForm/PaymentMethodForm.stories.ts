import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'https://demo.api/hapi/payment_methods',
  href: 'https://demo.api/hapi/payment_methods/0',
  nucleon: true,
  localName: 'foxy-payment-method-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['create', 'delete'],
    inputs: ['cc-number', 'cc-exp', 'cc-csc', 'cc-token'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Stripe = getStory(summary);
export const Square = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Stripe.args.href = 'https://demo.api/hapi/payment_methods/1';
Square.args.href = 'https://demo.api/hapi/payment_methods/2';
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
