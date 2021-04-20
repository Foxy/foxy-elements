import { composeItem } from './composeItem';
import { endpoint } from '../..';
import halson from 'halson';

export function composeTransaction(doc: any, items?: any[]) {
  const { id, store, customer, subscription, ...publicData } = doc;

  let result = halson({ ...publicData, id })
    .addLink('self', `${endpoint}/transactions/${id}`)
    .addLink('fx:items', `${endpoint}/transactions/${id}/items`)
    .addLink('fx:receipt', 'about:blank')
    .addLink('fx:customer', endpoint);

  if (items && items.length > 0) {
    result = result.addEmbed(
      'fx:items',
      items.map(item => composeItem(item))
    );
  }

  return result;
}
