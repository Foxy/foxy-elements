import * as AdminAPI from '../src/server/admin/index.ts';
import * as CustomerAPI from '../src/server/customer/index.ts';

import { FetchEvent } from '../src/elements/public/NucleonElement/FetchEvent.ts';
import { setCustomElements } from '@web/storybook-prebuilt/web-components';
import customElements from '../custom-elements.json';

// Remove attribute docs because they aren't analyzed correctly
customElements.tags.forEach(tag => (tag.attributes = []));
setCustomElements(customElements);

addEventListener('fetch', evt => {
  if (evt instanceof FetchEvent && !evt.defaultPrevented) {
    let router = null;

    if (evt.request.url.startsWith(AdminAPI.endpoint)) {
      router = AdminAPI.router;
    } else if (evt.request.url.startsWith(CustomerAPI.endpoint)) {
      router = CustomerAPI.router;
    }

    if (router) {
      evt.preventDefault();
      evt.respondWith(
        router.handleRequest(evt.request).handlerPromise.then(response => {
          console.debug(
            `%c@foxy.io/elements::server\n%c${response.status}%c ${evt.request.method} ${evt.request.url}`,
            'color: gray',
            `background: ${
              response.ok ? 'green' : 'red'
            }; padding: 0 .2em; border-radius: .2em; color: white;`,
            ''
          );

          return new Promise(resolve => setTimeout(() => resolve(response), 1000));
        })
      );
    }

    if (evt.request.url.startsWith('foxy://i18n/') && evt.request.method === 'GET') {
      const [ns, lang] = evt.request.url.substr(12).split('/');
      evt.preventDefault();
      evt.respondWith(fetch(`/translations/${ns}/${lang}.json`));
    }
  }
});

export const parameters = {
  backgrounds: { disable: true },
};
