interface Link {
  href: string;
  title: string;
  type?: string;
}

type Curies = [
  {
    name: string;
    href: string;
    templated: boolean;
  }
];

export interface FxAttribute {
  _links: { [key: string]: Link } & {
    curies: Curies;
    self: Link;
  };
  name: string;
  value: string;
  visibility: 'public' | 'private' | 'restricted';
  date_created: string;
  date_modified: string;
}

export interface FxCustomerPortalSettings {
  _links: {
    'curies': Curies;
    'self': Link;
    'fx:store': Link;
  };

  /** If this field is true we get legacy API key or sso key from store and save it in settings. For false value we drop it. */
  sso: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
  /** Shared secret key. */
  jwtSharedSecret: string;
  /** Life span of session in minutes. Maximum 40320 (4 weeks). */
  sessionLifespanInMinutes: number;
  /** An array of domains. No trailing slashes, must be https unless it's localhost. Can accept a port. Allow up to 10 entries. */
  allowedOrigins: string[];
  /** Object which contains "allowFrequencyModification" and "allowNextDateModification" fields. Subscription modification data. */
  subscriptions: {
    /** An array that contains objects with jsonataQuery and values. Max length 10 (items). */
    allowFrequencyModification: {
      /** A string that should be a valid [JSONata](https://jsonata.org/) query. Max length 200 chars. */
      jsonataQuery: string;
      /** These strings should match the sub_frequency regex sanitization. Max array length 20, max length per string 4 characters. */
      values: string[];
    }[];
    /** We can forbid modify subscription next date. False disables modification, true lifts all constraints, array of objects defines custom rules. */
    allowNextDateModification:
      | boolean
      | {
          /** Beginning of the time period this rule applies to as frequency. Example: `2w` – apply to dates at least 2 weeks from now. */
          min?: string;
          /** End of the time period this rules applies to as frequency. Example: `1y` – apply to dates at most 1 year from now. */
          max?: string;
          /** Subscription selector that should be a valid [JSONata](https://jsonata.org/) query. Max length 200 chars. */
          jsonataQuery: string;
          /** List of dates (YYYY-MM-DD) that customers can't pick as next payment date. */
          disallowedDates?: string[];
          /** A pattern defining the days that will be available for customers to pick as the next payment date. */
          allowedDays?:
            | {
                /** Constraint type. If `day`, then this rule contains days of week only. */
                type: 'day';
                /** Days of week, 1-7, where 1 is Monday and 7 is Sunday. */
                days: number[];
              }
            | {
                /** Constraint type. If `month`, then this rule contains days of month only. */
                type: 'month';
                /** Days of month, 1-31. */
                days: number[];
              };
        }[];
  };
}

export interface FxBookmark {
  _links: {
    'curies': Curies;
    'self': Link;
    'fx:property_helpers': Link;
    'fx:reporting': Link;
    'fx:encode': Link;
    'fx:user': Link;
    'fx:store': Link;
    'fx:stores': Link;
    'fx:token': Link;
  };

  message: string;
}

export interface FxStore {
  _links: {
    'curies': Curies;
    'self': Link;
    'fx:attributes': Link;
    'fx:store_version': Link;
    'fx:users': Link;
    'fx:user_accesses': Link;
    'fx:customers': Link;
    'fx:carts': Link;
    'fx:transactions': Link;
    'fx:subscriptions': Link;
    'fx:subscription_settings': Link;
    'fx:item_categories': Link;
    'fx:taxes': Link;
    'fx:payment_method_sets': Link;
    'fx:coupons': Link;
    'fx:template_sets': Link;
    'fx:cart_templates': Link;
    'fx:cart_include_templates': Link;
    'fx:checkout_templates': Link;
    'fx:customer_portal_settings': Link;
    'fx:process_subscription_webhook': Link;
    'fx:template_configs': Link;
    'fx:payment_gateways': Link;
    'fx:payment_methods_expiring': Link;
    'fx:store_shipping_methods': Link;
    'fx:receipt_templates': Link;
    'fx:email_templates': Link;
    'fx:error_entries': Link;
    'fx:downloadables': Link;
    'fx:hosted_payment_gateways': Link;
    'fx:fraud_protections': Link;
    'fx:integrations': Link;
    'fx:native_integrations': Link;
    'fx:activate_store_monthly_url': Link;
    'fx:activate_store_yearly_url': Link;
  };

  _embedded?: Record<string, unknown> & {
    'fx:attributes': FxAttribute[];
  };

  /** This is the store version for this store. For more details about this version, see the {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/store_versions store_versions} property helpers which include changelog information. */
  store_version_uri: string;
  /** The name of your store as you'd like it displayed to your customers and our system. */
  store_name: string;
  /** This is a unique FoxyCart subdomain for your cart, checkout, and receipt. If you install a custom SSL certificate, this will contain a full domain such as store.yourdomain.com. */
  store_domain: string;
  /** Set to true when you plan to use a custom SSL certificate. If set to true, your store_domain must be a full domain. */
  use_remote_domain: boolean;
  /** The URL of your online store. */
  store_url: string;
  /** By default, FoxyCart sends customers back to the page referrer after completing a purchase. Instead, you can set a specific URL here. */
  receipt_continue_url: string;
  /** This is the email address of your store. By default, this will be the from address for your store receipts. If you specify a from_email, you can also put in multiple email addresses here, separated by a comma to be used when bcc_on_receipt_email is true. */
  store_email: string;
  /** Used for when you want to specify a different from email than your store's email address or when your store_email has a list of email addresses. */
  from_email: string;
  /** Set this to true if you would like each receipt sent to your customer to also be blind carbon copied to your store's email address. */
  bcc_on_receipt_email: boolean;
  /** Set this to true if you have set up your DNS settings to include and spf record for FoxyCart. See the {@link http://wiki.foxycart.com/v/1.1/emails FoxyCart documentation} for more details. */
  use_email_dns: boolean;
  /** If you'd like to configure your own SMTP server for sending transaction receipt emails, you can do so here. The JSON supports the following fields: `username`,`password`,`host`,`port`,`security`. The security value can be blank, `ssl`, or `tls` */
  smtp_config: string | null;
  /** The postal code of your store. This will be used for calculating shipping costs if you sell shippable items. */
  postal_code: string;
  /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. This will be used for calculating shipping costs if you sell shippable items. */
  region: string;
  /** Two character ISO 3166-1-alpha-2 code for the country your store is located in. This will be used for calculating shipping costs if you sell shippable items. */
  country: string;
  /** The locale code for your Store's locale. This will be used to format strings for your store. */
  locale_code: string;
  /** Set to true to prevent the currency symbol from being displayed (example: a points based checkout system). */
  hide_currency_symbol: boolean;
  /** Set to true to prevent the decimal characters from being displayed (example: a points based checkout system). */
  hide_decimal_characters: boolean;
  /** Set true to use the international currency symbol such as USD instead of the regional one like $. */
  use_international_currency_symbol: boolean;
  /** The default language for your store's cart, checkout, and receipt strings. */
  language: string;
  /** A url to your store's logo which may be used in your store's templates. */
  logo_url: string;
  /** The preferred configuration of your customer checkout experience, such as defaulting to guest checkout or requiring account creation with each checkout. */
  checkout_type: string;
  /** Set this to true to POST encrypted XML of your order to the webhook url of your choice. */
  use_webhook: boolean;
  /** This is the url of the webhook endpoint for processing your store's webhook. See the {@link http://wiki.foxycart.com/static/redirect/webhook FoxyCart documentation} for more details. */
  webhook_url: string;
  /** This is the key used to encrypt your webhook data. It is also used as the legacy API key and the HMAC cart encryption key. */
  webhook_key: string;
  /** Set to true to use HMAC cart validation for your store. */
  use_cart_validation: boolean;
  /** Set this to true to redirect to your server before checkout so you can use our single sign on feature and log in your users automatically to FoxyCart or if you want to validate items before checkout. */
  use_single_sign_on: boolean;
  /** This is your single sign on url to redirect your users to prior to hitting the checkout page.  See the {@link http://wiki.foxycart.com/static/redirect/sso FoxyCart documentation} for more details. */
  single_sign_on_url: string;
  /** When saving a customer to FoxyCart, this is the password hashing method that will be used. */
  customer_password_hash_type: string;
  /** Configuration settings for the customer_password_hash_type in use. See the {@link http://wiki.foxycart.com/static/redirect/customers FoxyCart documentation} for more details. */
  customer_password_hash_config: string;
  /** Set to true to turn on FoxyCart's multiship functionality for shipping items to multiple locations in a single order. See the {@link http://wiki.foxycart.com/static/redirect/multiship FoxyCart documentation} for more details. */
  features_multiship: boolean;
  /** Set to true to require all front-end add-to-cart interactions have a valid `expires` property. */
  products_require_expires_property: boolean;
  /** If your store sells products which collect personal or sensitive information as product attributes, you may want to consider lowering your cart session lifespan. You can leave it as 0 to keep the default which is currently 43200 seconds (12 hours). The maximum allowed time is currently 259200 seconds (72 hours). */
  app_session_time: number;
  /** Used for determining the type of the customer address used when calculating shipping costs. */
  shipping_address_type: string;
  /** Shipping rate signing ensures that the rate the customer selects is carried through and not altered in any way. If you're intending to make use of javascript snippets on your store to alter the price or label of shipping rates or add custom rates dynamically, disable this setting as it will block those rates from being applied. The default is false. */
  require_signed_shipping_rates: boolean;
  /** The timezone of your store. This will impact how dates are shown to customers and within the FoxyCart admin. */
  timezone: string;
  /** Set a master password here if you would like to be able to check out as your customers without having to know their password. */
  unified_order_entry_password: string;
  /** Instead of displaying the Foxy Transaction ID, you can display your own custom display ID on your store's receipt and receipt emails. This JSON config determines how those display ids will work. The JSON supports the following fields: `enabled`, `start`, `length`, `prefix`, `suffix`. */
  custom_display_id_config: string;
  /** This can only be set during store creation. Contact us if you need this value changed later. */
  affiliate_id: number;
  /** This settings makes your checkout page completely non-functioning. Your customers will see the maintenance notification language string instead. The default is false. */
  is_maintenance_mode: boolean;
  /** If this store is in development or if it has an active FoxyCart subscription and can therefore use a live payment gateway to process live transactions. */
  is_active: boolean;
  /** The date of the first payment for this FoxyCart store subscription. This can be considered the go live date for this store. */
  first_payment_date: string | null;
  /** The date this resource was created. */
  date_created: string | null;
  /** The date this resource was last modified. */
  date_modified: string | null;
}

export interface FxUser {
  _links: {
    'curies': Curies;
    'self': Link;
    'fx:default_store': Link;
    'fx:attributes': Link;
    'fx:stores': Link;
  };

  _embedded: Record<string, unknown>;

  /** The user's given name. */
  first_name: string;
  /** The user's surname. */
  last_name: string;
  /** The user's email address. This is used as the login to the FoxyCart admin for this user. */
  email: string;
  /** The user's phone number. */
  phone: string;
  /** This can only be set during user creation. Contact us if you need this value changed later. */
  affiliate_id: number;
  /** If this user is a programmer who writes server side code in languages like PHP, .NET, Python, Java, Ruby, etc */
  is_programmer: boolean;
  /** If this user is a front end developer who writes code in things like HTML, CSS, and maybe some JavaScript. */
  is_front_end_developer: boolean;
  /** If this user is a front end designer who works in wireframes, graphic designs, and user interfaces. */
  is_designer: boolean;
  /** If this user is a a merchant or store admin involved in the item and money side of the e-commerce business. */
  is_merchant: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}
