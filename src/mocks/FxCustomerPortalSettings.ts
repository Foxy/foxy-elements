import { FxCustomerPortalSettings } from '../types/hapi';

export const customerPortalSettings: FxCustomerPortalSettings = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/customer_portal_settings',
      title: 'Store Customer Portal Settings',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'This Store',
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

export const customerPortalSettingsMinimal: FxCustomerPortalSettings = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://foxy.io/s/admin/stores/8/customer_portal_settings',
      title: 'Store Customer Portal Settings',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'This Store',
    },
  },

  sso: true,
  jwtSharedSecret: 'JWT-SHARED-SECRET-VALUE',
  sessionLifespanInMinutes: 10080,
  allowedOrigins: [],

  subscriptions: {
    allowFrequencyModification: false,
    allowNextDateModification: false,
  },

  date_created: '2020-07-17T21:27:00.121Z',
  date_modified: '2020-07-17T21:27:00.121Z',
};
