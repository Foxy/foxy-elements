import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.TemplateConfig>;

export type TemplateConfigJSON = {
  /** Controls how your cart functions. */
  cart_type: 'default' | 'fullpage' | 'custom';

  /** Determines how you'd like customers to interact with your checkout regarding guest checkout or account checkout. The default value shows which option is shown first by default. */
  checkout_type: 'default_account' | 'default_guest' | 'guest_only' | 'account_only';

  /** Sets under what circumstances the card security code should be required. */
  csc_requirements: 'all_cards' | 'sso_only' | 'new_cards_only';

  /** Determines if you'd like a terms of service checkbox and url on your checkout. */
  tos_checkbox_settings: {
    usage: 'none' | 'required' | 'optional';
    initial_state: 'checked' | 'unchecked';
    is_hidden: boolean;
    url: string;
  };

  /** Display a Secure Data Transfer agreement to EU customers. */
  eu_secure_data_transfer_consent: {
    usage: 'none' | 'required';
  };

  /** Display a newsletter subscribe checkbox on your checkout. */
  newsletter_subscribe: {
    usage: 'none' | 'required';
  };

  /** Determine if you'd like to use an analytics service. */
  analytics_config: {
    usage: 'none' | 'required';
    google_analytics: {
      usage: 'none' | 'required';
      account_id: string;
      include_on_site: boolean;
    };
    segment_io: {
      usage: 'none' | 'required';
      account_id: string;
    };
  };

  /** Can be used to set some basic colors for your cart, checkout, and receipt templates. */
  colors: {
    usage: 'none' | 'required';
    primary: string;
    secondary: string;
    tertiary: string;
  };

  /** Not currently implemented. */
  use_checkout_confirmation_window: {
    usage: 'none' | 'required';
  };

  /** Add the payment card types you support and want displayed on the checkout page. */
  supported_payment_cards: (
    | 'visa'
    | 'mastercard'
    | 'discover'
    | 'amex'
    | 'dinersclub'
    | 'maestro'
    | 'laser'
  )[];

  /** Customize which fields should be required, option, hidden or default on the checkout page. */
  custom_checkout_field_requirements: {
    cart_controls: 'enabled' | 'disabled';
    coupon_entry: 'enabled' | 'disabled';
    billing_first_name: 'default' | 'optional' | 'required' | 'hidden';
    billing_last_name: 'default' | 'optional' | 'required' | 'hidden';
    billing_company: 'default' | 'optional' | 'required' | 'hidden';
    billing_tax_id: 'default' | 'optional' | 'required' | 'hidden';
    billing_phone: 'default' | 'optional' | 'required' | 'hidden';
    billing_address1: 'default' | 'optional' | 'required' | 'hidden';
    billing_address2: 'default' | 'optional' | 'required' | 'hidden';
    billing_city: 'default' | 'optional' | 'required' | 'hidden';
    billing_region: 'default' | 'optional' | 'required' | 'hidden';
    billing_postal_code: 'default' | 'optional' | 'required' | 'hidden';
    billing_country: 'default' | 'optional' | 'required' | 'hidden';
  };

  /** Customize which fields in the cart are shown or hidden. */
  cart_display_config: {
    usage: 'none' | 'required';
    show_product_weight: boolean;
    show_product_category: boolean;
    show_product_code: boolean;
    show_product_options: boolean;
    show_sub_frequency: boolean;
    show_sub_startdate: boolean;
    show_sub_nextdate: boolean;
    show_sub_enddate: boolean;
    hidden_product_options: string[];
  };

  /** Allows you to customize and control the functionality of our find-as-you type system from countries and regions. */
  foxycomplete: {
    usage: 'none' | 'required';
    show_combobox: boolean;
    show_flags: boolean;
    combobox_open: string;
    combobox_close: string;
  };

  /** Custom HTML, css, and JavaScript for your cart, checkout and receipt templates. Twig is not allowed in the header template. */
  custom_script_values: {
    header: string;
    footer: string;
    checkout_fields: string;
    multiship_checkout_fields: string;
  };

  /** @deprecated */
  http_receipt: boolean;

  /** A place where you can store your own custom JSON configuration data to be used by your Twig templates. */
  custom_config: any;

  /** Log debug info to browser console. */
  debug: {
    usage: 'none' | 'required';
  };

  /** This controls which countries and regions you want to allow on your cart and checkout pages. */
  location_filtering: {
    usage: 'none' | 'shipping' | 'billing' | 'both' | 'independent';
    shipping_filter_type: 'blacklist' | 'whitelist';
    billing_filter_type: 'blacklist' | 'whitelist';
    shipping_filter_values: Record<string, '*' | string[]>;
    billing_filter_values: Record<string, '*' | string[]>;
  };

  /** Enable postal code lookup on checkout. */
  postal_code_lookup: {
    usage: 'none' | 'enabled';
  };
};
