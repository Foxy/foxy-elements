import { authorize } from '../authorize';
import { composeSubscription } from './composers/composeSubscription';
import { db } from '../../DemoDatabase';
import { router } from './router';

router.get('/s/customer/subscriptions/:id', async ({ params, request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = parseInt(params.id);
  const doc = await db.subscriptions.get(id);
  const zoom = new URL(request.url).searchParams.get('zoom') ?? '';

  const lastTransaction = zoom.includes('last_transaction')
    ? await db.transactions.where('subscription').equals(id).last()
    : undefined;

  const transactionTemplate = zoom.includes('transaction_template')
    ? await db.carts.get(doc.transaction_template)
    : undefined;

  const items = zoom.includes('items')
    ? await db.items.where('cart').equals(doc.transaction_template).limit(20).toArray()
    : undefined;

  const body = composeSubscription(doc, lastTransaction, transactionTemplate, items);
  return new Response(JSON.stringify(body));
});

router.patch('/s/customer/subscriptions/:id', async ({ params, request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  await db.subscriptions.update(parseInt(params.id), await request.json());

  const { url, headers } = request;
  return router.handleRequest(new Request(url, { headers }))!.handlerPromise;
});
