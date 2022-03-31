import { HandlerContext, Router } from 'service-worker-router';

export function createRouter(): Router {
  const router = new Router();

  router.all('/:prefix/stall', () => new Promise(() => void 0));

  router.all('/:prefix/empty', async ({ url }: HandlerContext) => {
    const status = parseInt(url.searchParams.get('status') ?? '200');
    return new Response(null, { status });
  });

  router.post('/:prefix/session', async ({ url }) => {
    const body: Record<string, unknown> = {};
    let status: number;

    if (url.searchParams.has('code')) {
      status = 401;

      const error = {
        message: `Failed to sign in with code "${url.searchParams.get('code')}".`,
        logref: `id-${Date.now()}`,
        code: url.searchParams.get('code'),
      };

      body.total = 1;
      body._embedded = { 'fx:errors': [error] };
    } else {
      status = 200;

      const credential = {
        email: 'sally.sims@example.com',
        password: '3i74uylOIUB&*21?',
        new_password: url.searchParams.has('new-password') ? '' : undefined,
      };

      body.type = 'password';
      body.credential = credential;
      body._links = { self: url.toString() };
    }

    return new Response(JSON.stringify(body), { status });
  });

  router.delete('/:prefix/session', async () => new Response());

  router.post('/:prefix/recovery', async ({ request }) => {
    const body = await request.json();
    body._links = { self: request.url };
    return new Response(JSON.stringify(body));
  });

  return router;
}
