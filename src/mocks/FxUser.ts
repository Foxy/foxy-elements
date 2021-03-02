import { FxUser } from '../types/hapi';

export const user: FxUser = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/users/2',
      title: 'This User',
    },
    'fx:attributes': {
      href: 'https://api.foxy.test/users/2/attributes',
      title: 'Attributes for This User',
    },
    'fx:default_store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'Default store for This User.',
    },
    'fx:stores': {
      href: 'https://api.foxy.test/users/2/stores',
      title: 'Stores for This User',
    },
  },
  _embedded: {
    'fx:attributes': [
      {
        _links: {
          curies: [
            {
              name: 'fx',
              href: 'https://api.foxycart.com/rels/{rel}',
              templated: true,
            },
          ],
          self: {
            href: 'https://api.foxy.test/user_attributes/2',
            title: 'This user attribute',
          },
          'fx:user': {
            href: 'https://api.foxy.test/users/2',
            title: 'This User',
          },
        },
        name: 'user attribute 1',
        value: 'value 1',
        visibility: 'private',
        date_created: '2011-10-05T14:28:30-0700',
        date_modified: '2011-10-05T14:28:30-0700',
      },
      {
        _links: {
          curies: [
            {
              name: 'fx',
              href: 'https://api.foxycart.com/rels/{rel}',
              templated: true,
            },
          ],
          self: {
            href: 'https://api.foxy.test/user_attributes/4',
            title: 'This user attribute',
          },
          'fx:user': {
            href: 'https://api.foxy.test/users/2',
            title: 'This User',
          },
        },
        name: 'user attribute 2',
        value: 'value 2',
        visibility: 'private',
        date_created: '2011-10-05T14:28:30-0700',
        date_modified: '2011-10-05T14:28:30-0700',
      },
      {
        _links: {
          curies: [
            {
              name: 'fx',
              href: 'https://api.foxycart.com/rels/{rel}',
              templated: true,
            },
          ],
          self: {
            href: 'https://api.foxy.test/user_attributes/28',
            title: 'This user attribute',
          },
          'fx:user': {
            href: 'https://api.foxy.test/users/2',
            title: 'This User',
          },
        },
        name: 'user attribute 3',
        value: 'value 3',
        visibility: 'private',
        date_created: '2011-10-05T14:28:30-0700',
        date_modified: '2011-10-05T14:28:30-0700',
      },
    ],
  },
  first_name: 'Jimmy',
  last_name: 'test',
  email: 'jimmy_baragau@yahoo.com',
  phone: '1111322',
  affiliate_id: 0,
  is_programmer: true,
  is_front_end_developer: false,
  is_designer: false,
  is_merchant: true,
  date_created: '2012-02-29T13:55:09-0800',
  date_modified: '2019-08-27T22:08:00-0700',
};
