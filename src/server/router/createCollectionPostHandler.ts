import { Dataset, Defaults } from './types';
import { HandlerContext, Router } from 'service-worker-router';

export function createCollectionPostHandler(router: Router, dataset: Dataset, defaults: Defaults) {
  return async ({ request, params, url }: HandlerContext): Promise<Response> => {
    const document = defaults[params.collection]?.(url.searchParams) ?? {};
    Object.assign(document, await request?.json());

    if (!dataset[params.collection]) dataset[params.collection] = [];
    dataset[params.collection].push(document);

    const selfLink = `${url.origin}${url.pathname}/${document.id}`;
    return router.handleRequest(new Request(selfLink))?.handlerPromise;
  };
}
