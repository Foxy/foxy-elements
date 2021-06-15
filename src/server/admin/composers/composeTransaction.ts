import { composeItem } from './composeItem';
import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 * @param items
 */
export function composeTransaction(doc: any, items?: any[]) {
  const { id, store, customer, subscription, ...publicData } = doc;

  let result = halson({ ...publicData, id })
    .addLink('self', `${endpoint}/transactions/${id}`)
    .addLink('fx:void', `${endpoint}/transactions/${id}/void`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:items', `${endpoint}/transactions/${id}/items`)
    .addLink('fx:refund', `${endpoint}/transactions/${id}/refund`)
    .addLink('fx:receipt', 'about:blank')
    .addLink('fx:capture', `${endpoint}/transactions/${id}/capture`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`)
    .addLink('fx:payments', `${endpoint}/transactions/${id}/payments`)
    .addLink('fx:discounts', `${endpoint}/transactions/${id}/discounts`)
    .addLink('fx:shipments', `${endpoint}/transactions/${id}/shipments`)
    .addLink('fx:attributes', `${endpoint}/transactions/${id}/attributes`)
    .addLink('fx:send_emails', `${endpoint}/transactions/${id}/send_emails`)
    .addLink('fx:applied_taxes', `${endpoint}/transactions/${id}/applied_taxes`)
    .addLink('fx:custom_fields', `${endpoint}/transactions/${id}/transaction_custom_fields`)
    .addLink('fx:process_webhook', `${endpoint}/transactions/${id}/process_webhook`)
    .addLink('fx:transaction_logs', `${endpoint}/transactions/${id}/transaction_logs`)
    .addLink('fx:billing_addresses', `${endpoint}/transactions/${id}/billing_addresses`)
    .addLink('fx:native_integrations', `${endpoint}/transactions/${id}/native_integrations`);

  if (items && items.length > 0) {
    result = result.addEmbed(
      'fx:items',
      items.map(item => composeItem(item))
    );
  }

  return result;
}
