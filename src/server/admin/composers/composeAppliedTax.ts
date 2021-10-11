import { endpoint } from '..';
import halson from 'halson';

export function composeAppliedTax(doc: any) {
  const { id, tax, store, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/applied_taxes/${id}`)
    .addLink('fx:tax', `${endpoint}/taxes/${tax}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
}
