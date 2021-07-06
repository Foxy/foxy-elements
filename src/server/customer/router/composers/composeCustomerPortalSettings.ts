import { endpoint } from '../..';
import halson from 'halson';

export function composeCustomerPortalSettings(doc: any) {
  const { store, ...publicData } = doc;
  return halson(publicData).addLink('self', `${endpoint}/customer_portal_settings`);
}
