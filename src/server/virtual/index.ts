import { HandlerContext, Router } from 'service-worker-router';

export function createRouter(): Router {
  const router = new Router();

  router.get('/:prefix/stall', () => new Promise(() => void 0));

  router.get('/:prefix/empty', async ({ url }: HandlerContext) => {
    const status = parseInt(url.searchParams.get('status') ?? '200');
    return new Response(null, { status });
  });

  router
    .delete('/:prefix/session', async () => new Response())
    .post('/:prefix/session', async ({ url }) => router.handle(url, 'GET')?.handlerPromise)
    .get('/:prefix/session', async ({ url }) => {
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

  router
    .delete('/:prefix/recovery', async () => new Response())
    .patch('/:prefix/recovery', async ({ request }) => {
      const json = await request.json();
      const body = {
        _links: { self: request.url },
        type: 'email',
        detail: { email: json.detail?.email ?? 'sally.sims@example.com' },
      };

      return new Response(JSON.stringify(body));
    })
    .post('/:prefix/recovery', async ({ request }) => {
      const body = await request.json();
      body._links = { self: request.url };
      return new Response(JSON.stringify(body));
    })
    .get('/:prefix/recovery', async ({ request }) => {
      return new Response(
        JSON.stringify({
          _links: { self: request.url },
          type: 'email',
          detail: { email: 'sally.sims@example.com' },
        })
      );
    });

  return router;
}
