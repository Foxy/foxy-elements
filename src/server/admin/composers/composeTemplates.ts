import { endpoint } from '..';
import halson from 'halson';

/**
 * @param templateType to create the compose function for.
 */
export function createTemplateComposeFunction(templateType: string): (doc: any) => any {
  return function (doc: any) {
    const { id, store, ...publicData } = doc;
    const result = halson({ ...publicData, id })
      .addLink('self', `${endpoint}/${templateType}/${id}`)
      .addLink('fx:store', `${endpoint}/stores/${store}`)
      .addLink('fx:template_sets', `${endpoint}/stores/${store}/template_sets`)
      .addLink('fx:cache', `${endpoint}/${templateType}/${id}/cache`)
      .addLink('fx:encode', `${endpoint}/stores/${store}/encode`);
    return result;
  };
}
