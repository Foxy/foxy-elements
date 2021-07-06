import { composeItem } from './composeItem';
import { endpoint } from '../..';
import halson from 'halson';

export function composeCart(doc: any, items?: any[]) {
  const { id, store, customer, template_set, ...publicData } = doc;

  let result = halson(publicData)
    .addLink('self', `${endpoint}/transaction_templates/${id}`)
    .addLink('fx:customer', endpoint);

  if (items) {
    result = result.addEmbed(
      'fx:items',
      items.map(item => composeItem(item))
    );
  }

  return result;
}
