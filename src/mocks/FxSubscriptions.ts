import { subscription } from './FxSubscription';

export const subscriptions = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/subscriptions',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/stores/8/subscriptions?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/stores/8/subscriptions?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/stores/8/subscriptions?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/stores/8/subscriptions?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:subscriptions': new Array(20).fill(subscription),
  },
  total_items: 345,
  returned_items: 20,
  limit: 20,
  offset: 0,
};
