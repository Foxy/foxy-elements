import { endpoint } from '..';
import halson from 'halson';

export function composeCustomerAttribute(doc: any) {
  const { id, customer, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/customer_attributes/${id}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`);
}
