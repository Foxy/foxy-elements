import { HALJSONResource } from '../../../elements/public/NucleonElement/types';
import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 */
export function composeItem(doc: any): HALJSONResource {
  const { id, store, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/items/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`)
    .addLink('fx:item_category', `${endpoint}/item_categories/0`)
    .addLink('fx:item_options', `${endpoint}/items/${id}/item_options`)
    .addLink('fx:shipment', `${endpoint}/shipments/0`)
    .addLink('fx:attributes', `${endpoint}/items/${id}/attributes`)
    .addLink('fx:discount_details', `${endpoint}/items/${id}/discount_details`)
    .addLink('fx:coupon_details', `${endpoint}/items/${id}/coupon_details`);
}
1;
