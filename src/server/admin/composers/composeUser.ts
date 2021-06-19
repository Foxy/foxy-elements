import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 */
export function composeUser(doc: any) {
  const { id, store, ...publicData } = doc;
  const result = halson({ ...publicData, id }).addLink('self', `${endpoint}/users/${id}`);
  return result;
}
