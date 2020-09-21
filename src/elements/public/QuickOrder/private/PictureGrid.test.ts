import { expect, fixture, html } from '@open-wc/testing';
import { PictureGrid } from './PictureGrid';

interface ItemElement extends HTMLElement {
  empty: boolean;
  data: unknown;
}

customElements.define('x-grid', PictureGrid);

describe('Preview', () => {
  describe('PictureGrid', () => {
    [0, 1, 2, 3, 4, 99, 999].forEach(count => {
      it(`renders ${count} items`, async () => {
        const data = new Array(count).fill(0).map((_, i) => ({ i }));
        const grid = await fixture(html`<x-grid .data=${data}></x-grid>`);
        const items = [...grid.shadowRoot!.querySelectorAll<ItemElement>('[data-tag-name=x-item]')];

        expect(items).to.have.length(Math.min(count, 4));

        if (count >= 1) expect(items[0]).to.have.deep.property('data', data[0]);
        if (count >= 2) expect(items[1]).to.have.deep.property('data', data[1]);
        if (count >= 3) expect(items[2]).to.have.deep.property('data', data[2]);
        if (count >= 4) expect(items[3]).to.have.deep.property('data', data[3]);
      });
    });

    it('propagates .empty value to child items', async () => {
      const data = new Array(99).fill(0).map((_, i) => ({ i }));
      const grid = await fixture(html`<x-grid .data=${data} .empty=${true}></x-grid>`);
      const items = [...grid.shadowRoot!.querySelectorAll<ItemElement>('[data-tag-name=x-item]')];

      items.forEach(item => expect(item).to.have.property('empty', true));
    });
  });
});
