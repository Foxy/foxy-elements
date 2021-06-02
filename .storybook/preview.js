import { API } from '@foxy.io/sdk/customer';
import { FetchEvent } from '../src/elements/public/NucleonElement/FetchEvent.ts';
import customElements from '../custom-elements.json';
import { router } from '../src/server/index.ts';
import { setCustomElements } from '@web/storybook-prebuilt/web-components';

// Remove attribute docs because they aren't analyzed correctly
customElements.tags.forEach(tag => (tag.attributes = []));
setCustomElements(customElements);

addEventListener('fetch', async evt => {
  if (evt instanceof FetchEvent && !evt.defaultPrevented) {
    evt.preventDefault();

    if (evt.request.url.startsWith('foxy://i18n/')) {
      if (evt.request.method === 'GET') {
        const [ns, lang] = evt.request.url.substr(12).split('/');
        return evt.respondWith(fetch(`/translations/${ns}/${lang}.json`));
      }
    }

    let response = null;

    if (evt.request.url.startsWith('foxy://customer-api/session')) {
      const url = 'https://demo.foxycart.com/s/customer/authenticate';

      if (evt.request.method === 'POST') {
        const { type, credential } = await evt.request.json();
        const request = new Request(url, { method: 'POST', body: JSON.stringify(credential) });
        const apiResponse = await router.handleRequest(request).handlerPromise;
        const apiToken = (await apiResponse.clone().json()).session_token;

        localStorage.setItem(API.SESSION, apiToken);
        response = new Response(
          JSON.stringify({
            _links: { self: { href: evt.request.url } },
            credential,
            type,
          })
        );
      }

      if (evt.request.method === 'DELETE') {
        const request = new Request(url, { method: 'DELETE' });
        response = await router.handleRequest(request).handlerPromise;
        localStorage.removeItem(API.SESSION);
      }
    }

    if (evt.request.url.startsWith('https://demo.foxycart.com/s/customer')) {
      const token = localStorage.getItem(API.SESSION);
      if (token) evt.request.headers.set('Authorization', `Bearer ${token}`);
    }

    if (!response) response = await router.handleRequest(evt.request).handlerPromise;

    console.debug(
      `%c@foxy.io/elements::server\n%c${response.status}%c ${evt.request.method} ${evt.request.url}`,
      'color: gray',
      `background: ${
        response.ok ? 'green' : 'red'
      }; padding: 0 .2em; border-radius: .2em; color: white;`,
      ''
    );

    evt.respondWith(new Promise(resolve => setTimeout(() => resolve(response), 1000)));
  }
});

export const parameters = {
  backgrounds: { disable: true },
};
