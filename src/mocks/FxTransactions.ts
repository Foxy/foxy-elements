export const transactions = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/transactions',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/stores/8/transactions?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:transactions': [],
  },
  total_items: 2345,
  returned_items: 0,
  limit: 20,
  offset: 0,
};
