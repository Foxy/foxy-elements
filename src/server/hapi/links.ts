import { Links } from '../router/types';

export const links: Links = {
  clients: ({ id }) => ({
    'fx:attributes': { href: `./client_attributes?client_id=${id}` },
  }),

  passkeys: ({ user_id }) => ({
    'fx:user': { href: `./users/${user_id}` },
    'fx:passkeys': { href: `./users/${user_id}/passkeys` },
  }),

  downloadables: ({ id, store_id, item_category_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
    'fx:create_upload_url': { href: `./downloadables/${id}/create_upload_url` },
    'fx:downloadable_item_categories': { href: './item_categories?item_delivery_type=downloaded' },
  }),

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

  store_attributes: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  customer_attributes: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  cart_attributes: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  item_attributes: ({ item_id }) => ({
    'fx:item': { href: `./items/${item_id}` },
  }),

  shipment_attributes: ({ shipment_id }) => ({
    'fx:shipment': { href: `./shipments/${shipment_id}` },
  }),

  item_options: ({ item_id, store_id, transaction_id }) => ({
    'fx:item': { href: `./items/${item_id}` },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
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

  payment_methods: ({ store_id, customer_id, cc_token_embed_uri }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:cc_token_embed_url': { href: cc_token_embed_uri as string },
  }),

  subscriptions: ({ id, store_id, customer_id, last_transaction_id, transaction_template_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:attributes': { href: `./subscription_attributes?subscription_id=${id}` },
    'fx:transactions': { href: `./transactions?subscription_id=${id}` },
    'fx:sub_token_url': { href: 'about:blank' },
    'fx:last_transaction': { href: `./transactions/${last_transaction_id}` },
    'fx:sub_modification_url': { href: 'about:blank' },
    'fx:transaction_template': { href: `./carts/${transaction_template_id}` },
  }),

  transactions: ({ id, status, is_editable, store_id, customer_id, subscription_id }) => ({
    ...(is_editable
      ? status === 'completed'
        ? {
            'fx:refund': { href: 'https://demo.api/virtual/empty?status=200' },
          }
        : {
            'fx:void': { href: 'https://demo.api/virtual/empty?status=200' },
            'fx:capture': { href: 'https://demo.api/virtual/empty?status=200' },
          }
      : {}),

    'fx:store': { href: `./stores/${store_id}` },
    'fx:items': { href: `./items?transaction_id=${id}` },
    'fx:receipt': { href: 'about:blank' },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:payments': { href: `./payments?transaction_id=${id}` },
    'fx:discounts': { href: `./discounts?transaction_id=${id}` },
    'fx:shipments': { href: `./shipments?transaction_id=${id}` },
    'fx:attributes': { href: `./transaction_attributes?transaction_id=${id}` },
    'fx:send_emails': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:subscription': { href: `./subscriptions/${subscription_id}` },
    'fx:applied_taxes': { href: `./applied_taxes?transaction_id=${id}` },
    'fx:custom_fields': { href: `./custom_fields?transaction_id=${id}` },
    'fx:process_webhook': { href: 'https://demo.api/virtual/empty?status=200' },
    'fx:transaction_logs': { href: `./transaction_logs?transaction_id=${id}` },
    'fx:billing_addresses': { href: `./customer_addresses?id=0` },
    'fx:native_integrations': { href: `./native_integrations?transaction_id=${id}` },
    'fx:applied_gift_card_codes': { href: `./applied_gift_card_codes?transaction_id=${id}` },
  }),

  customers: document => ({
    'fx:store': { href: `./stores/${document.store_id}` },
    'fx:attributes': { href: `./customer_attributes?customer_id=${document.id}` },
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
    'fx:attributes': { href: `./store_attributes?store_id=${id}` },
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

  items: ({ store_id, subscription_id, transaction_id, item_category_id, shipment_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:shipment': { href: `./shipments/${shipment_id}` },
    'fx:attributes': { href: `./item_attributes?item_id=${id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
    'fx:item_options': { href: `./item_options?item_id=${id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
    'fx:coupon_details': { href: `./coupon_details?coupon_id=${id}` },
    'fx:discount_details': { href: `./discount_details?item_id=${id}` },

    ...(typeof subscription_id === 'number'
      ? { 'fx:subscription': { href: `./subscriptions/${subscription_id}` } }
      : {}),
  }),

  carts: ({ id, store_id, template_set_id, customer_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:items': { href: `./items?cart_id=${id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:discounts': { href: `./discounts?cart_id=${id}` },
    'fx:attributes': { href: `./cart_attributes?cart_id=${id}` },
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

  tax_item_categories: ({ tax_id, store_id, item_category_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:tax': { href: `./taxes/${tax_id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
  }),

  users: ({ id, default_store_id }) => ({
    'fx:stores': { href: `./stores?user_id=${id}` },
    'fx:attributes': { href: `./user_attributes?user_id=${id}` },
    'fx:default_store': { href: `./stores/${default_store_id}` },
  }),

  template_configs: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:template_sets': { href: `./template_sets?template_config_id=${id}` },
  }),

  coupons: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:attributes': { href: `./coupon_attributes?coupon_id=${id}` },
    'fx:coupon_codes': { href: `./coupon_codes?coupon_id=${id}` },
    'fx:generate_codes': { href: './generate_codes' },
    'fx:coupon_item_categories': { href: `./coupon_item_categories?coupon_id=${id}` },
  }),

  coupon_codes: ({ coupon_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:coupon_code_transactions': { href: `./transactions` },
  }),

  generate_codes: () => ({}),

  item_categories: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:email_templates': { href: `./email_templates?store_id=${store_id}` },
    'fx:tax_item_categories': { href: `./tax_item_categories?item_category_id=${id}` },
  }),

  coupon_attributes: ({ coupon_id, store_id }) => ({
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:store': { href: `./stores/${store_id}` },
  }),

  coupon_item_categories: ({ item_category_id, coupon_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
  }),

  gift_cards: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:attributes': { href: `./gift_card_attributes?gift_card_id=${id}` },
    'fx:generate_codes': { href: './generate_codes' },
    'fx:gift_card_codes': { href: `./gift_card_codes?gift_card_id=${id}` },
    'fx:gift_card_item_categories': { href: `./gift_card_item_categories?gift_card_id=${id}` },
  }),

  gift_card_attributes: ({ gift_card_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:gift_card': { href: `./gift_cards/${gift_card_id}` },
  }),

  gift_card_codes: ({ gift_card_id, store_id, item_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:gift_card': { href: `./gift_cards/${gift_card_id}` },
    'fx:gift_card_code_logs': { href: `./gift_card_code_logs?gift_card_id=${id}` },
    ...(typeof item_id === 'number'
      ? { 'fx:provisioned_by_transaction_detail_id': { href: `./items/${item_id}` } }
      : null),
  }),

  gift_card_code_logs: ({ transaction_id, gift_card_id, gift_card_code_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:gift_card': { href: `./gift_cards/${gift_card_id}` },
    'fx:gift_card_code': { href: `./gift_card_codes/${gift_card_code_id}` },
    ...(typeof transaction_id === 'number'
      ? { 'fx:transaction': { href: `./transactions/${transaction_id}` } }
      : null),
  }),

  applied_gift_card_codes: ({ transaction_id, gift_card_id, gift_card_code_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:gift_card': { href: `./gift_cards/${gift_card_id}` },
    'fx:gift_card_code': { href: `./gift_card_codes/${gift_card_code_id}` },
    ...(typeof transaction_id === 'number'
      ? { 'fx:transaction': { href: `./transactions/${transaction_id}` } }
      : null),
  }),

  gift_card_item_categories: ({ item_category_id, gift_card_id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:gift_card': { href: `./gift_cards/${gift_card_id}` },
    'fx:item_category': { href: `./item_categories/${item_category_id}` },
  }),

  reports: ({ user_id }) => ({
    'fx:download_url': { href: 'about:blank' },
    'fx:user': { href: `./users/${user_id}` },
  }),

  discount_details: ({ transaction_id, store_id, item_id }) => ({
    'fx:item': { href: `./item/${item_id}` },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  coupon_details: ({ transaction_id, store_id, item_id }) => ({
    'fx:item': { href: `./item/${item_id}` },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${store_id}` },
    'fx:coupon_code': { href: `./coupon_codes/${store_id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
  }),

  shipments: ({ id, store_id, customer_id, transaction_id, customer_address_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:items': { href: `./items?shipment_id=${id}` },
    'fx:custom_fields': { href: `./custom_fields?shipment_id=${id}` },
    'fx:attributes': { href: `./shipment_attributes?shipment_id=${id}` },
    'fx:transaction': { href: `./transactions/${transaction_id}` },
    'fx:shipments': { href: `./shipments?transaction_id=${transaction_id}` },
    'fx:customer': { href: `./customers/${customer_id}` },
    'fx:customer_address': { href: `./customer_addresses/${customer_address_id}` },
  }),

  webhooks: ({ id, store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:webhooks': { href: `./webhooks?store_id=${store_id}` },
    'fx:statuses': { href: `./webhook_statuses?webhook_id=${id}` },
    'fx:logs': { href: `./webhook_logs?webhook_id=${id}` },
  }),

  webhook_statuses: ({ store_id, webhook_id, resource_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:webhook': { href: `./webhooks${webhook_id}` },
    'fx:resource': { href: `./transactions/${resource_id}` },
  }),

  webhook_logs: ({ store_id, webhook_id, resource_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:webhook': { href: `./webhooks${webhook_id}` },
    'fx:resource': { href: `./transactions/${resource_id}` },
  }),

  store_shipping_methods: doc => ({
    'fx:store': {
      href: `./stores/${doc.store_id}`,
    },
    'fx:shipping_method': {
      href: `./shipping_methods/${doc.shipping_method_id}`,
    },
    'fx:shipping_methods': {
      href: `./shipping_methods`,
    },
    'fx:shipping_container': {
      href: `./shipping_containers/${doc.shipping_container_id}`,
    },
    'fx:shipping_drop_type': {
      href: `./shipping_drop_types/${doc.shipping_drop_type_id}`,
    },
    'fx:shipping_drop_types': {
      href: `./shipping_drop_types?shipping_method_id=${doc.shipping_method_id}`,
    },
    'fx:shipping_services': {
      href: `./shipping_services?shipping_method_id=${doc.shipping_method_id}`,
    },
    'fx:shipping_containers': {
      href: `./shipping_containers?shipping_method_id=${doc.shipping_method_id}`,
    },
    'fx:store_shipping_services': {
      href: `./store_shipping_services?shipping_method_id=${doc.shipping_method_id}`,
    },
  }),

  store_shipping_services: doc => ({
    'fx:store': {
      href: `./stores/${doc.store_id}`,
    },
    'fx:shipping_method': {
      href: `./shipping_methods/${doc.shipping_method_id}`,
    },
    'fx:shipping_service': {
      href: `./shipping_services/${doc.shipping_service_id}`,
    },
    'fx:shipping_methods': {
      href: `./shipping_methods`,
    },
    'fx:shipping_services': {
      href: `./shipping_services?shipping_method_id=${doc.shipping_method_id}`,
    },
  }),

  shipping_methods: ({ id }) => ({
    'fx:shipping_methods': { href: `./shipping_methods` },
    'fx:shipping_services': { href: `./shipping_services?shipping_method_id=${id}` },
    'fx:shipping_containers': { href: `./shipping_containers?shipping_method_id=${id}` },
    'fx:shipping_drop_types': { href: `./shipping_drop_types?shipping_method_id=${id}` },
    'fx:property_helpers': { href: `./property_helpers` },
  }),

  shipping_containers: ({ shipping_method_id }) => ({
    'fx:shipping_containers': { href: `./shipping_containers` },
    'fx:shipping_method': { href: `./shipping_methods/${shipping_method_id}` },
    'fx:shipping_methods': { href: `./shipping_methods` },
    'fx:property_helpers': { href: `./property_helpers` },
  }),

  shipping_drop_types: ({ shipping_method_id }) => ({
    'fx:shipping_drop_types': { href: `./shipping_drop_types` },
    'fx:shipping_method': { href: `./shipping_methods/${shipping_method_id}` },
    'fx:shipping_methods': { href: `./shipping_methods` },
    'fx:property_helpers': { href: `./property_helpers` },
  }),

  shipping_services: ({ shipping_method_id }) => ({
    'fx:shipping_method': { href: `./shipping_methods/${shipping_method_id}` },
    'fx:shipping_methods': { href: `./shipping_methods` },
    'fx:property_helpers': { href: `./property_helpers` },
  }),

  payment_gateways: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:payment_method_sets': { href: `./payment_method_sets?payment_gateway_id=${id}` },
  }),

  hosted_payment_gateways: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:payment_method_sets': { href: `./payment_method_sets?hosted_payment_gateway_id=${id}` },
  }),

  fraud_protections: ({ store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:payment_method_sets': { href: `./payment_method_sets?fraud_protection_id=${id}` },
  }),

  payment_method_sets: ({ payment_gateway_id, store_id, id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:payment_method_sets': { href: `./payment_method_sets?store_id=${store_id}` },
    'fx:payment_method_set_hosted_payment_gateways': {
      href: `./payment_method_set_hosted_payment_gateways?payment_method_set_id=${id}`,
    },
    'fx:payment_method_set_fraud_protections': {
      href: `./payment_method_set_fraud_protections?payment_method_set_id=${id}`,
    },
    ...(typeof payment_gateway_id === 'number'
      ? {
          'fx:payment_gateway': { href: `./payment_gateways/${payment_gateway_id}` },
        }
      : {}),
  }),

  payment_method_set_hosted_payment_gateways: ({
    hosted_payment_gateway_id,
    payment_method_set_id,
    store_id,
  }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:hosted_payment_gateway': { href: `./hosted_payment_gateways/${hosted_payment_gateway_id}` },
    'fx:payment_method_set': { href: `./payment_method_sets/${payment_method_set_id}` },
  }),

  payment_method_set_fraud_protections: ({
    fraud_protection_id,
    payment_method_set_id,
    store_id,
  }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:fraud_protection': { href: `./fraud_protections/${fraud_protection_id}` },
    'fx:payment_method_set': { href: `./payment_method_sets/${payment_method_set_id}` },
  }),

  property_helpers: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:property_helpers': { href: `./property_helpers?store_id=${store_id}` },
  }),

  template_sets: ({
    id,
    store_id,
    cart_template_id,
    cart_include_template_id,
    checkout_template_id,
    receipt_template_id,
    email_template_id,
    payment_method_set_id,
    template_config_id,
  }) => ({
    'fx:store': { href: `./stores/${store_id}` },
    'fx:cart_template': { href: `./cart_templates/${cart_template_id}` },
    'fx:cart_include_template': { href: `./cart_include_templates/${cart_include_template_id}` },
    'fx:checkout_template': { href: `./checkout_templates/${checkout_template_id}` },
    'fx:receipt_template': { href: `./receipt_templates/${receipt_template_id}` },
    'fx:email_template': { href: `./email_templates/${email_template_id}` },
    'fx:payment_method_set': { href: `./payment_method_sets/${payment_method_set_id}` },
    'fx:template_config': { href: `./template_configs/${template_config_id}` },
    'fx:language_overrides': { href: `./language_overrides?template_set_id=${id}` },
  }),

  store_versions: () => ({}),

  integrations: ({ client_id, store_id, user_id }) => ({
    'fx:client': { href: `./clients/${client_id}` },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:user': { href: `./users/${user_id}` },
  }),

  language_overrides: ({ template_set_id, store_id }) => ({
    'fx:language_overrides': { href: `./language_overrides?template_set_id=${template_set_id}` },
    'fx:template_set': { href: `./template_sets/${template_set_id}` },
    'fx:store': { href: `./stores/${store_id}` },
  }),

  subscription_settings: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),

  applied_coupon_codes: ({ cart_id, store_id, coupon_id, coupon_code_id }) => ({
    'fx:cart': { href: `./carts/${cart_id}` },
    'fx:store': { href: `./stores/${store_id}` },
    'fx:coupon': { href: `./coupons/${coupon_id}` },
    'fx:coupon_code': { href: `./coupon_codes/${coupon_code_id}` },
  }),

  native_integrations: ({ store_id }) => ({
    'fx:store': { href: `./stores/${store_id}` },
  }),
};
