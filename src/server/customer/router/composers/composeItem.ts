import { endpoint } from '../..';
import halson from 'halson';

export function composeItem(doc: any) {
  const { id, store, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/items/${id}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
}
