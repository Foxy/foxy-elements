import { endpoint } from '../..';
import halson from 'halson';

export function composeDefaultPaymentMethod(doc: any) {
  const { id, store, customer, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/default_payment_method`)
    .addLink('fx:customer', endpoint);
}
