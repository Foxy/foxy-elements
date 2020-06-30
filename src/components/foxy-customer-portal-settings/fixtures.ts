/* eslint-disable @typescript-eslint/camelcase */
import { FoxyCustomerPortalSettingsResource } from './types';
import { createMachine } from './machine';

export const initialState = createMachine(fetch).initialState.value;
export const sampleState = { idle: 'modified' };
export const sampleEvent = { type: 'save' };

export const minimalResource: FoxyCustomerPortalSettingsResource = {
  _links: {
    self: {
      href: 'https://foxy.io/s/admin/stores/8/customer_portal_settings',
    },
  },
  sso: true,
  date_created: new Date().toISOString(),
  date_modified: new Date().toISOString(),
  jwtSharedSecret: 'JWT-SHARED-SECRET-VALUE',
  sessionLifespanInMinutes: 10080,
  allowedOrigins: [],
  subscriptions: {
    allowFrequencyModification: false,
    allowNextDateModification: false,
  },
};

export const sampleResource: FoxyCustomerPortalSettingsResource = {
  _links: {
    self: {
      href: 'https://foxy.io/s/admin/stores/8/customer_portal_settings',
    },
  },
  sso: true,
  date_created: new Date().toISOString(),
  date_modified: new Date().toISOString(),
  jwtSharedSecret: 'JWT-SHARED-SECRET-VALUE',
  sessionLifespanInMinutes: 10080,
  allowedOrigins: ['http://localhost:8000', 'https://foxy.io'],
  subscriptions: {
    allowFrequencyModification: {
      jsonataQuery: '$contains(frequency, "w")',
      values: ['2w', '4w', '6w'],
    },
    allowNextDateModification: [
      {
        min: '2w',
        max: '6w',
        jsonataQuery: '$contains(frequency, "w")',
        disallowedDates: [new Date().toISOString()],
        allowedDays: {
          type: 'month',
          days: [1, 2, 3, 14, 15, 16],
        },
      },
    ],
  },
};
