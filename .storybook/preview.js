/* global window */

import { configure, setCustomElements } from '@storybook/web-components';

import { FetchEvent } from '../src/elements/public/NucleonElement/FetchEvent';
import customElements from '../custom-elements.json';
import { persistHistoryStateBetweenReloads } from './utils';
import { router, endpoint } from '../src/server/admin';

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
  if (evt instanceof FetchEvent && !evt.defaultPrevented && evt.request.url.startsWith(endpoint)) {
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
});

export const parameters = {
  backgrounds: { disable: true },
};
