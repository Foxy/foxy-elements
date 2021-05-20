import { FetchEvent } from '../src/elements/public/NucleonElement/FetchEvent.ts';
import customElements from '../custom-elements.json';
import { router } from '../src/server/index.ts';
import { setCustomElements } from '@web/storybook-prebuilt/web-components';

// Remove attribute docs because they aren't analyzed correctly
customElements.tags.forEach(tag => (tag.attributes = []));
setCustomElements(customElements);

addEventListener('fetch', evt => {
  if (evt instanceof FetchEvent && !evt.defaultPrevented) {
    evt.preventDefault();

    if (evt.request.url.startsWith('foxy://i18n/') && evt.request.method === 'GET') {
      const [ns, lang] = evt.request.url.substr(12).split('/');
      evt.respondWith(fetch(`/translations/${ns}/${lang}.json`));
    } else {
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
  }
});

export const parameters = {
  backgrounds: { disable: true },
};
