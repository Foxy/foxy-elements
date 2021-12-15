import { HandlerContext, Router } from 'service-worker-router';

import { Dataset } from './types';

export function createResourceDeleteHandler(router: Router, dataset: Dataset) {
  return async ({ params, url }: HandlerContext): Promise<Response> => {
    const response = await router.handleRequest(new Request(url.toString()))?.handlerPromise;
    const index = dataset[params.collection]?.findIndex(document => document.id == params.id) ?? -1;
    if (index > -1) dataset[params.collection].splice(index, 1);

    return response;
  };
}
