import { authorize } from '../authorize';
import { composeCollection } from './composers/composeCollection';
import { composeSubscription } from './composers/composeSubscription';
import { db } from '../../DemoDatabase';
import { getPagination } from '../../getPagination';
import { router } from './router';

router.get('/s/customer/subscriptions', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const url = request.url;
  const searchParams = new URL(request.url).searchParams;
  const { limit, offset } = getPagination(url);
  const query = db.subscriptions.where('customer').equals(authResult);

  const [count, subscriptions] = await Promise.all([
    db.customerAttributes.count(),
    query.offset(offset).limit(limit).toArray(),
  ]);

  const embeddedLastTransactionBySubscription = await Promise.all(
    subscriptions.map(async subscription => {
      if (searchParams.get('zoom')?.includes('last_transaction')) {
        return db.transactions.where('subscription').equals(subscription.id).first();
      } else {
        return null;
      }
    })
  );

  const embeddedTransactionTemplateBySubscription = await Promise.all(
    subscriptions.map(async subscription => {
      if (searchParams.get('zoom')?.includes('transaction_template')) {
        return db.carts.get(subscription.transaction_template);
      } else {
        return null;
      }
    })
  );

  const embeddedItemsBySubscription = await Promise.all(
    subscriptions.map(async subscription => {
      if (searchParams.get('zoom')?.includes('items')) {
        return db.items.where('cart').equals(subscription.transaction_template).limit(20).toArray();
      } else {
        return [];
      }
    })
  );

  const items = subscriptions.map((subscription, index) => ({
    transactionTemplate: embeddedTransactionTemplateBySubscription[index],
    lastTransaction: embeddedLastTransactionBySubscription[index],
    items: embeddedItemsBySubscription[index],
    subscription,
  }));

  const composeItem = ({ subscription, items, lastTransaction, transactionTemplate }: any) => {
    return composeSubscription(subscription, lastTransaction, transactionTemplate, items);
  };

  const rel = 'fx:subscriptions';
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});
