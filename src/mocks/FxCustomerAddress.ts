export const customerAddress = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/customer_addresses/201',
      title: 'awesome',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'This Store',
    },
    'fx:customer': {
      href: 'https://api.foxy.test/customers/115',
      title: 'This Customer',
    },
  },
  address_name: 'Example address',
  first_name: 'Sarah',
  last_name: 'Jane',
  company: 'My company',
  address1: '12345 Any Street',
  address2: '',
  city: 'Any City',
  region: 'TN',
  postal_code: '37211',
  country: 'US',
  phone: '',
  is_default_billing: true,
  is_default_shipping: false,
  date_created: '2013-08-16T14:53:46-0700',
  date_modified: '2013-08-16T14:53:46-0700',
};
