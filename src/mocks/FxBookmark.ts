import { FxBookmark } from '../types/hapi';

export const bookmark: FxBookmark = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: '/',
      title: 'Your API starting point.',
    },
    'fx:property_helpers': {
      href: '/property_helpers',
      title: 'Various helpers used for determing valid property values.',
    },
    'fx:reporting': {
      href: '/reporting',
      title: 'The Reporting API Home.',
    },
    'fx:encode': {
      href: '/encode',
      title: 'POST here to encode a body of html for use with our HMAC cart encryption.',
    },
    'fx:user': {
      href: '/users/2',
      title: 'Your API home page.',
    },
    'fx:store': {
      href: '/stores/8',
      title: 'The current store for your authentication token',
    },
    'fx:stores': {
      href: '/users/2/stores',
      title: 'Your stores',
    },
    'fx:token': {
      href: '/token',
      title: 'The OAuth endpoint for obtaining a new access_token using an existing refresh_token.',
      type: 'application/json',
    },
  },
  message: 'Welcome to the FoxyCart API!',
};
