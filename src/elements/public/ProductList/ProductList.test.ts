import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ProductList } from './ProductList';
import { collectionsHref, createServer, product, productsHref } from './fixtures';

describe('ProductList', () => {
  beforeEach(() => localStorage.clear());

  async function render(server = createServer(), random = () => 0.5): Promise<ProductList> {
    const element = await fixture<ProductList>(html`
      <foxy-product-list
        product-collections=${collectionsHref}
        currency-code="USD"
        href=${productsHref}
        lang="en"
        .random=${random}
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

  it('counts products, variants and templates in one line', async () => {
    const element = await render();
    const summary = element.renderRoot.querySelector('[data-testid="summary"]')!;
    expect(text(summary)).to.equal('product_count · variant_count · template_count');
    expect(element.renderRoot.querySelector('[data-testid="fact"]')).to.not.exist;
  });

  it('leaves out the counts that are zero', async () => {
    const element = await render(createServer([product(7, { definition: { name: 'A' } })]));
    const summary = element.renderRoot.querySelector('[data-testid="summary"]')!;
    expect(text(summary)).to.equal('product_count');
  });

  it('says how many rows a filter leaves, with a way to clear every filter', async () => {
    const element = await render();
    element.query = 'camp';
    element.typeFilter = 'standalone';
    await element.updateComplete;

    const summary = element.renderRoot.querySelector('[data-testid="summary"]')!;
    expect(text(summary)).to.equal('showing clear_filters');

    summary.querySelector<HTMLElement>('[data-testid="clear-filters"]')!.click();
    await element.updateComplete;
    expect(rows(element)).to.have.length(5);
    expect(element.query).to.equal('');
    expect(element.typeFilter).to.equal('all');
  });

  it('shows a fact with a link to its source in about 1 load in 100', async () => {
    // The first number decides whether a fact shows, the second which one.
    const numbers = [0.0099, 0.9999];
    const element = await render(createServer(), () => numbers.shift()!);
    const fact = element.renderRoot.querySelector('[data-testid="fact"]')!;
    const link = fact.querySelector('a')!;

    expect(text(fact)).to.equal('fact_first_web_sale Wikipedia');
    expect(link.href).to.equal('https://en.wikipedia.org/wiki/Online_shopping');
    expect(link.target).to.equal('_blank');
    expect(link.rel).to.equal('noopener noreferrer');
    expect(element.renderRoot.querySelector('[data-testid="summary"]')).to.not.exist;
  });

  it('shows no fact when the number is 0.01 or more', async () => {
    const element = await render(createServer(), () => 0.01);
    expect(element.renderRoot.querySelector('[data-testid="fact"]')).to.not.exist;
  });

  it('shows the animated logo, labelled, while the products load', async () => {
    const element = await fixture<ProductList>(html`
      <foxy-product-list href=${productsHref} @fetch=${(evt: Event) => evt.preventDefault()}>
      </foxy-product-list>
    `);
    await element.updateComplete;
    const status = element.renderRoot.querySelector('[data-testid="status"]')!;
    expect(status.getAttribute('role')).to.equal('status');
    expect(status.getAttribute('aria-label')).to.equal('loading');
    expect(status.querySelector('svg')).to.exist;
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

  it('leaves the name of a product without one blank', async () => {
    const element = await render();
    const template = rows(element)[4];
    expect(text(cell(template, 'name'))).to.equal('');
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
      'stock_template',
    ]);
    const colors = stock
      .slice(0, 4)
      .map(s => getComputedStyle(s.querySelector('.dot')!).backgroundColor);
    expect(new Set(colors).size).to.equal(3);
    colors.forEach(color => expect(color).to.not.equal('rgba(0, 0, 0, 0)'));
  });

  it("words a template's stock as what its products start with, without a stock colour", async () => {
    const server = createServer();
    server.products.push(product(45, { sku: 'TPL-CLASS', product_type: 'template' }));
    const element = await render(server);
    const [without, withStock] = rows(element).slice(-2);

    expect(text(cell(withStock, 'stock'))).to.equal('stock_template');
    expect(text(cell(without, 'stock'))).to.equal('stock_template_none');
    expect(withStock.querySelector('.dot')).to.not.exist;
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

  it('sorts by the column whose heading is pressed, then the other way', async () => {
    const element = await render();
    const byName = rows(element).map(row => row.dataset.sku);
    const press = async (column: string) => {
      element.renderRoot.querySelector<HTMLElement>(`[data-testid="sort-${column}"]`)!.click();
      await element.updateComplete;
    };
    const heading = (column: string) =>
      element.renderRoot.querySelector(`[data-testid="sort-${column}"]`)!.parentElement!;

    expect(heading('name').getAttribute('aria-sort')).to.equal('ascending');

    await press('name');
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal([...byName].reverse());
    expect(heading('name').getAttribute('aria-sort')).to.equal('descending');

    // The template has no price, so it stays last both ways.
    await press('price');
    expect(rows(element)[0].dataset.sku).to.equal('GIFT-WRAP');
    expect(rows(element)[4].dataset.sku).to.equal('TPL-COFFEE-340');
    expect(heading('name').getAttribute('aria-sort')).to.equal('none');

    await press('price');
    expect(rows(element)[0].dataset.sku).to.equal('TEE-ORG');
    expect(rows(element)[4].dataset.sku).to.equal('TPL-COFFEE-340');
  });

  it('limits the rows to one type', async () => {
    const element = await render();
    const filter = element.renderRoot.querySelector<HTMLSelectElement>(
      '[data-testid="type-filter"]'
    )!;
    const choose = async (type: string) => {
      filter.value = type;
      filter.dispatchEvent(new Event('change'));
      await element.updateComplete;
    };

    await choose('parent');
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['TEE-ORG']);

    await choose('template');
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['TPL-COFFEE-340']);

    await choose('standalone');
    expect(rows(element)).to.have.length(3);
  });

  it('limits the rows to a collection and its sub-collections, or to no collection', async () => {
    const element = await render();
    const filter = element.renderRoot.querySelector<HTMLSelectElement>(
      '[data-testid="collection-filter"]'
    )!;
    const choose = async (value: string) => {
      filter.value = value;
      filter.dispatchEvent(new Event('change'));
      await element.updateComplete;
    };

    // In tree order, each under its parent, whatever order the API gave them in.
    expect(Array.from(filter.options).map(option => option.value)).to.deep.equal([
      '',
      '18',
      '19',
      '17',
      '21',
      '25',
      '20',
      'none',
    ]);
    expect(filter.options[5].textContent).to.match(/^\s*\u00A0{6}Colombia\s*$/);

    // Coffee holds nothing itself; the Huila is two levels down.
    await choose('17');
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['COF-COL-HUILA-340']);

    await choose('19');
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['TEE-ORG']);

    await choose('none');
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal([
      'GIFT-WRAP',
      'TPL-COFFEE-340',
    ]);
  });

  it('limits the rows to the products that use a template', async () => {
    const element = await render();
    const filter = element.renderRoot.querySelector<HTMLSelectElement>(
      '[data-testid="template-filter"]'
    )!;
    expect(Array.from(filter.options).map(text)).to.deep.equal([
      'template_filter_all',
      'TPL-COFFEE-340',
    ]);

    filter.value = '44';
    filter.dispatchEvent(new Event('change'));
    await element.updateComplete;
    expect(rows(element).map(row => row.dataset.sku)).to.deep.equal(['COF-COL-HUILA-340']);
  });

  it('offers no collection or template choices to a store with neither', async () => {
    const server = createServer([product(7, { definition: { name: 'A' } })]);
    server.collections = [];
    const element = await render(server);
    ['collection-filter', 'template-filter', 'columns'].forEach(id => {
      expect(element.renderRoot.querySelector(`[data-testid="${id}"]`)).to.not.exist;
    });
  });

  it('shows the Collection and Template columns when chosen, and remembers the choice', async () => {
    const element = await render();
    const head = () =>
      Array.from(element.renderRoot.querySelectorAll('[role="columnheader"]')).map(text);
    expect(head()).to.have.length(5);

    const box = (column: string) =>
      element.renderRoot.querySelector<HTMLInputElement>(`[data-testid="column-${column}"]`)!;
    for (const column of ['template', 'collection']) {
      box(column).checked = true;
      box(column).dispatchEvent(new Event('change'));
      await element.updateComplete;
    }

    expect(head()).to.deep.equal([
      'column_name ↑',
      'column_sku',
      'column_type',
      'column_collection',
      'column_template',
      'column_price',
      'column_stock',
    ]);
    const huila = rows(element)[0];
    expect(text(cell(huila, 'collection'))).to.equal('Coffee › Single Origin › Colombia');
    expect(text(cell(huila, 'template'))).to.equal('TPL-COFFEE-340');
    expect(text(cell(rows(element)[2], 'collection'))).to.equal('—');
    expect(huila.scrollWidth).to.be.at.most(huila.clientWidth);

    const again = await render();
    expect(again.extraColumns).to.deep.equal(['collection', 'template']);
    expect(again.renderRoot.querySelector('[data-testid="head-collection"]')).to.exist;
  });

  it('keeps the columns for the visit when the browser refuses to store them', async () => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('denied');
    };
    try {
      const element = await render();
      const box = element.renderRoot.querySelector<HTMLInputElement>(
        '[data-testid="column-collection"]'
      )!;
      box.checked = true;
      box.dispatchEvent(new Event('change'));
      await element.updateComplete;
      expect(element.renderRoot.querySelector('[data-testid="head-collection"]')).to.exist;
    } finally {
      Storage.prototype.setItem = setItem;
    }
  });

  it('loads a store with more products than one page holds', async () => {
    const many = Array.from({ length: 230 }, (_, i) =>
      product(i + 1, { definition: { name: `Product ${i + 1}` } })
    );
    const server = createServer(many);
    const element = await render(server);
    expect(rows(element)).to.have.length(230);
    expect(server.requests.filter(request => request.url.includes('/products'))).to.have.length(2);
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
