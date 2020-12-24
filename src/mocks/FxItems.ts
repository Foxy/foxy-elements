import { item } from './FxItem';

export const items = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/subscriptions/123/items',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/subscriptions/123/items?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/subscriptions/123/items?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/subscriptions/123/items?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/subscriptions/123/items?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:items': new Array(5).fill(item),
  },
  total_items: 5,
  returned_items: 5,
  limit: 5,
  offset: 0,
};
