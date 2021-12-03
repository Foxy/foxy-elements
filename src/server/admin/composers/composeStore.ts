import { endpoint } from '..';
import halson from 'halson';

export function composeStore(doc: any) {
  const { id, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/stores/${id}`)
    .addLink('fx:attributes', `${endpoint}/stores/${id}/attributes`)
    .addLink('fx:store_version', `${endpoint}/property_helpers/store_versions/0`)
    .addLink('fx:users', `${endpoint}/stores/${id}/users`)
    .addLink('fx:user_accesses', `${endpoint}/stores/${id}/user_accesses`)
    .addLink('fx:customers', `${endpoint}/stores/${id}/customers`)
    .addLink('fx:carts', `${endpoint}/stores/${id}/carts`)
    .addLink('fx:transactions', `${endpoint}/stores/${id}/transactions`)
    .addLink('fx:subscriptions', `${endpoint}/stores/${id}/subscriptions`)
    .addLink('fx:subscription_settings', `${endpoint}/store_subscription_settings/${id}`)
    .addLink('fx:customer_portal_settings', `${endpoint}/stores/${id}/customer_portal_settings`)
    .addLink(
      'fx:process_subscription_webhook',
      `${endpoint}/stores/${id}/process_subscription_webhook`
    )
    .addLink('fx:item_categories', `${endpoint}/stores/${id}/item_categories`)
    .addLink('fx:taxes', `${endpoint}/stores/${id}/taxes`)
    .addLink('fx:payment_method_sets', `${endpoint}/stores/${id}/payment_method_sets`)
    .addLink('fx:coupons', `${endpoint}/stores/${id}/coupons`)
    .addLink('fx:template_sets', `${endpoint}/stores/${id}/template_sets`)
    .addLink('fx:cart_templates', `${endpoint}/stores/${id}/cart_templates`)
    .addLink('fx:cart_include_templates', `${endpoint}/stores/${id}/cart_include_templates`)
    .addLink('fx:checkout_templates', `${endpoint}/stores/${id}/checkout_templates`)
    .addLink('fx:receipt_templates', `${endpoint}/stores/${id}/receipt_templates`)
    .addLink('fx:email_templates', `${endpoint}/stores/${id}/email_templates`)
    .addLink('fx:error_entries', `${endpoint}/stores/${id}/error_entries`)
    .addLink('fx:downloadables', `${endpoint}/stores/${id}/downloadables`)
    .addLink('fx:hosted_payment_gateways', `${endpoint}/stores/${id}/hosted_payment_gateways`)
    .addLink('fx:fraud_protections', `${endpoint}/stores/${id}/fraud_protections`);
}
