import { composeItem } from './composeItem';
import { endpoint } from '..';
import halson from 'halson';

export function composeErrorEntry(doc: any) {
  const { id, store, customer, transaction, ...publicData } = doc;
  const result = halson({ ...publicData, id })
    .addLink('self', `${endpoint}/error_entries/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
  ;
  return result;
}
