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
    : null;

  const body = composeSubscription(doc, lastTransaction);
  return new Response(JSON.stringify(body));
});

router.patch('/s/customer/subscriptions/:id', async ({ params, request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = parseInt(params.id);
  await db.subscriptions.update(id, await request.json());

  const doc = await db.subscriptions.get(id);
  const zoom = new URL(request.url).searchParams.get('zoom') ?? '';
  const lastTransaction = zoom.includes('last_transaction')
    ? await db.transactions.where('subscription').equals(id).last()
    : null;

  const body = composeSubscription(doc, lastTransaction);
  return new Response(JSON.stringify(body));
});
