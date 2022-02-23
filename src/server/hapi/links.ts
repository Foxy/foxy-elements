import { Links } from '../router/types';

export const links: Links = {
  applied_taxes: ({ tax_id, store_id, transaction_id }) => ({
    'fx:tax': { href: `./taxes/${tax_id}` },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  discounts: ({ store_id, transaction_id, customer_id, coupon_id, coupon_code_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:coupon_code': { href: `./coupon_codes/${coupon_code_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  payments: ({ store_id, transaction_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  error_entries: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  custom_fields: ({ store_id, transaction_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  attributes: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  customer_addresses: ({ store_id, customer_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
  }),

  email_templates: ({ id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:cache': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:template_sets': { href: `./template_sets?email_template_id=${id}` },
  }),

  payment_methods: ({ store_id, customer_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
  }),

  subscriptions: ({ id, store_id, customer_id, last_transaction_id, transaction_template_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:attributes': { href: `./attributes?subscription_id=${id}` },
    'fx:transactions': { href: `./transactions?subscription_id=${id}` },
    'fx:sub_token_url': { href: 'about:blank' },
    'fx:last_transaction': { href: `./transactions/${last_transaction_id}` },
    'fx:sub_modification_url': { href: 'about:blank' },
    'fx:transaction_template': { href: `./carts/${transaction_template_id}` },
  }),

  transactions: ({ id, store_id, customer_id }) => ({
    'fx:void': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:items': { href: `./items?transaction_id=${id}` },
    'fx:capture': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:receipt': { href: 'about:blank' },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:payments': { href: `./payments?transaction_id=${id}` },
    'fx:discounts': { href: `./discounts?transaction_id=${id}` },
    'fx:shipments': { href: `./shipments?transaction_id=${id}` },
    'fx:attributes': { href: `./attributes?transaction_id=${id}` },
    'fx:send_emails': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:applied_taxes': { href: `./applied_taxes?transaction_id=${id}` },
    'fx:custom_fields': { href: `./custom_fields?transaction_id=${id}` },
    'fx:process_webhook': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:transaction_logs': { href: `./transaction_logs?transaction_id=${id}` },
    'fx:billing_addresses': { href: `./customer_addresses?customer_id=${customer_id}` },
    'fx:native_integrations': { href: `./native_integrations?transaction_id=${id}` },
  }),

  customers: document => ({
    'fx:store': { href: `./stores/${document.store_id}` },
    'fx:attributes': { href: `./attributes?customer_id=${document.id}` },
    'fx:transactions': { href: `./transactions?customer_id=${document.id}` },
    'fx:subscriptions': { href: `./subscriptions?customer_id=${document.id}` },
    'fx:customer_addresses': { href: `./customer_addresses?customer_id=${document.id}` },
    'fx:default_payment_method': { href: `./payment_methods/${document.payment_method_id}` },
    'fx:default_billing_address': { href: `./customer_addresses/${document.billing_address_id}` },
    'fx:default_shipping_address': { href: `./customer_addresses/${document.shipping_address_id}` },
  }),

  stores: ({ id, subscription_settings_id, customer_portal_settings_id: cps_id }) => ({
    'fx:carts': { href: `./carts?store_id=${id}` },
    'fx:users': { href: `./users?store_id=${id}` },
    'fx:taxes': { href: `./taxes?store_id=${id}` },
    'fx:coupons': { href: `./coupons?store_id=${id}` },
    'fx:customers': { href: `./customers?store_id=${id}` },
    'fx:attributes': { href: `./attributes?store_id=${id}` },
    'fx:transactions': { href: `./transactions?store_id=${id}` },
    'fx:store_version': { href: `./store_versions?store_id=${id}` },
    'fx:user_accesses': { href: `./user_accesses?store_id=${id}` },
    'fx:subscriptions': { href: `./subscriptions?store_id=${id}` },
    'fx:template_sets': { href: `./template_sets?store_id=${id}` },
    'fx:error_entries': { href: `./error_entries?store_id=${id}` },
    'fx:downloadables': { href: `./downloadables?store_id=${id}` },
    'fx:cart_templates': { href: `./cart_templates?store_id=${id}` },
    'fx:email_templates': { href: `./email_templates?store_id=${id}` },
    'fx:item_categories': { href: `./item_categories?store_id=${id}` },
    'fx:fraud_protections': { href: `./fraud_protections?store_id=${id}` },
    'fx:receipt_templates': { href: `./receipt_templates?store_id=${id}` },
    'fx:checkout_templates': { href: `./checkout_templates?store_id=${id}` },
    'fx:payment_method_sets': { href: `./payment_method_sets?store_id=${id}` },
    'fx:subscription_settings': { href: `./subscription_settings/${subscription_settings_id}` },
    'fx:cart_include_templates': { href: `./cart_include_templates?store_id=${id}` },
    'fx:hosted_payment_gateways': { href: `./hosted_payment_gateways?store_id=${id}` },
    'fx:customer_portal_settings': { href: `./customer_portal_settings/${cps_id}` },
    'fx:process_subscription_webhook': { href: 'https://demo.api/virtual/empty?status=200' },
  }),

  items: ({ store_id, transaction_id, item_category_id, shipment_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:shipment': { href: `./shipments/${shipment_id}` },
    'fx:attributes': { href: `./attributes?item_id=${id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
    'fx:item_options': { href: `./item_options?item_id=${id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
    'fx:coupon_details': { href: `./coupon_details?coupon_id=${id}` },
    'fx:discount_details': { href: `./discount_details?item_id=${id}` },
  }),

  carts: ({ id, store_id, template_set_id, customer_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:items': { href: `./items?cart_id=${id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:discounts': { href: `./discounts?cart_id=${id}` },
    'fx:attributes': { href: `./attributes?cart_id=${id}` },
    'fx:template_set': { href: `./template_sets/${template_set_id}` },
    'fx:custom_fields': { href: `./custom_fields?cart_id=${id}` },
    'fx:create_session': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:applied_coupon_codes': { href: `./applied_coupon_codes?cart_id=${id}` },
  }),

  cart_templates: ({ id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:cache': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:encode': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:template_sets': { href: `./template_sets?cart_template_id=${id}` },
  }),

  customer_portal_settings: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  taxes: ({ id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:tax_item_categories': { href: `./tax_item_categories?tax_id=${id}` },
    'fx:native_integrations': { href: `./native_integrations?tax_id=${id}` },
  }),

  users: ({ id, default_store_id }) => ({
    'fx:stores': { href: `./stores?user_id=${id}` },
    'fx:attributes': { href: `./attributes?user_id=${id}` },
    'fx:default_store': { href: `./stores/${default_store_id}` },
  }),

  template_configs: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:template_sets': { href: `./template_sets?template_config_id=${id}` },
  }),

  coupons: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon_codes': { href: `./coupon_codes?coupon_id=${id}` },
    'fx:generate_codes': { href: './generate_codes' },
    'fx:coupon_item_categories': { href: `./coupon_item_categories?coupon_id=${id}` },
  }),

  coupon_codes: ({ coupon_id, store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:coupon_code_transactions': { href: `./transactions?coupon_code_id=${id}` },
  }),

  generate_codes: () => ({}),

  item_categories: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:email_templates': { href: `./email_templates?store_id=${store_id}` },
    'fx:tax_item_categories': { href: `./tax_item_categories?item_category_id=${id}` },
  }),

  coupon_item_categories: ({ item_category_id, coupon_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
  }),

  gift_cards: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:generate_codes': { href: './generate_codes' },
    'fx:gift_card_codes': { href: `./gift_card_codes?gift_card_id=${id}` },
    'fx:gift_card_item_categories': { href: `./gift_card_item_categories?gift_card_id=${id}` },
  }),

  gift_card_codes: ({ coupon_id, store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:gift_card': { href: `./gift_cards/${coupon_id}` },
    'fx:gift_card_code_logs': { href: `./transactions?gift_card_id=${id}` },
  }),
};
