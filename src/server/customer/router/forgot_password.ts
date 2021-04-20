import { router } from './router';

router.post('/s/customer/forgot_password', async () => {
  // demo auth doesn't need to issue a temporary password because
  // it accepts any password on login, so this endpoint will always respond with 200 OK

  return new Response(null, { status: 200 });
});
