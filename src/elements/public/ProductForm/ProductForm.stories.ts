import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/products/0',
  parent: 'https://demo.api/hapi/products',
  nucleon: true,
  localName: 'foxy-product-form',
  translatable: true,
  configurable: {
    sections: [
      'timestamps',
      'header',
      'general',
      'option-values',
      'options',
      'modifiers',
      'stock',
      'cart-link-builder',
      'generate-variants',
      'tags',
      'variants',
      'advanced',
      'stock-rules',
      'events',
    ],
    buttons: ['delete', 'create', 'submit', 'undo', 'header:copy-id', 'header:copy-json'],
    inputs: [
      'general:name',
      'general:sku',
      'general:price',
      'general:description',
      'general:collection',
      'general:hidden',
      'stock:stock-level',
    ],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);
export const Parent = getStory({ ...summary, href: 'https://demo.api/hapi/products/1' });
export const Variant = getStory({ ...summary, href: 'https://demo.api/hapi/products/2' });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
