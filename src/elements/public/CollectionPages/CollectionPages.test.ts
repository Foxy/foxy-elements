import './index';

import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';

import { CollectionPages } from './CollectionPages';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { PageRenderer } from './types';
import { createRouter } from '../../../server/hapi';

const router = createRouter();

describe('CollectionPages', () => {
  it('renders empty state by default', async () => {
    const template = html`<foxy-collection-pages></foxy-collection-pages>`;
    const element = await fixture<CollectionPages<any>>(template);

    expect(element).to.have.property('group', '');
    expect(element).to.have.property('first', '');
    expect(element).to.have.property('page', 'foxy-collection-page foxy-null');
    expect(element).to.have.property('lang', '');

    const firstChild = element.children[0];

    expect(firstChild).to.have.property('localName', 'foxy-collection-page');
    expect(firstChild).to.have.attribute('group', '');
    expect(firstChild).to.have.attribute('href', '');
    expect(firstChild).to.have.attribute('lang', '');
    expect(firstChild).to.have.attribute('item', 'foxy-null');
  });

  it('renders loading state while loading pages', async () => {
    const first = 'https://demo.api/virtual/stall';
    const element = await fixture<CollectionPages<any>>(html`
      <foxy-collection-pages
        first=${first}
        @fetch=${(evt: FetchEvent) => evt.respondWith(new Promise(() => void 0))}
      >
      </foxy-collection-pages>
    `);

    expect(element).to.have.property('group', '');
    expect(element).to.have.property('first', first);
    expect(element).to.have.property('page', 'foxy-collection-page foxy-null');
    expect(element).to.have.property('lang', '');

    const firstChild = element.children[0];

    expect(firstChild).to.have.property('localName', 'foxy-collection-page');
    expect(firstChild).to.have.attribute('group', '');
    expect(firstChild).to.have.attribute('href', 'foxy://collection-pages/stall');
    expect(firstChild).to.have.attribute('lang', '');
    expect(firstChild).to.have.attribute('item', 'foxy-null');
  });

  it('renders first page from default tag name when loaded', async () => {
    const first = 'https://demo.api/hapi/customer_attributes';
    const element = await fixture<CollectionPages<any>>(html`
      <foxy-collection-pages first=${first} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-collection-pages>
    `);

    expect(element).to.have.property('group', '');
    expect(element).to.have.property('first', first);
    expect(element).to.have.property('page', 'foxy-collection-page foxy-null');
    expect(element).to.have.property('lang', '');

    while (!element.in('idle')) await oneEvent(element, 'update');

    const firstChild = element.children[0];

    expect(firstChild).to.have.property('localName', 'foxy-collection-page');
    expect(firstChild).to.have.attribute('group', '');
    expect(firstChild).to.have.attribute('href', first);
    expect(firstChild).to.have.attribute('lang', '');
    expect(firstChild).to.have.attribute('item', 'foxy-null');
  });

  it('renders first page from custom tag name when its url is set', async () => {
    const page = 'test-page test-item';
    const first = 'https://demo.api/hapi/customer_attributes';
    const element = await fixture<CollectionPages<any>>(html`
      <foxy-collection-pages
        page=${page}
        first=${first}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-collection-pages>
    `);

    expect(element).to.have.property('group', '');
    expect(element).to.have.property('first', first);
    expect(element).to.have.property('page', page);
    expect(element).to.have.property('lang', '');

    while (!element.in('idle')) await oneEvent(element, 'update');

    const firstChild = element.children[0];

    expect(firstChild).to.have.property('localName', 'test-page');
    expect(firstChild).to.have.attribute('group', '');
    expect(firstChild).to.have.attribute('href', first);
    expect(firstChild).to.have.attribute('lang', '');
    expect(firstChild).to.have.attribute('item', 'test-item');
  });

  it('renders first page from render function when its url is set', async () => {
    const page: PageRenderer = ctx => ctx.html`
      <test-page group=${ctx.group} href=${ctx.href} lang=${ctx.lang} .data=${ctx.data}>
      </test-page>
    `;

    const first = 'https://demo.api/hapi/customer_attributes';
    const element = await fixture<CollectionPages<any>>(html`
      <foxy-collection-pages
        first=${first}
        .page=${page}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-collection-pages>
    `);

    expect(element).to.have.property('group', '');
    expect(element).to.have.property('first', first);
    expect(element).to.have.property('page', page);
    expect(element).to.have.property('lang', '');

    while (!element.in('idle')) await oneEvent(element, 'update');

    const firstChild = element.children[0];

    expect(firstChild).to.have.property('localName', 'test-page');
    expect(firstChild).to.have.attribute('group', '');
    expect(firstChild).to.have.attribute('href', first);
    expect(firstChild).to.have.attribute('lang', '');
    expect(firstChild).to.have.property('data', element.pages[0]);
  });

  it('passes custom group and lang props down to children', async () => {
    const first = 'https://demo.api/hapi/customer_attributes';
    const group = 'test-group';
    const page = 'test-page-element test-item-element';
    const lang = 'ru';

    const element = await fixture<CollectionPages<any>>(html`
      <foxy-collection-pages
        group=${group}
        first=${first}
        page=${page}
        lang=${lang}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-collection-pages>
    `);

    expect(element).to.have.property('group', group);
    expect(element).to.have.property('lang', lang);

    Array.from(element.children)
      .slice(0, -1)
      .forEach(child => {
        expect(child).to.have.attribute('group', group);
        expect(child).to.have.attribute('lang', lang);
      });
  });

  describe('failure forwarding', () => {
    const ERROR_BODY = JSON.stringify({
      total: 1,
      _embedded: {
        'fx:errors': [{ logref: 'id-1', message: 'Some error, details unavailable.' }],
      },
    });

    // Dispatches a `foxy://collection-pages/fail` request from inside the element, the
    // way a child page does, and resolves with whatever `__failRequest` answers.
    // `__handleFetchEvent` ignores events whose target is the element itself, so the
    // probe has to come from a descendant.
    const probeFailResponse = async (element: CollectionPages<any>): Promise<Response> => {
      const child = element.firstElementChild as HTMLElement;
      expect(child, 'element rendered a page to dispatch from').to.exist;

      return new Promise<Response>((resolve, reject) => {
        child.dispatchEvent(
          new FetchEvent('fetch', {
            cancelable: true,
            composed: true,
            bubbles: true,
            request: new Request('foxy://collection-pages/fail'),
            resolve,
            reject,
          })
        );
      });
    };

    const failedElement = async (): Promise<CollectionPages<any>> => {
      const element = await fixture<CollectionPages<any>>(
        html`<foxy-collection-pages></foxy-collection-pages>`
      );

      element.addEventListener('fetch', (evt: Event) => {
        const event = evt as FetchEvent;
        if (event.request.url.startsWith('foxy://')) return;
        event.respondWith(Promise.resolve(new Response(ERROR_BODY, { status: 500 })));
      });

      element.first = 'https://demo.api/hapi/customers';

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
      await element.updateComplete;

      return element;
    };

    it('forwards the recorded failure to items', async () => {
      const element = await failedElement();
      const response = await probeFailResponse(element);

      expect(response).to.have.property('status', 500);
      expect((await response.json())._embedded['fx:errors'][0].message).to.equal(
        'Some error, details unavailable.'
      );
    });

    it('clones the failure so two items can each read the body', async () => {
      const element = await failedElement();

      // A Response body is a single-use stream. Forwarding the recorded error by
      // reference lets the first item to read it lock the body for every other, so
      // this fails unless `__failRequest` clones per handout.
      const first = await probeFailResponse(element);
      const second = await probeFailResponse(element);

      const [firstJson, secondJson] = await Promise.all([first.json(), second.json()]);

      expect(firstJson._embedded['fx:errors'][0].message).to.equal(
        'Some error, details unavailable.'
      );

      expect(secondJson._embedded['fx:errors'][0].message).to.equal(
        'Some error, details unavailable.'
      );
    });

    it('falls back to a synthetic 500 when no failure has been recorded', async () => {
      const element = await fixture<CollectionPages<any>>(
        html`<foxy-collection-pages></foxy-collection-pages>`
      );

      expect(element.in('fail'), 'element has not failed').to.be.false;

      const response = await probeFailResponse(element);

      expect(response).to.have.property('status', 500);
      expect(await response.text()).to.equal('Unknown error, details unavailable.');
    });
  });

  // TODO: figure out a way to test IntersectionObserver functionality
});
