import halson from 'halson';
import { router } from '../router';

router.get('/s/virtual/session', async ({ request }) => {
  const url = new URL(request.url);
  const body = halson({});
  let status: number;

  if (url.searchParams.has('code')) {
    status = 401;

    const error = {
      message: `Failed to sign in with code "${url.searchParams.get('code')}".`,
      logref: `id-${Date.now()}`,
      code: url.searchParams.get('code'),
    };

    body.total = 1;
    body.addEmbed('fx:errors', [error]);
  } else {
    status = 200;

    const credential = {
      email: 'sally.sims@example.com',
      password: '3i74uylOIUB&*21?',
      new_password: new URL(request.url).searchParams.has('new-password') ? '' : undefined,
    };

    body.type = 'password';
    body.credential = credential;
    body.addLink('self', request.url);
  }

  return new Response(JSON.stringify(body), { status });
});

router.post('/s/virtual/session', async ({ request }) => {
  return router.handleRequest(new Request(request.url))!.handlerPromise;
});

router.delete('/s/virtual/session', async () => new Response());
