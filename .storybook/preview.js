import { API } from '@foxy.io/sdk/customer';
import { FetchEvent } from '../src/elements/public/NucleonElement/FetchEvent.ts';
import { createRouter } from '../src/server/index.ts';
import customElements from '../custom-elements.json';
import { setCustomElements } from '@web/storybook-prebuilt/web-components';

// Remove attribute docs because they aren't analyzed correctly
customElements.tags.forEach(tag => (tag.attributes = []));
setCustomElements(customElements);

// Set gateway names
window.customElements.whenDefined('foxy-i18n').then(() => {
  window.customElements.get('foxy-i18n').setGateways({
    values: { authorize: { name: 'Authorize.Net' } },
  });
});

const router = createRouter();

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
      const url = 'https://demo.api/portal/authenticate';

      if (evt.request.method === 'POST') {
        const { type, credential } = await evt.request.json();
        const request = new Request(url, { method: 'POST', body: JSON.stringify(credential) });
        const apiResponse = await router.handleRequest(request).handlerPromise;

        if (apiResponse.ok) {
          localStorage.setItem(API.SESSION, await apiResponse.clone().text());
          response = new Response(
            JSON.stringify({
              _links: { self: { href: evt.request.url } },
              credential,
              type,
            })
          );
        } else {
          const code = apiResponse.status === 401 ? 'invalid_credential_error' : 'unknown_error';
          const url = `https://demo.api/virtual/session?code=${code}`;
          response = await router.handleRequest(new Request(url)).handlerPromise;
        }
      }

      if (evt.request.method === 'DELETE') {
        const request = new Request(url, { method: 'DELETE' });
        response = await router.handleRequest(request).handlerPromise;
        localStorage.removeItem(API.SESSION);
      }
    }

    if (evt.request.url.startsWith('https://demo.api/portal')) {
      const session = JSON.parse(localStorage.getItem(API.SESSION));
      if (session) evt.request.headers.set('Authorization', `Bearer ${session.session_token}`);
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

    evt.respondWith(new Promise(resolve => setTimeout(() => resolve(response), 300)));
  }
});

export const parameters = {
  backgrounds: { disable: true },
};
