import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/experimental_add_to_cart_snippets/0',
  parent: 'https://demo.api/hapi/experimental_add_to_cart_snippets',
  nucleon: true,
  localName: 'foxy-experimental-add-to-cart-builder',
  translatable: true,
  configurable: {},
};

export default getMeta(summary);

const ext = `
  default-domain="foxycart.com"
  encode-helper="https://demo.api/virtual/encode"
  locale-codes="https://demo.api/hapi/property_helpers/7"
  store="https://demo.api/hapi/stores/0"
`;

export const WithData = getStory({ ...summary, ext, code: true });
export const Empty = getStory({ ...summary, ext });

Empty.args.href = '';
