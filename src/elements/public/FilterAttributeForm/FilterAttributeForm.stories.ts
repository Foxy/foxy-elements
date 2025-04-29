import { FilterAttributeForm } from './index';
import { Type, Option } from '../QueryBuilder/types';
import { getStory } from '../../../storygen/getStory';
import { getMeta } from '../../../storygen/getMeta';
import { Summary } from '../../../storygen/Summary';

const demoLocalName = 'demo-filter-attribute-form';
if (!customElements.get(demoLocalName)) {
  customElements.define(demoLocalName, class extends FilterAttributeForm {});
}

const summary: Summary = {
  href: 'https://demo.api/hapi/store_attributes/0',
  parent: 'https://demo.api/hapi/store_attributes',
  nucleon: true,
  localName: demoLocalName,
  translatable: true,
  configurable: {},
};

const optionsArray: Option[] = [
  // Date
  {
    type: Type.Date,
    path: 'transaction_date',
    label: 'option_transaction_date',
  },
  {
    type: Type.Date,
    path: 'date_modified',
    label: 'option_date_modified',
  },

  // Totals
  {
    type: Type.Number,
    path: 'total_order',
    label: 'option_total_order',
    group: { name: 'group_totals' },
  },
  {
    type: Type.String,
    path: 'discounts:code',
    label: 'option_coupon_code',
    group: { name: 'group_totals' },
  },

  // Customer
  {
    type: Type.String,
    path: 'customer_ip',
    label: 'option_ip',
    group: { name: 'group_customer', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer_id',
    label: 'option_customer_id',
    group: { name: 'group_customer', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer_email',
    label: 'option_email',
    group: { name: 'group_customer', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer_first_name',
    label: 'option_first_name',
    group: { name: 'group_customer', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer_last_name',
    label: 'option_last_name',
    group: { name: 'group_customer', layout: 'details' },
  },

  // Payment
  {
    type: Type.String,
    path: 'customer:default_billing_address:country',
    label: 'option_billing_country',
    group: { name: 'group_payment', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer:default_billing_address:region',
    label: 'option_billing_region',
    group: { name: 'group_payment', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'payments:cc_number_masked',
    label: 'option_cc_number_masked',
    group: { name: 'group_payment', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'payments:cc_type',
    label: 'option_cc_type',
    group: { name: 'group_payment', layout: 'details' },
    list: [
      { label: 'option_amex', value: 'Amex' },
      { label: 'option_diners', value: 'Diners' },
      { label: 'option_discover', value: 'Discover' },
      { label: 'option_jcb', value: 'JCB' },
      { label: 'option_maestro', value: 'Maestro' },
      { label: 'option_mastercard', value: 'MasterCard' },
      { label: 'option_unionpay', value: 'UnionPay' },
      { label: 'option_visa', value: 'Visa' },
      { label: 'option_unknown', value: '' },
    ],
  },
  {
    type: Type.String,
    path: 'payments:gateway_type',
    label: 'option_gateway_type',
    group: { name: 'group_payment', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'payments:purchase_order',
    label: 'option_purchase_order',
    group: { name: 'group_payment', layout: 'details' },
  },

  // Shipping
  {
    type: Type.String,
    path: 'customer:default_shipping_address:country',
    label: 'option_shipping_country',
    group: { name: 'group_shipping', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer:default_shipping_address:region',
    label: 'option_shipping_region',
    group: { name: 'group_shipping', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer:default_shipping_address:first_name',
    label: 'option_shipping_first_name',
    group: { name: 'group_shipping', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'customer:default_shipping_address:last_name',
    label: 'option_shipping_last_name',
    group: { name: 'group_shipping', layout: 'details' },
  },

  // Product
  {
    type: Type.String,
    path: 'items:item_category:code',
    label: 'option_category_code',
    group: { name: 'group_items', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'items:code',
    label: 'option_item_code',
    group: { name: 'group_items', layout: 'details' },
  },
  {
    type: Type.String,
    path: 'items:name',
    label: 'option_item_name',
    group: { name: 'group_items', layout: 'details' },
  },
  {
    type: Type.Attribute,
    path: 'items:item_options',
    label: 'option_item_option',
    group: { name: 'group_items', layout: 'details' },
  },

  // Custom
  {
    type: Type.Attribute,
    path: 'custom_fields',
    label: 'option_custom_field',
    group: { name: 'group_custom_options', layout: 'details' },
  },
  {
    type: Type.Attribute,
    path: 'attributes',
    label: 'option_attribute',
    group: { name: 'group_custom_options', layout: 'details' },
  },

  // Misc
  {
    type: Type.String,
    path: 'status',
    label: 'option_status',
    group: { name: 'group_misc' },
    list: [
      { label: 'option_status_approved', value: 'approved' },
      { label: 'option_status_authorized', value: 'authorized' },
      { label: 'option_status_captured', value: 'captured' },
      { label: 'option_status_completed', value: '' },
      { label: 'option_status_declined', value: 'declined' },
      { label: 'option_status_pending', value: 'pending' },
      { label: 'option_status_refunded', value: 'refunded' },
      { label: 'option_status_rejected', value: 'rejected' },
      { label: 'option_status_verified', value: 'verified' },
      { label: 'option_status_voided', value: 'voided' },
    ],
  },
  {
    type: Type.Boolean,
    path: 'is_test',
    label: 'option_is_test',
    group: { name: 'group_misc' },
  },
  {
    type: Type.Boolean,
    path: 'hide_transaction',
    label: 'option_hide_transaction',
    group: { name: 'group_misc' },
  },
  {
    label: 'option_data_is_fed',
    type: Type.Boolean,
    path: 'data_is_fed',
    group: { name: 'group_misc' },
  },
];

export default getMeta(summary);

const options = JSON.stringify(optionsArray);
const ext = `docs-href="https://api.foxy.io/rels/transactions" defaults="is_test=false&hide_transaction=false" pathname="/stores/0/transactions" options='${options}' ns="demo filter-attribute-form"`;

export const Playground = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });
export const Error = getStory({ ...summary, ext });
export const Busy = getStory({ ...summary, ext });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
