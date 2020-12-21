export const customer = {
  _links: {
    self: {
      href: 'https://api.foxy.test/customers/115',
      title: 'This Customer',
    },
    'fx:attributes': {
      href: 'https://api.foxy.test/customers/115/attributes',
      title: 'Attributes for this Customer',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'This Store',
    },
    'fx:default_billing_address': {
      href: 'https://api.foxy.test/customers/115/default_billing_address',
      title: 'Default Billing Address for this Customer',
    },
    'fx:default_shipping_address': {
      href: 'https://api.foxy.test/customers/115/default_shipping_address',
      title: 'Default Shipping Address for this Customer',
    },
    'fx:default_payment_method': {
      href: 'https://api.foxy.test/customers/115/default_payment_method',
      title: 'Default Payment Method for this Customer',
    },
    'fx:transactions': {
      href: 'https://api.foxy.test/stores/8/transactions?customer_id=115',
      title: 'Transactions for this Customer',
    },
    'fx:subscriptions': {
      href: 'https://api.foxy.test/stores/8/subscriptions?customer_id=115',
      title: 'Subscriptions for this Customer',
    },
    'fx:customer_addresses': {
      href: 'https://api.foxy.test/customers/115/addresses',
      title: 'Addresses for this Customer',
    },
  },
  _embedded: {
    'fx:attributes': [
      {
        _links: {
          self: {
            href: 'https://api.foxy.test/store_attributes/1002',
            title: 'This store attribute',
          },
          'fx:store': {
            href: 'https://api.foxy.test/stores/66',
            title: 'This Store',
          },
        },
        visibility: 'private',
        name: 'Personal Manager',
        value: 'Mike Stevens',
        date_created: '2013-08-05T14:15:59-0700',
        date_modified: '2013-08-05T14:15:59-0700',
      },
      {
        _links: {
          self: {
            href: 'https://api.foxy.test/store_attributes/1003',
            title: 'This store attribute',
          },
          'fx:store': {
            href: 'https://api.foxy.test/stores/66',
            title: 'This Store',
          },
        },
        visibility: 'public',
        name: 'Loyalty Points',
        value: '45',
        date_created: '2013-08-05T14:15:59-0700',
        date_modified: '2013-08-05T14:15:59-0700',
      },
    ],
  },
  id: 0,
  tax_id: 'XXX-XX-XXXX',
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
};
