import { Defaults } from '../router/types';
import { increment } from '../router/utils';

export const defaults: Defaults = {
  applied_taxes: query => ({
    id: increment('applied_taxes', 1),
    tax_id: parseInt(query.get('tax_id') ?? '0'),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    rate: 0,
    name: '',
    amount: 0,
    apply_to_handling: false,
    apply_to_shipping: false,
    is_future_tax: false,
    shipto: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  discounts: query => ({
    id: increment('discounts', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    coupon_id: parseInt(query.get('coupon_id') ?? '0'),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    coupon_code_id: parseInt(query.get('coupon_code_id') ?? '0'),
    code: '',
    amount: 0,
    name: '',
    display: '0.00',
    is_taxable: false,
    is_future_discount: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  payments: query => ({
    id: increment('payments', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    type: '',
    gateway_type: '',
    processor_response: '',
    processor_response_details: '',
    purchase_order: '',
    cc_number_masked: '',
    cc_type: '',
    cc_exp_month: '',
    cc_exp_year: '',
    fraud_protection_score: 0,
    paypal_payer_id: '',
    third_party_id: '',
    amount: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  error_entries: query => ({
    id: increment('error_entries', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    url: '',
    error_message: '',
    user_agent: '',
    referrer: '',
    ip_address: '',
    ip_country: '',
    post_values: '',
    get_values: '',
    hide_error: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  custom_fields: query => ({
    id: increment('custom_fields', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    name: '',
    value: '',
    is_hidden: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  customer_attributes: query => ({
    id: increment('customer_attributes', 1),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    name: '',
    value: '',
    visibility: 'private',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  item_attributes: query => ({
    id: increment('item_attributes', 1),
    item_id: parseInt(query.get('item_id') ?? '0'),
    name: '',
    value: '',
    visibility: 'private',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  shipment_attributes: query => ({
    id: increment('shipment_attributes', 1),
    shipment_id: parseInt(query.get('shipment_id') ?? '0'),
    name: '',
    value: '',
    visibility: 'private',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  item_options: query => ({
    id: increment('item_options', 3),
    item_id: parseInt(query.get('item_id') ?? '0'),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    name: 'color',
    value: 'blue',
    price_mod: 11.98,
    weight_mod: 5,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  customer_addresses: query => ({
    id: increment('customer_addresses', 4),
    store_id: parseInt(query.get('store_id') ?? '0'),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    address_name: '',
    first_name: '',
    last_name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    region: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default_billing: false,
    is_default_shipping: false,
    ignore_address_restrictions: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  email_templates: query => ({
    id: increment('email_templates', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    description: '',
    subject: '',
    content_html: '',
    content_html_url: '',
    content_text: '',
    content_text_url: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  payment_methods: query => ({
    id: increment('payment_methods', 1),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    save_cc: true,
    cc_type: '',
    cc_number_masked: '',
    cc_exp_month: '',
    cc_exp_year: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  subscriptions: query => ({
    id: increment('subscriptions', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    transaction_template_id: parseInt(query.get('transaction_template_id') ?? '0'),
    next_transaction_date: '',
    start_date: '',
    end_date: null,
    frequency: '',
    error_message: '',
    past_due_amount: 0,
    first_failed_transaction_date: null,
    is_active: false,
    third_party_id: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  transactions: query => ({
    id: increment('transactions', 2),
    store_id: parseInt(query.get('store_id') ?? '0'),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    subscription_id: parseInt(query.get('subscription_id') ?? '0'),
    is_test: false,
    hide_transaction: false,
    data_is_fed: false,
    transaction_date: new Date().toISOString(),
    locale_code: '',
    customer_first_name: '',
    customer_last_name: '',
    customer_tax_id: '',
    customer_email: '',
    customer_ip: '',
    ip_country: '',
    total_item_price: 0,
    total_tax: 0,
    total_shipping: 0,
    total_future_shipping: 0,
    total_order: 0,
    status: '',
    currency_code: '',
    currency_symbol: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  customers: query => ({
    id: increment('customers', 5),
    store_id: parseInt(query.get('store_id') ?? '0'),
    tax_id: '',
    last_login_date: new Date().toISOString(),
    first_name: '',
    last_name: '',
    email: '',
    password_salt: null,
    password_hash: '',
    password_hash_type: '',
    password_hash_config: null,
    forgot_password: '',
    forgot_password_timestamp: null,
    is_anonymous: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  stores: () => ({
    id: increment('stores', 1),
    store_version_uri: '',
    store_name: '',
    store_domain: '',
    use_remote_domain: false,
    store_url: '',
    receipt_continue_url: '',
    store_email: '',
    from_email: '',
    use_email_dns: false,
    bcc_on_receipt_email: false,
    smtp_config: '',
    postal_code: '',
    region: '',
    country: '',
    locale_code: '',
    timezone: '',
    hide_currency_symbol: false,
    hide_decimal_characters: false,
    use_international_currency_symbol: false,
    language: '',
    logo_url: '',
    checkout_type: '',
    use_webhook: false,
    webhook_url: '',
    webhook_key: '',
    use_cart_validation: false,
    use_single_sign_on: false,
    single_sign_on_url: '',
    customer_password_hash_type: '',
    customer_password_hash_config: '',
    features_multiship: false,
    products_require_expires_property: false,
    app_session_time: 0,
    shipping_address_type: '',
    require_signed_shipping_rates: false,
    unified_order_entry_password: '',
    custom_display_id_config: '',
    affiliate_id: 0,
    is_maintenance_mode: false,
    is_active: false,
    first_payment_date: new Date().toISOString(),
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  items: query => ({
    id: increment('items', 20),
    cart_id: parseInt(query.get('cart_id') ?? '0'),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    item_category_uri: '',
    name: '',
    price: 0,
    quantity: 0,
    quantity_min: 0,
    quantity_max: 0,
    weight: 0,
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
    shipto: '',
    url: '',
    image: '',
    length: 0,
    width: 0,
    height: 0,
    expires: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  carts: query => ({
    id: increment('items', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    template_set_id: parseInt(query.get('template_set_id') ?? '0'),
    customer_uri: '',
    template_set_uri: '',
    language: '',
    use_customer_shipping_address: true,
    billing_first_name: '',
    billing_last_name: '',
    billing_company: '',
    billing_address1: '',
    billing_address2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: '',
    billing_phone: '',
    shipping_first_name: '',
    shipping_last_name: '',
    shipping_company: '',
    shipping_address1: '',
    shipping_address2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: '',
    shipping_phone: '',
    total_item_price: 0,
    total_tax: 0,
    total_shipping: 0,
    total_future_shipping: 0,
    total_order: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  cart_templates: query => ({
    id: increment('cart_templates', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    description: '',
    content: '',
    content_url: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  customer_portal_settings: query => ({
    id: increment('customer_portal_settings', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    session_lifespan_in_minutes: 0,
    allowed_origins: [],
    sso: false,
    subscriptions: {
      allow_frequency_modification: [],
      allow_next_date_modification: [],
    },
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  taxes: query => ({
    id: increment('taxes', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    name: '',
    type: 'global',
    country: '',
    region: '',
    city: '',
    is_live: false,
    service_provider: '',
    apply_to_shipping: false,
    use_origin_rates: false,
    exempt_all_customer_tax_ids: false,
    rate: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  users: query => ({
    id: increment('users', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    affiliate_id: 0,
    is_programmer: false,
    is_front_end_developer: false,
    is_designer: false,
    is_merchant: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  template_configs: query => ({
    id: increment('template_configs', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    description: 'Template Config',
    json: '{"cart_type":"default","checkout_type":"default_account","csc_requirements":"all_cards","tos_checkbox_settings":{"usage":"none","initial_state":"unchecked","is_hidden":false,"url":""},"eu_secure_data_transfer_consent":{"usage":"required"},"newsletter_subscribe":{"usage":"none"},"analytics_config":{"usage":"none","google_analytics":{"usage":"none","account_id":"","include_on_site":false},"segment_io":{"usage":"none","account_id":""}},"colors":{"usage":"none","primary":"4D4D4D","secondary":"FFFFFF","tertiary":"FFFFFF"},"use_checkout_confirmation_window":{"usage":"none"},"supported_payment_cards":["visa","mastercard","discover","amex"],"custom_checkout_field_requirements":{"cart_controls":"enabled","coupon_entry":"enabled","billing_first_name":"required","billing_last_name":"required","billing_company":"optional","billing_tax_id":"hidden","billing_phone":"optional","billing_address1":"required","billing_address2":"optional","billing_city":"required","billing_region":"default","billing_postal_code":"required","billing_country":"required"},"cart_display_config":{"usage":"none","show_product_weight":true,"show_product_category":true,"show_product_code":true,"show_product_options":true,"show_sub_frequency":true,"show_sub_startdate":true,"show_sub_nextdate":true,"show_sub_enddate":true,"hidden_product_options":[]},"foxycomplete":{"usage":"required","show_combobox":true,"combobox_open":"\\u25bc","combobox_close":"\\u25b2","show_flags":true},"custom_script_values":{"header":"","footer":"","checkout_fields":"","multiship_checkout_fields":""},"http_receipt":false,"custom_config":{},"debug":{"usage":"none"},"location_filtering":{"usage":"none","shipping_filter_type":"blacklist","billing_filter_type":"blacklist","shipping_filter_values":{},"billing_filter_values":{}},"postal_code_lookup":{"usage":"enabled"}}',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  coupons: query => ({
    id: increment('coupons', 12),
    store_id: parseInt(query.get('store_id') ?? '0'),
    name: 'e',
    start_date: null,
    end_date: null,
    number_of_uses_allowed: 0,
    number_of_uses_to_date: 0,
    number_of_uses_allowed_per_code: 0,
    coupon_discount_type: 'quantity_amount',
    coupon_discount_details: '',
    combinable: false,
    multiple_codes_allowed: false,
    product_code_restrictions: '',
    exclude_category_discounts: false,
    exclude_line_item_discounts: false,
    is_taxable: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  coupon_codes: query => ({
    id: increment('coupon_codes', 100),
    store_id: parseInt(query.get('store_id') ?? '0'),
    coupon_id: parseInt(query.get('coupon_id') ?? '0'),
    code: '',
    number_of_uses_to_date: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  generate_codes: () => ({
    id: increment('generate_codes', 1),
    message: 'All codes added successfully.',
  }),

  item_categories: query => ({
    id: increment('item_categories', 12),
    store_id: parseInt(query.get('store_id') ?? '0'),
    admin_email_template_uri: '',
    customer_email_template_uri: '',
    code: '',
    name: '',
    item_delivery_type: 'notshipped',
    max_downloads_per_customer: 0,
    max_downloads_time_period: 0,
    customs_value: 0,
    default_weight: 0,
    default_weight_unit: 'LBS',
    default_length_unit: 'IN',
    shipping_flat_rate: 0,
    shipping_flat_rate_type: 'per_order',
    handling_fee: 0,
    handling_fee_minimum: 0,
    handling_fee_type: 'none',
    handling_fee_percentage: 0,
    discount_name: null,
    discount_type: null,
    discount_details: null,
    send_customer_email: false,
    send_admin_email: false,
    admin_email: null,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  coupon_item_categories: query => ({
    id: increment('coupon_item_categories', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    coupon_id: parseInt(query.get('coupon_id') ?? '0'),
    item_category_id: parseInt(query.get('item_category_id') ?? '0'),
    coupon_uri: '',
    item_category_uri: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  gift_cards: query => ({
    id: increment('coupon_item_categories', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    name: '',
    currency_code: '',
    expires_after: null,
    product_code_restrictions: null,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  gift_card_codes: query => ({
    id: increment('gift_card_codes', 100),
    store_id: parseInt(query.get('store_id') ?? '0'),
    gift_card_id: parseInt(query.get('gift_card_id') ?? '0'),
    code: '',
    end_date: null,
    current_balance: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  gift_card_item_categories: query => ({
    id: increment('gift_card_item_categories', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    gift_card_id: parseInt(query.get('coupon_id') ?? '0'),
    item_category_id: parseInt(query.get('item_category_id') ?? '0'),
    gift_card_uri: '',
    item_category_uri: '',
  }),

  reports: query => ({
    id: increment('reports', 3),
    user_id: parseInt(query.get('user_id') ?? '0'),
    store_id: parseInt(query.get('store_id') ?? '0'),
    name: 'customers',
    version: '1',
    datetime_start: '2022-01-01T00:00:00-0800',
    datetime_end: '2022-12-31T00:00:00-0800',
    status: 'ready',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  discount_details: query => ({
    id: increment('discount_details', 3),
    item_id: parseInt(query.get('item_id') ?? '0'),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    name: '',
    amount_per: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  coupon_details: query => ({
    id: increment('coupon_details', 3),
    item_id: parseInt(query.get('item_id') ?? '0'),
    store_id: parseInt(query.get('store_id') ?? '0'),
    coupon_id: parseInt(query.get('coupon_id') ?? '0'),
    coupon_code_id: parseInt(query.get('coupon_code_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    name: '',
    code: '',
    amount_per: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  shipments: query => ({
    id: increment('shipments', 2),
    store_id: parseInt(query.get('store_id') ?? '0'),
    transaction_id: parseInt(query.get('transaction_id') ?? '0'),
    customer_id: parseInt(query.get('customer_id') ?? '0'),
    customer_address_id: parseInt(query.get('customer_address_id') ?? '0'),
    address_name: '',
    first_name: '',
    last_name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    region: '',
    postal_code: '',
    country: '',
    phone: '',
    shipping_service_id: 0,
    shipping_service_description: '',
    total_item_price: 0,
    total_tax: 0,
    total_shipping: 0,
    total_price: 0,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  webhooks: query => ({
    id: increment('webhooks', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    format: 'json',
    version: 2,
    name: '',
    url: '',
    query: '',
    encryption_key: '',
    event_resource: 'transaction',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  webhook_statuses: query => ({
    id: increment('webhook_statuses', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    webhook_id: parseInt(query.get('webhook_id') ?? '0'),
    resource_id: parseInt(query.get('resource_id') ?? '0'),
    resource_type: 'transaction',
    status: 'pending',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  webhook_logs: query => ({
    id: increment('webhook_logs', 1),
    store_id: parseInt(query.get('store_id') ?? '0'),
    webhook_id: parseInt(query.get('webhook_id') ?? '0'),
    resource_id: parseInt(query.get('resource_id') ?? '0'),
    resource_type: 'transaction',
    response_body: '',
    response_code: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  store_shipping_methods: query => {
    const method = parseInt(query.get('shipping_method_id') ?? '0');
    const dropType = parseInt(query.get('shipping_drop_type_id') ?? '0');
    const container = parseInt(query.get('shipping_container_id') ?? '0');

    return {
      id: increment('store_shipping_methods', 2),
      store_id: parseInt(query.get('store_id') ?? '0'),
      shipping_method_id: method,
      shipping_container_id: container,
      shipping_drop_type_id: dropType,
      shipping_method_uri: `https://demo.api/hapi/shipping_methods/${method}`,
      shipping_container_uri: `https://demo.api/hapi/shipping_containers/${container}`,
      shipping_drop_type_uri: `https://demo.api/hapi/shipping_drop_types/${dropType}`,
      accountid: '',
      password: '',
      meter_number: '',
      authentication_key: '',
      use_for_domestic: false,
      use_for_international: false,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    };
  },

  store_shipping_services: query => {
    const method = parseInt(query.get('shipping_method_id') ?? '0');
    const service = parseInt(query.get('shipping_service_id') ?? '0');

    return {
      id: increment('store_shipping_services', 1),
      store_id: parseInt(query.get('store_id') ?? '0'),
      shipping_method_id: method,
      shipping_service_id: service,
      shipping_method_uri: `https://demo.api/hapi/shipping_methods/${method}`,
      shipping_service_uri: `https://demo.api/hapi/shipping_drop_types/${service}`,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    };
  },

  shipping_methods: () => ({
    id: increment('shipping_methods', 2),
    name: '',
    code: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  shipping_containers: query => ({
    id: increment('shipping_containers', 1),
    shipping_method_id: parseInt(query.get('shipping_method_id') ?? '0'),
    name: '',
    code: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  shipping_drop_types: query => ({
    id: increment('shipping_drop_types', 1),
    shipping_method_id: parseInt(query.get('shipping_method_id') ?? '0'),
    name: '',
    code: '',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),

  shipping_services: query => ({
    id: increment('shipping_services', 1),
    shipping_method_id: parseInt(query.get('shipping_method_id') ?? '0'),
    name: '',
    code: '',
    is_international: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }),
};
