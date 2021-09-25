import { endpoint } from '..';
import halson from 'halson';

export function composeEmailTemplate(doc: any) {
  const { id, store, ...publicData } = doc;
  const result = halson({ ...publicData, id })
    .addLink('self', `${endpoint}/email_templates/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:template_sets', `${endpoint}/stores/${store}/template_sets`)
    .addLink('fx:cache', `${endpoint}/cart_templates/${id}/cache`)
    .addLink('fx:encode', `${endpoint}/stores/${store}/encode`);
  return result;
}
