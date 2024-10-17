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
    sections: [
      'header',
      'past-due-amount-group',
      'reattempts-group',
      'emails-group',
      'modification-group',
      'cancellation-group',
      'timestamps',
    ],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-json'],
    inputs: [
      'past-due-amount-group:past-due-amount-handling',
      'past-due-amount-group:automatically-charge-past-due-amount',
      'past-due-amount-group:reset-nextdate-on-makeup-payment',
      'past-due-amount-group:send-email-receipts-for-automated-billing',
      'past-due-amount-group:prevent-customer-cancel-with-past-due',
      'reattempts-group:reattempt-bypass-logic',
      'reattempts-group:reattempt-bypass-strings',
      'reattempts-group:reattempt-schedule',
      'emails-group:reminder-email-schedule',
      'emails-group:expiring-soon-payment-reminder-schedule',
      'cancellation-group:cancellation-schedule',
      'modification-group:modification-url',
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
