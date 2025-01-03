export const webhookLegacyXml = JSON.stringify({
  service: 'legacy_xml',
  version: 1,
  events: ['transaction/created'],
  title: '',
  url: '',
});

export const webhookJson = JSON.stringify({
  encryption_key: '',
  service: 'json',
  version: 1,
  events: [],
  title: '',
  url: '',
});

export const onesource = JSON.stringify({
  part_number_product_option: '',
  product_order_priority: '',
  calling_system_number: '',
  external_company_id: '',
  audit_settings: 'never',
  company_role: 'B',
  service_url: '',
  host_system: '',
  from_city: '',
});

export const customTax = JSON.stringify({
  url: '',
});

export const applePay = JSON.stringify({
  merchantID: '',
});

export const avalara = JSON.stringify({
  category_to_product_tax_code_mappings: {},
  enable_colorado_delivery_fee: false,
  address_validation_countries: [],
  use_address_validation: false,
  create_invoice: false,
  company_code: '',
  service_url: '',
  use_ava_tax: false,
  key: '',
  id: '',
});

export const webflow = JSON.stringify({
  inventory_field_name: '',
  inventory_field_id: '',
  collection_name: '',
  sku_field_name: '',
  collection_id: '',
  sku_field_id: '',
  site_name: '',
  service: 'webflow',
  version: 1,
  site_id: '',
  events: ['transaction/created'],
  auth: '',
});

export const zapier = JSON.stringify({
  service: 'zapier',
  events: [],
  url: '',
});

export const taxjar = JSON.stringify({
  category_to_product_tax_code_mappings: {},
  create_invoice: false,
  api_token: '',
});
