import './customer_address';
import './customer_addresses';
import './default_payment_method';
import './subscription';
import './subscriptions';
import './transactions';
import './authenticate';
import './forgot_password';

import { authorize } from '../authorize';
import { composeCustomer } from './composers/composeCustomer';
import { db } from '../../DemoDatabase';
import { router } from './router';

router.get('/s/customer', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = authResult;
  const body = composeCustomer(
    await db.customers.get(id),
    await db.customerAttributes.where('customer').equals(id).limit(20).toArray()
  );

  return new Response(JSON.stringify(body));
});

router.patch('/s/customer', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = authResult;
  await db.customers.update(id, await request.json());
  const body = composeCustomer(await db.customers.get(id));

  return new Response(JSON.stringify(body));
});

// special routes

router.get('/s/customer/not-found', async () => new Response(null, { status: 404 }));
router.get('/s/customer/sleep', () => new Promise(() => void 0));
router.all('*', async () => new Response(null, { status: 500 }));

export { router };
