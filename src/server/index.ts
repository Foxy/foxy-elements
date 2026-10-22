import { HandlerContext, Router } from 'service-worker-router';
import { createRouter as createHapiRouter } from './hapi/index';
import { createRouter as createPortalRouter } from './portal/index';
import { createRouter as createVirtualRouter } from './virtual/index';
import { createAccessDeniedResponse } from './virtual/createAccessDeniedResponse';

export function createRouter(): Router {
  const subRouters: Record<string, Router> = {
    virtual: createVirtualRouter(),
    portal: createPortalRouter(),
    hapi: createHapiRouter(),
  };

  const router: Router = new Router().all('*', async ({ url, request }: HandlerContext) => {
    if (!request) return new Response(null, { status: 404 });

    const prefix = url.pathname.split('/')[1] ?? '';

    // `/read-only/<path>` serves reads from `/<path>` and denies every write, like a token
    // with read scopes only. Elements write to their own `href`, so a resource loaded through
    // this prefix shows how a denied save looks.
    if (prefix === 'read-only') {
      const target = new URL(url.toString());
      target.pathname = url.pathname.replace(/^\/read-only/, '');

      if (request.method === 'GET' || request.method === 'HEAD') {
        const { handlerPromise } =
          router.handleRequest(
            new Request(target.toString(), { method: request.method, headers: request.headers })
          ) ?? {};
        return handlerPromise ?? new Response(null, { status: 404 });
      }

      const rel = target.pathname.split('/')[2] ?? 'resource';
      return createAccessDeniedResponse('write', rel);
    }

    const handlerPromise = subRouters[prefix]?.handleRequest(request)?.handlerPromise;

    return handlerPromise ?? new Response(null, { status: 404 });
  });

  return router;
}
