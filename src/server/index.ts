import { HandlerContext, Router } from 'service-worker-router';
import { createRouter as createHapiRouter } from './hapi/index';
import { createRouter as createPortalRouter } from './portal/index';
import { createRouter as createVirtualRouter } from './virtual/index';

export function createRouter(): Router {
  const subRouters: Record<string, Router> = {
    virtual: createVirtualRouter(),
    portal: createPortalRouter(),
    hapi: createHapiRouter(),
  };

  return new Router().all('*', async ({ url, request }: HandlerContext) => {
    if (!request) return new Response(null, { status: 404 });

    const prefix = url.pathname.split('/')[1] ?? '';
    const handlerPromise = subRouters[prefix]?.handleRequest(request)?.handlerPromise;

    return handlerPromise ?? new Response(null, { status: 404 });
  });
}
