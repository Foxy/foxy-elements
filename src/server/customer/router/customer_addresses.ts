import { authorize } from '../authorize';
import { composeCollection } from './composers/composeCollection';
import { composeCustomerAddress } from './composers/composeCustomerAddress';
import { db } from '../../DemoDatabase';
import { getPagination } from '../../getPagination';
import { router } from './router';

router.get('/s/customer/addresses', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const id = authResult;
  const url = request.url;
  const { limit, offset } = getPagination(url);

  const [count, items] = await Promise.all([
    db.customerAddresses.count(),
    db.customerAddresses.where('customer').equals(id).offset(offset).limit(limit).toArray(),
  ]);

  const rel = 'fx:customer_addresses';
  const composeItem = composeCustomerAddress;
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});
