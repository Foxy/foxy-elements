import { authorize } from '../authorize';
import { composeCustomerAddress } from './composers/composeCustomerAddress';
import { db } from '../../DemoDatabase';
import { router } from '../../router';

router.get('/s/customer/addresses/:id', async ({ params, request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = parseInt(params.id);
  const body = composeCustomerAddress(await db.customerAddresses.get(id));

  return new Response(JSON.stringify(body));
});

router.patch('/s/customer/addresses/:id', async ({ params, request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = parseInt(params.id);
  await db.customerAddresses.update(id, await request.json());
  const body = composeCustomerAddress(await db.customerAddresses.get(id));

  return new Response(JSON.stringify(body));
});

router.delete('/s/customer/addresses/:id', async ({ params, request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = parseInt(params.id);
  const body = composeCustomerAddress(await db.customerAddresses.get(id));
  await db.customerAddresses.delete(id);

  return new Response(JSON.stringify(body));
});
