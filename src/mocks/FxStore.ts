import { FxStore } from '../types/hapi';

export const store: FxStore = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8',
      title: 'This Store',
    },
    'fx:attributes': {
      href: 'https://api.foxy.test/stores/8/attributes',
      title: 'Attributes for This Store',
    },
    'fx:store_version': {
      href: 'https://api.foxy.test/property_helpers/store_versions/21',
      title: 'This store version',
    },
    'fx:users': {
      href: 'https://api.foxy.test/stores/8/users',
      title: 'Users for This Store',
    },
    'fx:user_accesses': {
      href: 'https://api.foxy.test/stores/8/user_accesses',
      title: 'User Access for This Store',
    },
    'fx:customers': {
      href: 'https://api.foxy.test/stores/8/customers',
      title: 'Customers for This Store',
    },
    'fx:carts': {
      href: 'https://api.foxy.test/stores/8/carts',
      title: 'Carts for This Store',
    },
    'fx:transactions': {
      href: 'https://api.foxy.test/stores/8/transactions',
      title: 'Transactions for This Store',
    },
    'fx:subscriptions': {
      href: 'https://api.foxy.test/stores/8/subscriptions',
      title: 'Subscriptions for This Store',
    },
    'fx:subscription_settings': {
      href: 'https://api.foxy.test/store_subscription_settings/8',
      title: 'Subscription Settings for This Store',
    },
    'fx:customer_portal_settings': {
      href: 'https://api.foxy.test/stores/8/customer_portal_settings',
      title: 'Customer Portal Settings for This Store',
    },
    'fx:process_subscription_webhook': {
      href: 'https://api.foxy.test/stores/8/process_subscription_webhook',
      title: 'POST here to resend the daily subscription webhook notification for this store',
    },
    'fx:item_categories': {
      href: 'https://api.foxy.test/stores/8/item_categories',
      title: 'Item Categories for This Store',
    },
    'fx:taxes': {
      href: 'https://api.foxy.test/stores/8/taxes',
      title: 'Taxes for This Store',
    },
    'fx:payment_method_sets': {
      href: 'https://api.foxy.test/stores/8/payment_method_sets',
      title: 'Payment Method Sets for This Store',
    },
    'fx:coupons': {
      href: 'https://api.foxy.test/stores/8/coupons',
      title: 'Coupons for This Store',
    },
    'fx:template_sets': {
      href: 'https://api.foxy.test/stores/8/template_sets',
      title: 'Template Sets for This Store',
    },
    'fx:template_configs': {
      href: 'https://api.foxy.test/stores/8/template_configs',
      title: 'Template Configs for This Store',
    },
    'fx:cart_templates': {
      href: 'https://api.foxy.test/stores/8/cart_templates',
      title: 'Cart Templates for This Store',
    },
    'fx:cart_include_templates': {
      href: 'https://api.foxy.test/stores/8/cart_include_templates',
      title: 'Cart Include Templates for This Store',
    },
    'fx:checkout_templates': {
      href: 'https://api.foxy.test/stores/8/checkout_templates',
      title: 'Checkout Templates for This Store',
    },
    'fx:receipt_templates': {
      href: 'https://api.foxy.test/stores/8/receipt_templates',
      title: 'Receipt Templates for This Store',
    },
    'fx:email_templates': {
      href: 'https://api.foxy.test/stores/8/email_templates',
      title: 'Email Templates for This Store',
    },
    'fx:error_entries': {
      href: 'https://api.foxy.test/stores/8/error_entries',
      title: 'Error Entries for This Store',
    },
    'fx:downloadables': {
      href: 'https://api.foxy.test/stores/8/downloadables',
      title: 'Downloadables for This Store',
    },
    'fx:payment_gateways': {
      href: 'https://api.foxy.test/stores/8/payment_gateways',
      title: 'Payment Gateways for This Store',
    },
    'fx:hosted_payment_gateways': {
      href: 'https://api.foxy.test/stores/8/hosted_payment_gateways',
      title: 'Hosted Payment Gateways for This Store',
    },
    'fx:fraud_protections': {
      href: 'https://api.foxy.test/stores/8/fraud_protections',
      title: 'Fraud Protections for This Store',
    },
    'fx:payment_methods_expiring': {
      href: 'https://api.foxy.test/stores/8/payment_methods_expiring',
      title: 'Customer payment methods which are about to expire',
    },
    'fx:store_shipping_methods': {
      href: 'https://api.foxy.test/stores/8/store_shipping_methods',
      title: 'Shipping methods supported by this store',
    },
    'fx:integrations': {
      href: 'https://api.foxy.test/stores/8/integrations',
      title: 'Third party integrations which have been granted OAuth access to this store',
    },
    'fx:native_integrations': {
      href: 'https://api.foxy.test/stores/8/native_integrations',
      title: 'Third party integrations which require credentials and configuration.',
    },
    'fx:activate_store_monthly_url': {
      href: 'https://signup.foxycart.com/cart?cart=checkout&empty=true&quantity_max=1||28cd178a22214aea11be7b1b179f8542bbc1a4652b5b8fa1512bf77cd4ea8a4f&name=FoxyCart.com+Store+Subscription||12f4d3d5b3eba79880ede3a0ec6c518ea64e550399c2a30c3620a097e0d4404e&price=20||43a9144ce94b8588467487d26a90815654a0db78af18946d4d2c80822be86452&sub_frequency=1m||992962b8d334adb5e339013e9e61c79183f34dcbc5f5c5949fc1468a6f720a08&code=8||d50fff6c64f14bd7ab0cf4a1b4e9d0cfd5072c2920757539aef667387d8bd652&user_id=2||79d57442231387ab7ab0f1fc46a07e4f1691e9ece111d9ef3e9b82cec50db3e8&Store_Name=yooo||1fc827a6ca712269d36070f18a03c3d6b556c1e6f4d40b79dad1b5a319bb427d&plan=standard||f2b1c88914701e09092f54a19631cf2e68706702ee66a43f74fa9666fbd56d0f',
      title:
        'Follow this link in your browser to pay for your monthly subscription and activate this store',
      type: 'text/html',
    },
    'fx:activate_store_yearly_url': {
      href: 'https://signup.foxycart.com/cart?cart=checkout&empty=true&quantity_max=1||28cd178a22214aea11be7b1b179f8542bbc1a4652b5b8fa1512bf77cd4ea8a4f&name=FoxyCart.com+Store+Subscription||12f4d3d5b3eba79880ede3a0ec6c518ea64e550399c2a30c3620a097e0d4404e&price=180||476b25284b0acfe4fc9282922d5c6764aea0cfa46ccc3eecfb3fafe7be63297e&sub_frequency=1y||21ed9850a02c7aeb584cafa3a1367c82869f7a709d6036bca4d4fa19e98814c1&code=8||d50fff6c64f14bd7ab0cf4a1b4e9d0cfd5072c2920757539aef667387d8bd652&user_id=2||79d57442231387ab7ab0f1fc46a07e4f1691e9ece111d9ef3e9b82cec50db3e8&Store_Name=yooo||1fc827a6ca712269d36070f18a03c3d6b556c1e6f4d40b79dad1b5a319bb427d&plan=standard||f2b1c88914701e09092f54a19631cf2e68706702ee66a43f74fa9666fbd56d0f',
      title:
        'Follow this link in your browser to pay for your yearly subscription and activate this store',
      type: 'text/html',
    },
  },
  store_version_uri: 'https://api.foxy.test/property_helpers/store_versions/21',
  store_name: 'Acme Corporation',
  store_domain: 'acme',
  use_remote_domain: false,
  store_url: 'http://example.com/',
  receipt_continue_url: '',
  store_email: 'example@example.com',
  from_email: 'nelson@murphy.com',
  use_email_dns: false,
  bcc_on_receipt_email: true,
  smtp_config: null,
  postal_code: '37211',
  region: 'TN',
  country: 'US',
  locale_code: 'en_US',
  timezone: 'America/Los_Angeles',
  hide_currency_symbol: false,
  hide_decimal_characters: false,
  use_international_currency_symbol: false,
  language: 'english',
  logo_url: 'http://somethingcooler.cooler',
  checkout_type: 'default_account',
  use_webhook: false,
  webhook_url: '',
  webhook_key: '',
  use_cart_validation: false,
  use_single_sign_on: false,
  single_sign_on_url: '',
  customer_password_hash_type: 'sha256_salted_suffix',
  customer_password_hash_config: '48',
  features_multiship: false,
  products_require_expires_property: false,
  app_session_time: 0,
  shipping_address_type: 'residential',
  require_signed_shipping_rates: false,
  unified_order_entry_password: '',
  custom_display_id_config: '',
  affiliate_id: 0,
  is_maintenance_mode: false,
  is_active: false,
  first_payment_date: null,
  date_created: null,
  date_modified: '2016-02-05T10:25:26-0800',
};
