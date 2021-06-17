import { HALJSONResource } from '../../../elements/public/NucleonElement/types';
import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 */
export function composeTax(doc: any): HALJSONResource {
  const { id, store, ...publicData } = doc;
  const result = halson({ ...publicData, id })
    .addLink('self', `${endpoint}/taxes/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:tax_item_categories', `${endpoint}/taxes/${id}/tax_item_categories`)
    .addLink(
      'fx:native_integrations',
      `${endpoint}/native_integrations?provider=/${doc.service_provider}`
    );
  return result;
}
