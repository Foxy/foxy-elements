import { FxBookmark } from '../types/hapi';

export const bookmark: FxBookmark = {
  _links: {
    'curies': [
      {
        name: 'fx',
        href: 'https://api.foxycart.com/rels/{rel}',
        templated: true,
      },
    ],
    'self': {
      href: 'https://api.foxy.test/',
      title: 'Your API starting point.',
    },
    'fx:property_helpers': {
      href: 'https://api.foxy.test/property_helpers',
      title: 'Various helpers used for determining valid property values.',
    },
    'fx:reporting': {
      href: 'https://api.foxy.test/reporting',
      title: 'The Reporting API Home.',
    },
    'fx:encode': {
      href: 'https://api.foxy.test/encode',
      title: 'POST here to encode a body of html for use with our HMAC cart encryption.',
    },
    'fx:user': {
      href: 'https://api.foxy.test/users/2',
      title: 'Your API home page.',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/8',
      title: 'The current store for your authentication token',
    },
    'fx:stores': {
      href: 'https://api.foxy.test/users/2/stores',
      title: 'Your stores',
    },
    'fx:token': {
      href: 'https://api.foxy.test/token',
      title: 'The OAuth endpoint for obtaining a new access_token using an existing refresh_token.',
      type: 'application/json',
    },
  },
  message: 'Welcome to the FoxyCart API!',
};
