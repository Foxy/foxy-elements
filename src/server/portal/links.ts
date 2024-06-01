import { Links } from '../router/types';

export const links: Links = {
  attributes: () => ({
    'fx:customer': { href: './' },
  }),

  customer_addresses: () => ({
    'fx:customer': { href: './' },
  }),

  payment_methods: () => ({
    'fx:customer': { href: './' },
  }),

  subscriptions: ({ id, last_transaction_id, transaction_template_id }) => ({
    'fx:customer': { href: './' },
    'fx:attributes': { href: `./attributes?subscription_id=${id}` },
    'fx:transactions': { href: `./transactions?subscription_id=${id}` },
    'fx:sub_token_url': { href: 'about:blank' },
    'fx:last_transaction': { href: `./transactions/${last_transaction_id}` },
    'fx:sub_modification_url': { href: 'about:blank' },
    'fx:transaction_template': { href: `./carts/${transaction_template_id}` },
  }),

  transactions: ({ id }) => ({
    'fx:items': { href: `./items?transaction_id=${id}` },
    'fx:receipt': { href: 'about:blank' },
    'fx:customer': { href: './' },
    'fx:attributes': { href: `./attributes?transaction_id=${id}` },
  }),

  customers: document => ({
    'fx:checkout': { href: 'about:blank' },
    'fx:attributes': { href: `./attributes?customer_id=${document.id}` },
    'fx:transactions': { href: `./transactions?customer_id=${document.id}` },
    'fx:subscriptions': { href: `./subscriptions?customer_id=${document.id}` },
    'fx:customer_addresses': { href: `./customer_addresses?customer_id=${document.id}` },
    'fx:default_payment_method': { href: `./payment_methods/${document.payment_method_id}` },
    'fx:default_billing_address': { href: `./customer_addresses/${document.billing_address_id}` },
    'fx:default_shipping_address': { href: `./customer_addresses/${document.shipping_address_id}` },
  }),

  items: ({ transaction_id }) => ({
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  carts: ({ id }) => ({
    'fx:items': { href: `./items?cart_id=${id}` },
    'fx:customer': { href: './' },
  }),
};
