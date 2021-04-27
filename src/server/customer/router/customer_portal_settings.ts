import { authorize } from '../authorize';
import { composeCustomerPortalSettings } from './composers/composeCustomerPortalSettings';
import { db } from '../../DemoDatabase';
import { router } from './router';

router.get('/s/customer/customer_portal_settings', async ({ request }) => {
  const authResult = await authorize(request);
  if (typeof authResult !== 'number') return authResult;

  const body = composeCustomerPortalSettings(await db.customerPortalSettings.get(0));
  return new Response(JSON.stringify(body));
});
