import { endpoint } from '..';
import halson from 'halson';

export function composePayment(doc: any) {
  const { id, store, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/applied_taxes/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
}
