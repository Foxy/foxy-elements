import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/subscription_settings/0',
  parent: 'https://demo.api/hapi/subscription_settings',
  nucleon: true,
  localName: 'foxy-subscription-settings-form',
  translatable: true,
  configurable: {
    sections: ['timestamps'],
    buttons: ['create', 'delete'],
    inputs: [
      'past-due-amount-handling',
      'automatically-charge-past-due-amount',
      'clear-past-due-amounts-on-success',
      'reset-nextdate-on-makeup-payment',
      'reattempt-bypass',
      'reattempt-schedule',
      'reminder-email-schedule',
      'expiring-soon-payment-reminder-schedule',
      'send-email-receipts-for-automated-billing',
      'cancellation-schedule',
      'modification-url',
    ],
  },
};

const Meta = getMeta(summary);

Meta.argTypes.settings = { control: false };

export default Meta;

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
