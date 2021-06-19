import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 */
export function composeErrorEntry(doc: any) {
  const { id, store, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/error_entries/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
}
