import { expect, fixture, html } from '@open-wc/testing';
import { Picture } from './Picture';
import { PictureGrid } from './PictureGrid';
import { Preview } from './Preview';

customElements.define('x-preview', Preview);

describe('Preview', () => {
  it('has zero quantity by default', () => {
    expect(new Preview()).to.have.property('quantity', 0);
  });

  it('has undefined image by default', () => {
    expect(new Preview()).to.have.property('image', undefined);
  });

  it('has empty items array by default', () => {
    expect(new Preview()).to.have.deep.property('items', []);
  });

  it('renders picture when there are no child items', async () => {
    const template = html`<x-preview></x-preview>`;
    const preview = await fixture<Preview>(template);
    const picture = preview.shadowRoot!.querySelector<Picture>('[data-tag-name=x-picture]');

    expect(picture).to.be.instanceOf(Picture);
  });

  it('renders picture with custom quantity and image when there are no child items', async () => {
    const quantity = 99;
    const image = 'https://picsum.photos/320';
    const template = html`<x-preview .quantity=${quantity} .image=${image}></x-preview>`;
    const preview = await fixture<Preview>(template);
    const picture = preview.shadowRoot!.querySelector<Picture>('[data-tag-name=x-picture]');

    expect(picture).to.be.instanceOf(Picture);
    expect(picture).to.have.property('image', image);
    expect(picture).to.have.property('quantity', quantity);
  });

  it('renders grid when there are child items', async () => {
    const items = [{ image: '', quantity: 1 }];
    const template = html`<x-preview .items=${items} .quantity=${3}></x-preview>`;
    const preview = await fixture<Preview>(template);
    const grid = preview.shadowRoot!.querySelector<PictureGrid>('[data-tag-name=x-bundle-grid]');
    const data = new Array(3).fill(items);

    expect(grid).to.be.instanceOf(PictureGrid);
    expect(grid).to.have.deep.property('data', data);
    expect(grid).to.have.property('empty', false);
  });

  it('renders grid in empty state for zero quantity', async () => {
    const items = [{ image: '', quantity: 1 }];
    const template = html`<x-preview .items=${items} .quantity=${0}></x-preview>`;
    const preview = await fixture<Preview>(template);
    const grid = preview.shadowRoot!.querySelector<PictureGrid>('[data-tag-name=x-bundle-grid]');

    expect(grid).to.be.instanceOf(PictureGrid);
    expect(grid).to.have.deep.property('data', [items]);
    expect(grid).to.have.property('empty', true);
  });
});
