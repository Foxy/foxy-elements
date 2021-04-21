import { composeCart } from './composeCart';
import { composeTransaction } from './composeTransaction';
import { endpoint } from '../..';
import halson from 'halson';

export function composeSubscription(
  doc: any,
  lastTransaction?: any,
  transactionTemplate?: any,
  items?: any[]
) {
  const { id, store, customer, last_transaction, ...publicData } = doc;

  const self = new URL(`${endpoint}/subscriptions/${id}`);
  const zoom = [];

  if (lastTransaction) zoom.push('last_transaction');
  if (transactionTemplate) zoom.push('transaction_template');
  if (items) zoom.push('transaction_template:items');
  if (zoom.length > 0) self.searchParams.set('zoom', zoom.join());

  let result = halson(publicData)
    .addLink('self', self.toString())
    .addLink('fx:customer', endpoint)
    .addLink('fx:transactions', `${endpoint}/transactions?subscription_id=${id}`)
    .addLink('fx:last_transaction', `${endpoint}/transactions/${last_transaction}`)
    .addLink('fx:transaction_template', `${endpoint}/transaction_templates/0`)
    .addLink('fx:sub_token_url', `about:blank`);

  if (lastTransaction) {
    result = result.addEmbed('fx:last_transaction', composeTransaction(lastTransaction));
  }

  if (transactionTemplate) {
    result = result.addEmbed('fx:transaction_template', composeCart(transactionTemplate, items));
  }

  return result;
}
