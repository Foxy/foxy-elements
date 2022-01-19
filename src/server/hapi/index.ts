import { Router } from 'service-worker-router';
import { createRouter as createBaseRouter } from '../router/createRouter';
import { createDataset } from './createDataset';
import { defaults } from './defaults';
import { links } from './links';

export function createRouter(): Router {
  return createBaseRouter({ dataset: createDataset(), defaults, links });
}
