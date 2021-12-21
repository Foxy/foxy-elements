import { TemplateConfigJSON } from './types';

export const getDefaultJSON = (): TemplateConfigJSON => ({
  cart_type: 'default',
  checkout_type: 'default_account',
  csc_requirements: 'all_cards',
  tos_checkbox_settings: {
    usage: 'none',
    initial_state: 'unchecked',
    is_hidden: false,
    url: '',
  },
  eu_secure_data_transfer_consent: {
    usage: 'required',
  },
  newsletter_subscribe: {
    usage: 'none',
  },
  analytics_config: {
    usage: 'none',
    google_analytics: {
      usage: 'none',
      account_id: '',
      include_on_site: false,
    },
    segment_io: {
      usage: 'none',
      account_id: '',
    },
  },
  colors: {
    usage: 'none',
    primary: '4D4D4D',
    secondary: 'FFFFFF',
    tertiary: 'FFFFFF',
  },
  use_checkout_confirmation_window: {
    usage: 'none',
  },
  supported_payment_cards: ['visa', 'mastercard', 'discover', 'amex'],
  custom_checkout_field_requirements: {
    cart_controls: 'enabled',
    coupon_entry: 'enabled',
    billing_first_name: 'required',
    billing_last_name: 'required',
    billing_company: 'optional',
    billing_tax_id: 'hidden',
    billing_phone: 'optional',
    billing_address1: 'required',
    billing_address2: 'optional',
    billing_city: 'required',
    billing_region: 'default',
    billing_postal_code: 'required',
    billing_country: 'required',
  },
  cart_display_config: {
    usage: 'none',
    show_product_weight: true,
    show_product_category: true,
    show_product_code: true,
    show_product_options: true,
    show_sub_frequency: true,
    show_sub_startdate: true,
    show_sub_nextdate: true,
    show_sub_enddate: true,
    hidden_product_options: [],
  },
  foxycomplete: {
    usage: 'required',
    show_combobox: true,
    combobox_open: '\\u25bc',
    combobox_close: '\\u25b2',
    show_flags: true,
  },
  custom_script_values: {
    header: '',
    footer: '',
    checkout_fields: '',
    multiship_checkout_fields: '',
  },
  http_receipt: false,
  custom_config: '',
  debug: {
    usage: 'none',
  },
  location_filtering: {
    usage: 'none',
    shipping_filter_type: 'blacklist',
    billing_filter_type: 'blacklist',
    shipping_filter_values: {},
    billing_filter_values: {},
  },
  postal_code_lookup: {
    usage: 'enabled',
  },
});
