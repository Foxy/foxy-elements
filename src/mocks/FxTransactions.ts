export const transactions = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/transactions',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:transactions': new Array(20).fill(0).map(() => ({
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
          href: 'https://api.foxy.test/stores/66',
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
                href: 'https://api.foxy.test/stores/66',
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
    })),
  },
  total_items: 2345,
  returned_items: 0,
  limit: 20,
  offset: 0,
};
