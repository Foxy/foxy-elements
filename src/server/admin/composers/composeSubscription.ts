import { composeCart } from './composeCart';
import { composeTransaction } from './composeTransaction';
import { endpoint } from '..';
import halson from 'halson';

/**
 * @param doc
 * @param lastTransaction
 * @param transactionTemplate
 * @param items
 */
export function composeSubscription(
  doc: any,
  lastTransaction?: any,
  transactionTemplate?: any,
  items?: any[]
) {
  const { id, store, customer, last_transaction, ...publicData } = doc;

  let result = halson(publicData)
    .addLink('self', `${endpoint}/subscriptions/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`)
    .addLink('fx:attributes', `${endpoint}/subscriptions/${id}/attributes`)
    .addLink('fx:transactions', `${endpoint}/stores/${store}/transactions?subscription_id=${id}`)
    .addLink('fx:last_transaction', `${endpoint}/transactions/${last_transaction}`)
    .addLink('fx:transaction_template', `${endpoint}/carts/0`)
    .addLink('fx:sub_modification_url', `about:blank`)
    .addLink('fx:sub_token_url', `about:blank`);

  if (lastTransaction) {
    result = result.addEmbed('fx:last_transaction', composeTransaction(lastTransaction));
  }

  if (transactionTemplate) {
    result = result.addEmbed('fx:transaction_template', composeCart(transactionTemplate, items));
  }

  return result;
}
