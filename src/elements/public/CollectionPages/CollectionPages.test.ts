import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { CollectionPages } from './CollectionPages';

class TestPageElement extends HTMLElement {
  form = {
    _links: {
      next: {
        href: 'https://demo.foxycart.test/s/admin/customers/0/attributes?offset=20',
      },
    },
  };
}

customElements.define('test-page-element', TestPageElement);

describe('CollectionPages', () => {
  it('renders nothing by default', async () => {
    const template = html`<foxy-collection-pages></foxy-collection-pages>`;
    const element = await fixture<CollectionPages>(template);

    expect(element.children).to.be.empty;
    expect(element).to.have.property('first', '');
    expect(element).to.have.property('item', 'foxy-null');
    expect(element).to.have.property('page', 'foxy-collection-page');
    expect(element).to.have.property('lang', '');
  });

  it('renders first page when its url is set', async () => {
    const first = 'https://demo.foxycart.test/s/admin/customers/0/attributes';
    const template = html`<foxy-collection-pages first=${first}></foxy-collection-pages>`;
    const element = await fixture<CollectionPages>(template);

    expect(element.children[0].outerHTML).to.equal(
      `<foxy-collection-page href="${first}" item="foxy-null" lang=""></foxy-collection-page>`
    );

    expect(element).to.have.property('first', first);
    expect(element).to.have.property('item', 'foxy-null');
    expect(element).to.have.property('page', 'foxy-collection-page');
    expect(element).to.have.property('lang', '');
  });

  it('passes custom item and lang props down to children', async () => {
    const first = 'https://demo.foxycart.test/s/admin/customers/0/attributes';
    const item = 'test-item-element';
    const page = 'test-page-element';
    const lang = 'ru';
    const element = await fixture<CollectionPages>(html`
      <foxy-collection-pages first=${first} item=${item} page=${page} lang=${lang}>
      </foxy-collection-pages>
    `);

    expect(element.children[0].outerHTML).to.equal(
      `<${page} href="${first}" item="${item}" lang="${lang}"></${page}>`
    );

    expect(element).to.have.property('first', first);
    expect(element).to.have.property('item', item);
    expect(element).to.have.property('page', page);
    expect(element).to.have.property('lang', lang);
  });

  it("renders next page if there's a next rel in the last page's form", async () => {
    const page = 'test-page-element';
    const next = 'https://demo.foxycart.test/s/admin/customers/0/attributes?offset=20';
    const first = 'https://demo.foxycart.test/s/admin/customers/0/attributes';
    const element = await fixture<CollectionPages>(html`
      <foxy-collection-pages first=${first} page=${page}></foxy-collection-pages>
    `);

    expect(element).to.have.property('first', first);
    expect(element).to.have.property('item', 'foxy-null');
    expect(element).to.have.property('page', page);
    expect(element).to.have.property('lang', '');
    expect(element.children[0].outerHTML).to.equal(
      `<${page} href="${first}" item="foxy-null" lang=""></${page}>`
    );

    await new Promise(r => setTimeout(r, 1000));
    await element.updateComplete;

    expect(element.children[1].outerHTML).to.equal(
      `<${page} href="${next}" item="foxy-null" lang=""></${page}>`
    );
  });
});
