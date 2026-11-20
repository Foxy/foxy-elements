import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ProductInventory } from './ProductInventory';
import { createServer, product, productsHref, settingsHref } from '../ProductList/fixtures';

describe('ProductInventory', () => {
  async function render(server = createServer(), settings = true): Promise<ProductInventory> {
    const element = await fixture<ProductInventory>(html`
      <foxy-product-inventory
        product-settings=${settings ? settingsHref : ''}
        href=${productsHref}
        .getProductPageHref=${(href: string) => `/products/${href.split('/').pop()}`}
        @fetch=${server.handle}
      >
      </foxy-product-inventory>
    `);
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    await element.updateComplete;
    return element;
  }

  const $ = <T extends HTMLElement = HTMLElement>(element: ProductInventory, selector: string) =>
    element.renderRoot.querySelector<T>(selector);
  const all = (element: ProductInventory, id: string) =>
    Array.from(element.renderRoot.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`));
  const text = (node: Element | null) => node!.textContent!.replace(/\s+/g, ' ').trim();
  const input = (element: ProductInventory, sku: string) =>
    $<HTMLInputElement>(element, `[data-testid="item"][data-sku="${sku}"] input`)!;

  async function type(element: ProductInventory, sku: string, value: string) {
    const field = input(element, sku);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    await element.updateComplete;
  }

  async function click(element: ProductInventory, selector: string) {
    $(element, selector)!.click();
    await element.updateComplete;
  }

  it('registers as foxy-product-inventory, a NucleonElement', () => {
    expect(customElements.get('foxy-product-inventory')).to.equal(ProductInventory);
    expect(new ProductInventory()).to.be.instanceOf(NucleonElement);
    expect(ProductInventory.defaultNS).to.equal('product-inventory');
  });

  it('lists what holds stock under its product, without templates or untracked products', async () => {
    const element = await render();
    expect(all(element, 'group').map(g => g.dataset.sku)).to.deep.equal([
      'COF-COL-HUILA-340',
      'MUG-ENAMEL-12',
      'TEE-ORG',
    ]);
    expect(all(element, 'item').map(i => i.dataset.sku)).to.deep.equal([
      'COF-COL-HUILA-340',
      'MUG-ENAMEL-12',
      'TEE-ORG-L',
      'TEE-ORG-M',
      'TEE-ORG-S',
    ]);
    expect(input(element, 'TEE-ORG-S').value).to.equal('17');
  });

  it('labels a variant by its option values and links the product to its page', async () => {
    const element = await render();
    expect(text($(element, '[data-sku="TEE-ORG-L"] label'))).to.equal('L');
    const link = $(element, '[data-testid="group"][data-sku="TEE-ORG"] [data-testid="group-name"]');
    expect(link!.getAttribute('href')).to.equal('/products/34');
  });

  it('counts each filter and shows only what matches it', async () => {
    const element = await render();
    const count = (filter: string) =>
      text($(element, `[data-testid="filter-${filter}"] .font-semibold`));
    expect(count('all')).to.equal('5');
    expect(count('low_stock')).to.equal('2');
    expect(count('out_of_stock')).to.equal('2');
    expect(count('untracked')).to.equal('1');

    await click(element, '[data-testid="filter-low_stock"]');
    expect(all(element, 'item').map(i => i.dataset.sku)).to.deep.equal([
      'MUG-ENAMEL-12',
      'TEE-ORG-L',
    ]);

    await click(element, '[data-testid="filter-untracked"]');
    expect(all(element, 'group').map(g => g.dataset.sku)).to.deep.equal(['GIFT-WRAP']);
    expect(all(element, 'item')).to.have.length(0);
  });

  it("reads the low-stock number from the store's product settings", async () => {
    const server = createServer();
    server.settings.low_stock_threshold = 3;
    const element = await render(server);
    expect(element.lowStockThreshold).to.equal(3);
    expect($(element, '[data-sku="TEE-ORG-L"] [data-testid="state"]')!.dataset.state).to.equal(
      'in_stock'
    );
  });

  it("uses a product's own low-stock number over the store's", async () => {
    const products = [
      product(51, {
        sku: 'WHEEL-1104',
        stock_level: 7,
        definition: { name: 'Wheel Throwing', low_stock_threshold: 8 },
      }),
    ];
    const element = await render(createServer(products));
    expect($(element, '[data-testid="state"]')!.dataset.state).to.equal('low_stock');
  });

  it('saves a changed count with a PATCH of stock_level, and says so', async () => {
    const server = createServer();
    const element = await render(server);

    await type(element, 'TEE-ORG-M', '12');
    expect(element.hasChanges).to.equal(true);
    expect($(element, '[data-sku="TEE-ORG-M"] [data-testid="state"]')!.dataset.state).to.equal(
      'in_stock'
    );

    await click(element, '[data-testid="save"]');
    await waitUntil(() => !element.hasChanges);
    await element.updateComplete;

    const writes = server.requests.filter(r => r.method === 'PATCH');
    expect(writes).to.have.length(1);
    expect(writes[0].url).to.equal('https://demo.api/hapi/products/36');
    expect(writes[0].body).to.deep.equal({ stock_level: 12 });
    expect(input(element, 'TEE-ORG-M').value).to.equal('12');
    expect(text($(element, '[data-testid="message"]'))).to.equal('saved');
    expect($(element, '[data-testid="save"]')).to.not.exist;
  });

  it('saves every changed item of the product, and only those', async () => {
    const server = createServer();
    const element = await render(server);
    await type(element, 'TEE-ORG-M', '12');
    await type(element, 'TEE-ORG-S', '17');
    await type(element, 'TEE-ORG-L', '9');
    await element.save();
    const writes = server.requests.filter(r => r.method === 'PATCH');
    expect(writes.map(w => w.url.split('/').pop()).sort()).to.deep.equal(['36', '37']);
  });

  it('cancels unsaved counts', async () => {
    const server = createServer();
    const element = await render(server);
    await type(element, 'MUG-ENAMEL-12', '40');
    await click(element, '[data-testid="cancel"]');
    expect(input(element, 'MUG-ENAMEL-12').value).to.equal('3');
    expect(element.hasChanges).to.equal(false);
    expect(server.requests.filter(r => r.method === 'PATCH')).to.have.length(0);
  });

  it("refuses to edit another product while one has unsaved changes, until they're saved or cancelled", async () => {
    const server = createServer();
    const element = await render(server);
    await type(element, 'TEE-ORG-M', '12');
    await type(element, 'MUG-ENAMEL-12', '40');

    expect(text($(element, '[data-testid="blocked"] p'))).to.equal('blocked');
    expect($(element, '[data-testid="blocked"]')!.getAttribute('role')).to.equal('alert');
    expect(input(element, 'MUG-ENAMEL-12').value).to.equal('3');
    expect(input(element, 'TEE-ORG-M').value).to.equal('12');

    await click(element, '[data-testid="blocked-cancel"]');
    expect($(element, '[data-testid="blocked"]')).to.not.exist;
    expect(input(element, 'TEE-ORG-M').value).to.equal('0');

    await type(element, 'MUG-ENAMEL-12', '40');
    expect($(element, '[data-testid="blocked"]')).to.not.exist;
    expect(input(element, 'MUG-ENAMEL-12').value).to.equal('40');
  });

  it('saves the product with changes from the warning', async () => {
    const server = createServer();
    const element = await render(server);
    await type(element, 'TEE-ORG-M', '12');
    await type(element, 'MUG-ENAMEL-12', '40');
    await click(element, '[data-testid="blocked-save"]');
    await waitUntil(() => !element.hasChanges);
    await element.updateComplete;
    expect(server.requests.filter(r => r.method === 'PATCH')).to.have.length(1);
    expect($(element, '[data-testid="blocked"]')).to.not.exist;
  });

  it('refuses a count that is not a whole number, 0 or more', async () => {
    const server = createServer();
    const element = await render(server);
    for (const value of ['-1', '2.5']) {
      await type(element, 'MUG-ENAMEL-12', value);
      expect(input(element, 'MUG-ENAMEL-12').getAttribute('aria-invalid')).to.equal('true');
      expect($<HTMLButtonElement>(element, '[data-testid="save"]')!.disabled).to.equal(true);
      await element.save();
    }
    expect(server.requests.filter(r => r.method === 'PATCH')).to.have.length(0);
  });

  it('stops tracking an item whose count is emptied', async () => {
    const server = createServer();
    const element = await render(server);
    await type(element, 'MUG-ENAMEL-12', '');
    await element.save();
    const writes = server.requests.filter(r => r.method === 'PATCH');
    expect(writes[0].body).to.deep.equal({ stock_level: null });
  });

  it('keeps what a refused save left unsaved, and says so', async () => {
    const server = createServer();
    server.failing.add('https://demo.api/hapi/products/36');
    const element = await render(server);
    await type(element, 'TEE-ORG-M', '12');
    await element.save();
    await element.updateComplete;
    expect(element.hasChanges).to.equal(true);
    expect(text($(element, '[data-testid="message"]'))).to.equal('save_failed');
    expect($(element, '[data-testid="message"]')!.getAttribute('role')).to.equal('alert');
    expect(input(element, 'TEE-ORG-M').value).to.equal('12');
  });

  it('starts tracking an untracked product with the count entered', async () => {
    const server = createServer();
    const element = await render(server);
    await click(element, '[data-testid="filter-untracked"]');
    await click(element, '[data-testid="start-tracking"]');
    expect(server.requests.filter(r => r.method === 'PATCH')).to.have.length(0);

    await type(element, 'GIFT-WRAP', '25');
    await element.save();
    const writes = server.requests.filter(r => r.method === 'PATCH');
    expect(writes).to.have.length(1);
    expect(writes[0].url).to.equal('https://demo.api/hapi/products/42');
    expect(writes[0].body).to.deep.equal({ stock_level: 25 });
  });

  it('starts tracking an untracked parent on its variants, leaving blank ones untracked', async () => {
    const products = [
      product(60, { sku: 'CONF-26', product_type: 'parent', definition: { name: 'Conference' } }),
      product(61, { sku: 'CONF-26-DAY1', product_type: 'variant', inherit_from_id: 60 }),
      product(62, { sku: 'CONF-26-DAY2', product_type: 'variant', inherit_from_id: 60 }),
    ];
    const server = createServer(products);
    const element = await render(server);
    await click(element, '[data-testid="filter-untracked"]');
    await click(element, '[data-testid="start-tracking"]');
    expect(all(element, 'item').map(i => i.dataset.sku)).to.deep.equal([
      'CONF-26-DAY1',
      'CONF-26-DAY2',
    ]);
    await type(element, 'CONF-26-DAY1', '300');
    await element.save();
    const writes = server.requests.filter(r => r.method === 'PATCH');
    expect(writes.map(w => [w.url.split('/').pop(), w.body])).to.deep.equal([
      ['61', { stock_level: 300 }],
    ]);
  });

  it('changes the store-wide low-stock number with a PATCH of the product settings', async () => {
    const server = createServer();
    const element = await render(server);
    expect(text($(element, '[data-testid="threshold"]'))).to.contain('threshold');

    await click(element, '[data-testid="threshold-change"]');
    const field = $<HTMLInputElement>(element, '#threshold')!;
    field.value = '3';
    field.dispatchEvent(new Event('input'));
    await element.updateComplete;
    $(element, '[data-testid="threshold-form"]')!.dispatchEvent(
      new Event('submit', { cancelable: true })
    );
    await waitUntil(() => element.lowStockThreshold === 3);
    await element.updateComplete;

    const write = server.requests.find(r => r.method === 'PATCH')!;
    expect(write.url).to.equal(settingsHref);
    expect(write.body).to.deep.equal({ low_stock_threshold: 3 });
    expect($(element, '[data-testid="threshold-form"]')).to.not.exist;
    expect($(element, '[data-sku="TEE-ORG-L"] [data-testid="state"]')!.dataset.state).to.equal(
      'in_stock'
    );
  });

  it('offers no way to change the low-stock number without the product settings', async () => {
    const element = await render(createServer(), false);
    expect($(element, '[data-testid="threshold"]')).to.exist;
    expect($(element, '[data-testid="threshold-change"]')).to.not.exist;
  });

  it('searches by product name or SKU', async () => {
    const element = await render();
    const search = $<HTMLInputElement>(element, '[data-testid="search"]')!;
    search.value = 'mug';
    search.dispatchEvent(new Event('input'));
    await element.updateComplete;
    expect(all(element, 'group').map(g => g.dataset.sku)).to.deep.equal(['MUG-ENAMEL-12']);

    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    await element.updateComplete;
    expect(text($(element, '[data-testid="status"]'))).to.equal('no_matches');
  });
});
