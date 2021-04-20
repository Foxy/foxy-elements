import { authorize } from '../authorize';
import { composeDefaultPaymentMethod } from './composers/composeDefaultPaymentMethod';
import { db } from '../../DemoDatabase';
import { router } from './router';

router.get('/s/customer/default_payment_method', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = authResult;
  const doc = await db.paymentMethods.where('customer').equals(id).first();
  const body = composeDefaultPaymentMethod(doc);

  return new Response(JSON.stringify(body));
});
