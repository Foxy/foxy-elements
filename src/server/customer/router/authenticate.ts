import { db, whenDbReady } from '../../DemoDatabase';

import { router } from '../../router';

const createError = (message: string) =>
  JSON.stringify({
    total: 1,
    _embedded: { 'fx:errors': [{ logref: 'unavailable', message }] },
  });

router.post('/s/customer/authenticate', async ({ request }) => {
  await whenDbReady;

  const json = await request.json();
  const customer = await db.customers.where('email').equals(json.email).first();

  // any password works (live auth always checks passwords)
  // session expiration date is set to 4 weeks (live value is anywhere between 0 and 4 weeks)
  // session token includes unsigned state (live token is a UUID)
  // JWT is always the same, payload is empty (live value includes store, customer id and email)

  let body: string;
  let status = 200;

  if (customer) {
    body = JSON.stringify({
      expires_in: 2419200,
      session_token: `${customer.id}-${Date.now() + 2419200 * 1000}`,
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    });
  } else {
    body = createError('Incorrect email and/or password.');
    status = 401;
  }

  return new Response(body, { status });
});

router.delete('/s/customer/authenticate', async () => {
  // demo auth doesn't store sessions, so this
  // endpoint will always return 200 OK

  return new Response(null, { status: 200 });
});
