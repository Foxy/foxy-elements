import { client } from "@foxy.io/sdk/checkout/client";

function getRequiredConfigValue(config, key) {
  const value = typeof config[key] === "string" ? config[key].trim() : "";
  return value || null;
}

function setStatus(message, kind = "info") {
  const update = () => {
    const status = document.querySelector("[data-example-status]");
    if (!status) return;
    status.textContent = message;
    status.setAttribute("data-example-status", kind);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update, { once: true });
  } else {
    update();
  }
}

function createApiState(config) {
  return {
    template_set: {
      code: "checkout",
      id: 100,
    },
    session: {
      name: "fcsid",
      id: "session_123",
    },
    debug: false,
    customer: {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      type: "registered",
      id: 123456,
      token: "jwt_demo_customer_token",
    },
    saved_payment_methods: [
      {
        gateway: "paypal_platform",
        brand: "Visa",
        last_4: "4242",
        expiry_month: "12",
        expiry_year: "2030",
        id: "pt_saved_4242",
      },
    ],
    shipments: [
      {
        address_id: null,
        address_name: "Home",
        first_name: "John",
        last_name: "Doe",
        company: "",
        phone: "+1 555-123-4567",
        address1: "123 Main St",
        address2: "Apt 4B",
        city: config.city,
        region: config.region,
        postal_code: config.postalCode,
        country: config.country,
        shipping_service_id: null,
        has_shippable_items: true,
        has_live_rate_shippable_items: false,
        region_options: config.region ? [config.region] : [],
        country_options: [config.country],
        shipping_service_options: [],
      },
    ],
    items: [
      {
        id: 186197199,
        name: "Margherita Pizza",
        code: "pizza-margherita",
        parent_code: null,
        image: "",
        url: "",
        length: null,
        length_unit: "inch",
        width: null,
        height: null,
        weight: 1,
        weight_unit: "pound",
        quantity: 1,
        quantity_min: 1,
        quantity_max: 10,
        base_price: config.total,
        price_each: config.total,
        price_each_with_tax: config.total,
        price: config.total,
        price_with_tax: config.total,
        item_category_code: "DEFAULT",
        item_delivery_type: "shipped",
        delivery_type: "physical",
        downloadable_id: null,
        downloadable_url: null,
        subscription_frequency: null,
        subscription_start_date: null,
        subscription_next_transaction_date: null,
        subscription_end_date: null,
        expires: null,
      },
    ],
    totals: [
      {
        date: null,
        taxes: [],
        coupons: [],
        gift_cards: [],
        total_line_item_discount: 0,
        total_shipping: 0,
        total_shipping_with_tax: 0,
        total_shipping_value: 0,
        total_tax: 0,
        total_item_price: config.total,
        total_item_price_with_tax: config.total,
        total_weight: 1,
        total_weight_shippable: 1,
        total_order: config.total,
      },
    ],
    billing_address: {
      use_customer_shipping_address: true,
      address_id: null,
      address_name: "Home",
      first_name: "John",
      last_name: "Doe",
      company: "",
      phone: "+1 555-123-4567",
      address1: "123 Main St",
      address2: "Apt 4B",
      city: config.city,
      region: config.region,
      postal_code: config.postalCode,
      country: config.country,
    },
    store: {
      id: 1,
      name: "Demo Store",
      domain: "example.com",
      logo_url:
        "https://pub-e63b17b4d990438a83af58c15949f8a2.r2.dev/type/liva.png",
      website_url: "https://example.com",
      checkout_url: "https://example.com/checkout",
      cancel_and_continue_url: "https://example.com",
      has_location_dependent_taxes: true,
      has_eligible_gift_cards: true,
      has_eligible_coupons: true,
      supported_payment_cards: ["visa", "mastercard", "amex"],
    },
    payment_gateways: [
      {
        type: "adyen_embedded",
        session_id: config.sessionId,
        session_data: config.sessionData,
        environment: config.environment,
        client_key: config.clientKey,
      },
    ],
    messages: [],
    language_strings: {},
    custom_fields: {},
    format: {
      weight_unit: "pound",
      locale_code: config.locale,
      currency_code: config.currency,
      currency_display: "symbol",
      maximum_fraction_digits: 2,
    },
    display: {
      hidden_product_options: [],
      required_form_fields: [],
      hidden_form_fields: [],
      use_readonly_cart_on_checkout: false,
      use_tax_inclusive_pricing: false,
      secure_data_transfer_consent: "optional",
      checkout_flow: "default",
      registration: "optional",
    },
    custom_config: {},
    express_checkout_options: [],
  };
}

export async function hydrateAdyenExample(config) {
  const sessionId = getRequiredConfigValue(config, "sessionId");
  const sessionData = getRequiredConfigValue(config, "sessionData");
  const clientKey = getRequiredConfigValue(config, "clientKey");
  const environment = getRequiredConfigValue(config, "environment") || "test";
  const missing = [];

  if (!sessionId) missing.push(config.sessionIdEnvName || "session id");
  if (!sessionData) missing.push(config.sessionDataEnvName || "session data");
  if (!clientKey) missing.push(config.clientKeyEnvName || "client key");

  if (missing.length > 0) {
    setStatus(`Missing Adyen env vars: ${missing.join(", ")}.`, "error");
    return;
  }

  setStatus("Loading Adyen session payment methods...");

  try {
    await client.hydrateJson(
      createApiState({
        ...config,
        sessionId,
        sessionData,
        clientKey,
        environment,
      }),
      { state: "idle" },
    );
    setStatus("Adyen session loaded.", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Unable to initialize Adyen session: ${message}`, "error");
  }
}
