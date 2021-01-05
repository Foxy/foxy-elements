import { customer } from './FxCustomer';
import { random } from 'lodash-es';
export const customers = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/stores/8/customers/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/stores/8/customers',
      title: 'This Collection',
    },
    first: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'First Page of this Collection',
    },
    prev: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'Previous Page of this Collection',
    },
    next: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'Next Page of this Collection',
    },
    last: {
      href: 'https://api.foxy.test/stores/8/customers?offset=0',
      title: 'Last Page of this Collection',
    },
  },
  _embedded: {
    'fx:customers': new Array(19)
      .fill(0)
      .map(() => random(1000000000, 9999999999))
      .map(id => ({
        ...customer,
        id,
        _links: {
          ...customer._links,
          self: {
            ...customer._links.self,
            href: `https://api.foxy.test/customers/${id}`,
          },
        },
      })),
  },
  total_items: 19,
  returned_items: 19,
  limit: 20,
  offset: 0,
};
