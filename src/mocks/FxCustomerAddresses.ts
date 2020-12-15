export const customerAddresses = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/customers/115/addresses',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/customers/115/addresses?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/customers/115/addresses?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/customers/115/addresses?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/customers/115/addresses?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:customer_addresses': new Array(10).fill(0).map(() => ({
      _links: {
        curies: [
          {
            name: 'fx',
            href: 'https://api.foxycart.com/rels/{rel}',
            templated: true,
          },
        ],
        self: {
          href: 'https://api.foxycart.com/customer_addresses/201',
          title: 'awesome',
        },
        'fx:store': {
          href: 'https://api.foxycart.com/stores/8',
          title: 'This Store',
        },
        'fx:customer': {
          href: 'https://api.foxycart.com/customers/115',
          title: 'This Customer',
        },
      },
      address_name: 'awesome',
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
    })),
  },
  total_items: 1,
  returned_items: 1,
  limit: 20,
  offset: 0,
};
