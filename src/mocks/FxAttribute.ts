export const attribute = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/store_attributes/1002',
      title: 'This store attribute',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/66',
      title: 'This Store',
    },
  },
  visibility: 'private',
  name: 'Hours',
  value: '9am to 5pm',
  date_created: '2013-08-05T14:15:59-0700',
  date_modified: '2013-08-05T14:15:59-0700',
};
