import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ProductList } from './ProductList';
import { createServer, product, productsHref } from './fixtures';

describe('ProductList', () => {
  async function render(server = createServer()): Promise<ProductList> {
    const element = await fixture<ProductList>(html`
      <foxy-product-list
        currency-code="USD"
        href=${productsHref}
        lang="en"
        .getProductPageHref=${(href: string) => `/products/${href.split('/').pop()}`}
        @fetch=${server.handle}
      >
      </foxy-product-list>
    `);
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    await element.updateComplete;
    return element;
  }

  const rows = (element: ProductList) =>
    Array.from(element.renderRoot.querySelectorAll<HTMLElement>('[data-testid="row"]'));
  const cell = (row: HTMLElement, id: string) =>
    row.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
  const text = (node: Element) => node.textContent!.replace(/\s+/g, ' ').trim();

  it('registers as foxy-product-list, a NucleonElement with the product-list namespace', () => {
    expect(customElements.get('foxy-product-list')).to.equal(ProductList);
    expect(new ProductList()).to.be.instanceOf(NucleonElement);
    expect(ProductList.defaultNS).to.equal('product-list');
  });

  it('lists products in the order of the names shown, without rows for variants', async () => {
    const element = await render();
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal([
      'COF-COL-HUILA-340',
      'MUG-ENAMEL-12',
      'GIFT-WRAP',
      'TEE-ORG',
      'TPL-COFFEE-340',
    ]);
  });

  it('says how many variants are counted in their products', async () => {
    const element = await render();
    const summary = element.renderRoot.querySelector('[data-testid="summary"]')!;
    expect(text(summary)).to.equal('summary summary_variants');
  });

  it('links each row to the product page', async () => {
    const element = await render();
    expect(rows(element)[3].getAttribute('href')).to.equal('/products/34');
  });

  it('shows a parent as a price range and a standalone price with trailing zeros', async () => {
    const element = await render();
    expect(text(cell(rows(element)[3], 'price'))).to.equal('$24.95 – $27.45');
    expect(text(cell(rows(element)[1], 'price'))).to.equal('$16.40');
    expect(text(cell(rows(element)[4], 'price'))).to.equal('—');
  });

  it('shows the whole SKU', async () => {
    const sku = 'COF-ETH-YIRGACHEFFE-KOCHERE-WASHED-340G-WHOLE-BEAN-2026-HARVEST';
    const element = await render(createServer([product(7, { sku, definition: { name: 'A' } })]));
    const sku_cell = cell(rows(element)[0], 'sku');
    expect(text(sku_cell)).to.equal(sku);
    expect(sku_cell.scrollWidth).to.be.at.most(sku_cell.clientWidth);
  });

  it('shows the SKU once for a product without a name', async () => {
    const element = await render();
    const template = rows(element)[4];
    expect(text(cell(template, 'name'))).to.equal('unnamed');
    expect(template.textContent!.split('TPL-COFFEE-340')).to.have.length(2);
  });

  it('says a product with variants is a parent, with their count', async () => {
    const element = await render();
    expect(text(cell(rows(element)[3], 'type'))).to.equal('type_parent · variant_count');
    expect(text(cell(rows(element)[1], 'type'))).to.equal('type_standalone');
  });

  it('gives each stock state a colour and words', async () => {
    const element = await render();
    const stock = rows(element).map(row => cell(row, 'stock'));
    expect(stock.map(s => s.dataset.state)).to.deep.equal([
      'out_of_stock',
      'low_stock',
      'untracked',
      'low_stock',
      'untracked',
    ]);
    expect(stock.map(text)).to.deep.equal([
      'stock_out_of_stock',
      'stock_low',
      'stock_untracked',
      'stock_in · stock_out_count · stock_low_count',
      'stock_untracked',
    ]);
    const colors = stock.map(s => getComputedStyle(s.querySelector('.dot')!).backgroundColor);
    expect(new Set(colors).size).to.equal(3);
    colors.forEach(color => expect(color).to.not.equal('rgba(0, 0, 0, 0)'));
  });

  it('uses the low-stock number it is given', async () => {
    const element = await render();
    element.lowStockThreshold = 2;
    await element.updateComplete;
    expect(cell(rows(element)[1], 'stock').dataset.state).to.equal('in_stock');
  });

  it('marks a hidden product rather than leaving it out', async () => {
    const element = await render();
    expect(cell(rows(element)[0], 'hidden')).to.exist;
    expect(rows(element)[1].querySelector('[data-testid="hidden"]')).to.not.exist;
  });

  it("searches names, SKUs and variants' SKUs", async () => {
    const element = await render();
    const search = element.renderRoot.querySelector<HTMLInputElement>('[data-testid="search"]')!;

    search.value = 'camp';
    search.dispatchEvent(new Event('input'));
    await element.updateComplete;
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['MUG-ENAMEL-12']);

    search.value = 'TEE-ORG-M';
    search.dispatchEvent(new Event('input'));
    await element.updateComplete;
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['TEE-ORG']);

    search.value = 'nothing like this';
    search.dispatchEvent(new Event('input'));
    await element.updateComplete;
    expect(rows(element)).to.have.length(0);
    expect(text(element.renderRoot.querySelector('[data-testid="status"]')!)).to.equal(
      'no_matches'
    );
  });

  it('loads a store with more products than one page holds', async () => {
    const many = Array.from({ length: 230 }, (_, i) =>
      product(i + 1, { definition: { name: `Product ${i + 1}` } })
    );
    const server = createServer(many);
    const element = await render(server);
    expect(rows(element)).to.have.length(230);
    expect(server.requests).to.have.length(2);
  });

  it('says so when the products fail to load', async () => {
    const element = await fixture<ProductList>(html`
      <foxy-product-list
        href=${productsHref}
        @fetch=${(evt: any) => {
          evt.preventDefault();
          evt.respondWith(Promise.resolve(new Response('{}', { status: 500 })));
        }}
      >
      </foxy-product-list>
    `);
    await waitUntil(() => element.in('fail'));
    await element.updateComplete;
    const status = element.renderRoot.querySelector('[data-testid="status"]')!;
    expect(text(status)).to.equal('error');
    expect(status.getAttribute('role')).to.equal('alert');
  });
});
