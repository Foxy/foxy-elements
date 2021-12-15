import { HandlerContext, Router } from 'service-worker-router';

import { Dataset } from './types';

export function createResourcePatchHandler(router: Router, dataset: Dataset) {
  return async ({ request, params, url }: HandlerContext): Promise<Response> => {
    const document = dataset[params.collection]?.find(document => document.id == params.id);
    if (!document) return new Response('Not found', { status: 404 });

    const requestBody = (await request?.json()) ?? {};
    delete requestBody._embedded;
    delete requestBody._links;

    Object.assign(document, requestBody);

    return router.handleRequest(new Request(url.toString()))?.handlerPromise;
  };
}
