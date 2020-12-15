export const defaultPaymentMethod = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxycart.com/customers/8/default_payment_method',
      title: 'Default Payment Method',
    },
    'fx:store': {
      href: 'https://api.foxycart.com/stores/8',
      title: 'This Store',
    },
    'fx:customer': {
      href: 'https://api.foxycart.com/customers/8',
      title: 'This Customer',
    },
  },
  save_cc: 1,
  cc_type: 'MasterCard',
  cc_number_masked: 'xxxxxxxxxxxx1111',
  cc_exp_month: '12',
  cc_exp_year: '2020',
  date_created: '2009-02-10T21:41:51-0800',
  date_modified: '2013-08-17T17:40:22-0700',
};
