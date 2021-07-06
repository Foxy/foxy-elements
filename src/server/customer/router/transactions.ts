import { authorize } from '../authorize';
import { composeCollection } from './composers/composeCollection';
import { composeTransaction } from './composers/composeTransaction';
import { db } from '../../DemoDatabase';
import { getPagination } from '../../getPagination';
import { router } from '../../router';

router.get('/s/customer/transactions', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const url = request.url;
  const searchParams = new URL(request.url).searchParams;
  const { limit, offset } = getPagination(url);

  const query = db.transactions.where('customer').equals(authResult);

  const [count, transactions] = await Promise.all([
    db.customerAttributes.count(),
    query.offset(offset).limit(limit).toArray(),
  ]);

  const embeddedItemsByTransaction = await Promise.all(
    transactions.map(async transaction => {
      if (searchParams.get('zoom')?.includes('items')) {
        return db.items.where('transaction').equals(transaction.id).limit(20).toArray();
      } else {
        return [];
      }
    })
  );

  const items = transactions.map((transaction, index) => ({
    transaction,
    items: embeddedItemsByTransaction[index],
  }));

  const composeItem = ({ transaction, items }: any) => {
    return composeTransaction(transaction, items);
  };

  const rel = 'fx:transactions';
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});
