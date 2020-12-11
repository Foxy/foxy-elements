import { random } from 'lodash-es';
export const customers = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/stores/8/customers/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/customers',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:customers': new Array(19).fill(0).map(() => ({
      _links: {
        curies: [
          {
            name: 'fx',
            href: 'https://api.foxy.test/stores/8/customers/rels/{rel}',
            templated: true,
          },
        ],
        self: {
          href: 'https://api.foxy.test/stores/8/customers/customers/115',
          title: 'This Customer',
        },
        'fx:attributes': {
          href: 'https://api.foxy.test/stores/8/customers/customers/115/attributes',
          title: 'Attributes for this Customer',
        },
        'fx:store': {
          href: 'https://api.foxy.test/stores/8/customers/stores/66',
          title: 'This Store',
        },
        'fx:default_billing_address': {
          href: 'https://api.foxy.test/stores/8/customers/customers/115/default_billing_address',
          title: 'Default Billing Address for this Customer',
        },
        'fx:default_shipping_address': {
          href: 'https://api.foxy.test/stores/8/customers/customers/115/default_shipping_address',
          title: 'Default Shipping Address for this Customer',
        },
        'fx:default_payment_method': {
          href: 'https://api.foxy.test/stores/8/customers/customers/115/default_payment_method',
          title: 'Default Payment Method for this Customer',
        },
        'fx:transactions': {
          href: 'https://api.foxy.test/stores/8/customers/stores/66/transactions?customer_id=115',
          title: 'Transactions for this Customer',
        },
        'fx:subscriptions': {
          href: 'https://api.foxy.test/stores/8/customers/stores/66/subscriptions?customer_id=115',
          title: 'Subscriptions for this Customer',
        },
        'fx:customer_addresses': {
          href: 'https://api.foxy.test/stores/8/customers/customers/115/addresses',
          title: 'Addresses for this Customer',
        },
      },
      id: random(1000000000, 9999999999),
      last_login_date: null,
      first_name: 'Test',
      last_name: 'User',
      email: 'luke.stokes+apitest998@example.com',
      password_salt: null,
      password_hash: '4443fe50df6b177ba84b78dd91f0958a',
      password_hash_type: 'md5',
      password_hash_config: null,
      forgot_password: 'blah',
      forgot_password_timestamp: '2013-08-16T14:13:54-0700',
      is_anonymous: false,
      date_created: null,
      date_modified: '2013-08-16T14:13:54-0700',
    })),
  },
  total_items: 19,
  returned_items: 19,
  limit: 20,
  offset: 0,
};
