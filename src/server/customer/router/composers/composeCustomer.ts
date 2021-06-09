import { composeCustomerAttribute } from './composeCustomerAttribute';
import { endpoint } from '../..';
import halson from 'halson';

export function composeCustomer(doc: any, attributes?: any[]) {
  const { id, store, ...publicData } = doc;

  let result = halson({ ...publicData, id })
    .addLink('self', endpoint)
    .addLink('fx:attributes', `${endpoint}/attributes`)
    .addLink('fx:default_billing_address', `${endpoint}/default_billing_address`)
    .addLink('fx:default_shipping_address', `${endpoint}/default_shipping_address`)
    .addLink('fx:default_payment_method', `${endpoint}/default_payment_method`)
    .addLink('fx:transactions', `${endpoint}/transactions`)
    .addLink('fx:subscriptions', `${endpoint}/subscriptions`)
    .addLink('fx:customer_addresses', `${endpoint}/addresses`);

  if (attributes && attributes.length > 0) {
    result = result.addEmbed(
      'fx:attributes',
      attributes.map(attribute => composeCustomerAttribute(attribute))
    );
  }

  return result;
}
