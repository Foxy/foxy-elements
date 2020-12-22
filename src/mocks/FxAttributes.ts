import { attribute } from './FxAttribute';

export const attributes = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/attributes',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/stores/8/attributes?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/stores/8/attributes?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/stores/8/attributes?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/stores/8/attributes?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:attributes': new Array(5).fill(0).map(() => attribute),
  },
  total_items: 20,
  returned_items: 5,
  limit: 5,
  offset: 0,
};
