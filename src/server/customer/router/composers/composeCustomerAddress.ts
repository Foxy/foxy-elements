import { endpoint } from '../..';
import halson from 'halson';

export function composeCustomerAddress(doc: any) {
  const { id, store, customer, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/addresses/${id}`)
    .addLink('fx:customer', endpoint);
}
