import { composeItem } from './composeItem';
import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 * @param items
 */
export function composeCart(doc: any, items?: any[]) {
  const { id, store, customer, template_set, ...publicData } = doc;

  let result = halson(publicData)
    .addLink('self', `${endpoint}/carts/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`)
    .addLink('fx:attributes', `${endpoint}/carts/${id}/attributes`)
    .addLink('fx:template_set', `${endpoint}/template_sets/${template_set}`)
    .addLink('fx:items', `${endpoint}/carts/${id}/items`)
    .addLink('fx:discounts', `${endpoint}/carts/${id}/discounts`)
    .addLink('fx:applied_coupon_codes', `${endpoint}/carts/${id}/applied_coupon_codes`)
    .addLink('fx:custom_fields', `${endpoint}/carts/${id}/cart_custom_fields`)
    .addLink('fx:create_session', `${endpoint}/carts/${id}/session`);

  if (items) {
    result = result.addEmbed(
      'fx:items',
      items.map(item => composeItem(item))
    );
  }

  return result;
}
