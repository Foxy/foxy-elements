import { Dataset, Defaults, Links } from './types';
import { Router } from 'service-worker-router';

import { createCollectionGetHandler } from './createCollectionGetHandler';
import { createCollectionPostHandler } from './createCollectionPostHandler';
import { createResourceDeleteHandler } from './createResourceDeleteHandler';
import { createResourceGetHandler } from './createResourceGetHandler';
import { createResourcePatchHandler } from './createResourcePatchHandler';

export type RouterParams = {
  defaults: Defaults;
  dataset: Dataset;
  router?: Router;
  links: Links;
};

export function createRouter(params: RouterParams): Router {
  const { defaults, dataset, links, router = new Router() } = params;

  router
    .get('/:prefix/:collection/:id', createResourceGetHandler(router, dataset, links))
    .patch('/:prefix/:collection/:id', createResourcePatchHandler(router, dataset))
    .delete('/:prefix/:collection/:id', createResourceDeleteHandler(router, dataset));

  router
    .get('/:prefix/:collection', createCollectionGetHandler(router, dataset))
    .post('/:prefix/:collection', createCollectionPostHandler(router, dataset, defaults));

  return router;
}
