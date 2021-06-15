import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 */
export function composeDefaultPaymentMethod(doc: any) {
  const { store, customer, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/customers/${customer}/default_payment_method`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`);
}
