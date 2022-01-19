import './index';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';

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
    const first = 'https://demo.api/hapi/attributes';
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
    const first = 'https://demo.api/hapi/attributes';
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

    const first = 'https://demo.api/hapi/attributes';
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
    const first = 'https://demo.api/hapi/attributes';
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

  // TODO: figure out a way to test IntersectionObserver functionality
});
