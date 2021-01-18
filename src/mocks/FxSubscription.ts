export const subscription = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/subscriptions/413',
      title: 'This Subscription',
    },
    'fx:attributes': {
      href: 'https://api.foxy.test/subscriptions/413/attributes',
      title: 'Attributes for This Subscription',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'This Store',
    },
    'fx:customer': {
      href: 'https://api.foxy.test/customers/115',
      title: 'This Customer',
    },
    'fx:last_transaction': {
      href: 'https://api.foxy.test/transactions/2026722',
      title: 'Last Transaction',
    },
    'fx:transactions': {
      href: 'https://api.foxy.test/stores/8/transactions?subscription_id=413',
      title: 'Transactions for this Subscription',
    },
    'fx:transaction_template': {
      href: 'https://api.foxy.test/carts/2028277',
      title: 'Transaction Template',
    },
    'fx:sub_token_url': {
      href: 'https://example.foxycart.com/cart?sub_token=a2be406ad4672e0b6a1c4ca7ff46af4a',
      title: 'This Sub Token',
    },
  },
  _embedded: {
    'fx:transaction_template': {
      _links: {
        curies: [
          {
            name: 'fx',
            href: 'https://api.foxy.test/rels/{rel}',
            templated: true,
          },
        ],
        self: {
          href: 'https://api.foxy.test/carts/32',
          title: 'This Cart',
        },
        'fx:attributes': {
          href: 'https://api.foxy.test/carts/32/attributes',
          title: 'Attributes for This Cart',
        },
        'fx:store': {
          href: 'https://api.foxy.test/stores/8',
          title: 'This Store',
        },
        'fx:template_set': {
          href: 'https://api.foxy.test/template_sets/1446',
          title: 'This Template Set',
        },
        'fx:customer': {
          href: 'https://api.foxy.test/customers/8',
          title: 'This Customer',
        },
        'fx:items': {
          href: 'https://api.foxy.test/carts/32/items',
          title: 'The Items for This Cart',
        },
        'fx:discounts': {
          href: 'https://api.foxy.test/carts/32/discounts',
          title: 'Discounts for this Cart',
        },
        'fx:applied_coupon_codes': {
          href: 'https://api.foxy.test/carts/32/applied_coupon_codes',
          title: 'Coupon Codes applied to this Cart',
        },
        'fx:custom_fields': {
          href: 'https://api.foxy.test/carts/32/cart_custom_fields',
          title: 'The Custom Fields for this Cart',
        },
        'fx:create_session': {
          href: 'https://api.foxy.test/carts/32/session',
          title: 'POST here to create a browser session link',
        },
      },
      _embedded: {
        'fx:items': [
          {
            _links: {
              curies: [
                {
                  name: 'fx',
                  href: 'https://api.foxy.test/rels/{rel}',
                  templated: true,
                },
              ],
              self: {
                href: 'https://api.foxy.test/items/5616394',
                title: 'This Item',
              },
              'fx:store': {
                href: 'https://api.foxy.test/stores/8',
                title: 'This Store',
              },
              'fx:transaction': {
                href: 'https://api.foxy.test/transactions/3844264',
                title: 'This Transaction',
              },
              'fx:item_category': {
                href: 'https://api.foxy.test/item_categories/60',
                title: 'This Item Category',
              },
              'fx:item_options': {
                href: 'https://api.foxy.test/items/5616394/item_options',
                title: 'Item Options for This Item',
              },
              'fx:shipment': {
                href: 'https://api.foxy.test/shipments/3978',
                title: 'Shipment for this Item',
              },
              'fx:attributes': {
                href: 'https://api.foxy.test/items/5616394/attributes',
                title: 'Attributes for This Item',
              },
              'fx:discount_details': {
                href: 'https://api.foxy.test/items/5616394/discount_details',
                title: 'The Discounts for this Item',
              },
              'fx:coupon_details': {
                href: 'https://api.foxy.test/items/5616394/coupon_details',
                title: 'The Coupons for this Item',
              },
            },
            item_category_uri: 'https://api.foxy.test/item_categories/60',
            name: 'Sample product name',
            price: 10,
            quantity: 1,
            quantity_min: 0,
            quantity_max: 0,
            weight: 5,
            code: '',
            parent_code: '',
            discount_name: '',
            discount_type: '',
            discount_details: '',
            subscription_frequency: '',
            subscription_start_date: null,
            subscription_next_transaction_date: null,
            subscription_end_date: null,
            is_future_line_item: false,
            shipto: 'Me',
            url: '',
            image: '',
            length: 0,
            width: 0,
            height: 0,
            expires: 0,
            date_created: null,
            date_modified: '2015-04-15T08:45:49-0700',
          },
        ],
      },
      customer_uri: 'https://api.foxy.test/customers/8',
      template_set_uri: 'https://api.foxy.test/template_sets/1446',
      language: 'english',
      use_customer_shipping_address: true,
      billing_first_name: 'Grace',
      billing_last_name: 'Hopper',
      billing_company: '',
      billing_address1: '1234 Mulberry Dr.',
      billing_address2: '#567',
      billing_city: 'MANHATTAN',
      billing_state: 'NY',
      billing_postal_code: '10001',
      billing_country: 'US',
      billing_phone: '',
      shipping_first_name: 'test1',
      shipping_last_name: 'test2',
      shipping_company: 'test3',
      shipping_address1: 'test4',
      shipping_address2: 'test5',
      shipping_city: 'Austin',
      shipping_state: 'TX',
      shipping_postal_code: '78767',
      shipping_country: 'US',
      shipping_phone: '',
      total_item_price: 0,
      total_tax: 0,
      total_shipping: 0,
      total_future_shipping: 0,
      total_order: 0,
      date_created: '2012-02-29T13:55:09-0800',
      date_modified: null,
    },
    'fx:last_transaction': {
      _links: {
        curies: [
          {
            name: 'fx',
            href: 'https://api.foxy.test/rels/{rel}',
            templated: true,
          },
        ],
        self: {
          href: 'https://api.foxy.test/transactions/3820290',
          title: 'This Transaction',
        },
        'fx:attributes': {
          href: 'https://api.foxy.test/transactions/3820290/attributes',
          title: 'Attributes for this Transaction',
        },
        'fx:store': {
          href: 'https://api.foxy.test/stores/8',
          title: 'This Store',
        },
        'fx:receipt': {
          href: 'https://example.foxycart.com/receipt?id=6fb65c90acd74fecbe1a18834d2a1a2c',
          title: 'This Receipt',
          type: 'text/html',
        },
        'fx:customer': {
          href: 'https://api.foxy.test/customers/115',
          title: 'This Customer',
        },
        'fx:items': {
          href: 'https://api.foxy.test/transactions/3820290/items',
          title: 'The Items for this Transaction',
        },
        'fx:payments': {
          href: 'https://api.foxy.test/transactions/3820290/payments',
          title: 'The Payments for this Transaction',
        },
        'fx:applied_taxes': {
          href: 'https://api.foxy.test/transactions/3820290/applied_taxes',
          title: 'The Applied Taxes for this Transaction',
        },
        'fx:custom_fields': {
          href: 'https://api.foxy.test/transactions/3820290/transaction_custom_fields',
          title: 'The Custom Fields for this Transaction',
        },
        'fx:discounts': {
          href: 'https://api.foxy.test/transactions/3820290/discounts',
          title: 'The Discounts for this Transaction',
        },
        'fx:shipments': {
          href: 'https://api.foxy.test/transactions/3820290/shipments',
          title: 'The Shipments for this Transaction',
        },
        'fx:billing_addresses': {
          href: 'https://api.foxy.test/transactions/3820290/billing_addresses',
          title: 'The Billing Addresses for this Transaction',
        },
        'fx:native_integrations': {
          href: 'https://api.foxy.test/transactions/3820290/native_integrations',
          title: 'POST here to resend transaction to the Webhooks.',
        },
        'fx:process_webhook': {
          href: 'https://api.foxy.test/transactions/3820290/process_webhook',
          title: 'POST here to resend the webhook notification for this transaction',
        },
        'fx:send_emails': {
          href: 'https://api.foxy.test/transactions/3820290/send_emails',
          title: 'POST here to resend emails for this transaction',
        },
        'fx:void': {
          href: 'https://api.foxy.test/transactions/3820290/void',
          title: 'POST here to void this transaction.',
        },
        'fx:refund': {
          href: 'https://api.foxy.test/transactions/3820290/refund',
          title: 'POST here to refund this transaction.',
        },
        'fx:capture': {
          href: 'https://api.foxy.test/transactions/3820290/capture',
          title: 'POST here to capture this transaction.',
        },
        'fx:transaction_logs': {
          href: 'https://api.foxy.test/transactions/3820290/transaction_logs',
          title: 'Transaction Logs',
        },
      },
      id: 3820290,
      is_test: true,
      hide_transaction: false,
      data_is_fed: true,
      transaction_date: '2013-06-06T17:26:07-05:00',
      locale_code: 'en_US',
      customer_first_name: 'Test',
      customer_last_name: 'User',
      customer_tax_id: '',
      customer_email: 'testing@example.com',
      customer_ip: '10.1.248.210',
      ip_country: '',
      total_item_price: 10,
      total_tax: 1.9,
      total_shipping: 0,
      total_future_shipping: 0,
      total_order: 11.9,
      date_created: null,
      date_modified: '2013-06-06T15:26:07-0700',
      currency_code: 'USD',
      currency_symbol: '$',
      status: 'completed',
    },
  },
  next_transaction_date: '2014-05-01T00:00:00-0700',
  start_date: '2010-09-15T00:00:00-0700',
  end_date: null,
  frequency: '1m',
  error_message: '',
  past_due_amount: 0,
  first_failed_transaction_date: null,
  is_active: true,
  third_party_id: '',
  date_created: null,
  date_modified: '2013-08-19T10:58:39-0700',
};
