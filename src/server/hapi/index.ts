import { Router } from 'service-worker-router';
import { createRouter as createBaseRouter } from '../router/createRouter';
import { createGenerateVariantsHandler } from './createGenerateVariantsHandler';
import { createDataset } from './createDataset';
import { defaults } from './defaults';
import { links } from './links';

export function createRouter(): Router {
  const dataset = createDataset();
  const router = new Router();
  // Before the base routes, whose collection POST would otherwise take it.
  router.post(
    '/:prefix/products/:id/generate_variants',
    createGenerateVariantsHandler(router, dataset, defaults)
  );
  return createBaseRouter({ dataset, defaults, links, router });
}
