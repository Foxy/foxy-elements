/* global window */

import { configure, setCustomElements } from '@storybook/web-components';
import { endpoint, router } from '../src/server/admin';

import { FetchEvent } from '../src/elements/public/NucleonElement/FetchEvent';
import customElements from '../custom-elements.json';
import { persistHistoryStateBetweenReloads } from './utils';

const context = require.context('../src/elements/public', true, /\.stories\.mdx$/);

setCustomElements(customElements);
configure(context, module);

if (module.hot) {
  persistHistoryStateBetweenReloads({
    lastStoryKey: '@foxy.io/elements::storybook.last_story',
    lastPathKey: '@foxy.io/elements::storybook.last_path',
    refreshRate: 250,
    module,
  });

  module.hot.accept(context.id, () => location.reload());
}

addEventListener('fetch', evt => {
  if (evt instanceof FetchEvent && !evt.defaultPrevented) {
    if (evt.request.url.startsWith(endpoint)) {
      evt.preventDefault();
      evt.respondWith(
        router.handleRequest(evt.request).handlerPromise.then(response => {
          console.debug(
            `%c@foxy.io/elements::server\n%c${response.status}%c${evt.request.method} ${evt.request.url}`,
            'color: gray',
            `background: ${
              response.ok ? 'green' : 'red'
            }; padding: 0 .2em; border-radius: .2em; color: white;`
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
