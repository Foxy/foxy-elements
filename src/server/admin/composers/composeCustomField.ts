import { endpoint } from '..';
import halson from 'halson';

export function composeCustomField(doc: any) {
  const { id, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/custom_fields/${id}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
}
