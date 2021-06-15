import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 */
export function composeCustomerAddress(doc: any) {
  const { id, store, customer, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/customer_addresses/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`);
}
