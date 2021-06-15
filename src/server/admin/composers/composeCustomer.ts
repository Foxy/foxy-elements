import { composeCustomerAttribute } from './composeCustomerAttribute';
import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 * @param attributes
 */
export function composeCustomer(doc: any, attributes?: any[]) {
  const { id, store, ...publicData } = doc;

  let result = halson({ ...publicData, id })
    .addLink('self', `${endpoint}/customers/${id}`)
    .addLink('fx:attributes', `${endpoint}/customers/${id}/attributes`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:default_billing_address', `${endpoint}/customers/${id}/default_billing_address`)
    .addLink('fx:default_shipping_address', `${endpoint}/customers/${id}/default_shipping_address`)
    .addLink('fx:default_payment_method', `${endpoint}/customers/${id}/default_payment_method`)
    .addLink('fx:transactions', `${endpoint}/stores/${store}/transactions?customer_id=${id}`)
    .addLink('fx:subscriptions', `${endpoint}/stores/${store}/subscriptions?customer_id=${id}`)
    .addLink('fx:customer_addresses', `${endpoint}/customers/${id}/addresses`);

  if (attributes && attributes.length > 0) {
    result = result.addEmbed(
      'fx:attributes',
      attributes.map(attribute => composeCustomerAttribute(attribute))
    );
  }

  return result;
}
