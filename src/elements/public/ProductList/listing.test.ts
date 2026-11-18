import { expect } from '@open-wc/testing';
import { catalog, product } from './fixtures';
import {
  collectionTree,
  formatPriceRange,
  groupProducts,
  loadAllProducts,
  matchesQuery,
  priceRange,
  productStockState,
  stockHolders,
  stockState,
  stockSummary,
  variantLabel,
  variantPrice,
} from './listing';

describe('ProductList', () => {
  describe('listing', () => {
    it('counts stock at the threshold as low, and nothing as low at a threshold of 0', () => {
      expect(stockState(null, 5)).to.equal('untracked');
      expect(stockState(0, 5)).to.equal('out_of_stock');
      expect(stockState(5, 5)).to.equal('low_stock');
      expect(stockState(6, 5)).to.equal('in_stock');
      expect(stockState(1, 0)).to.equal('in_stock');
    });

    it("uses a product's own low-stock number in place of the store's", () => {
      const own = product(1, { stock_level: 12, definition: { low_stock_threshold: 20 } });
      expect(productStockState(own, 5)).to.equal('low_stock');
      expect(productStockState(product(2, { stock_level: 12 }), 5)).to.equal('in_stock');
    });

    it('groups variants under their product and sorts by the name shown, then SKU', () => {
      const groups = groupProducts(catalog());
      expect(groups.map(g => g.product.sku)).to.deep.equal([
        'COF-COL-HUILA-340',
        'MUG-ENAMEL-12',
        'GIFT-WRAP',
        'TEE-ORG',
        'TPL-COFFEE-340',
      ]);
      expect(groups[3].variants.map(v => v.sku)).to.deep.equal([
        'TEE-ORG-L',
        'TEE-ORG-M',
        'TEE-ORG-S',
      ]);
    });

    it('leaves out deleted products', () => {
      const deleted = product(9, { deleted_at: '2026-11-02T09:14:00-0800' });
      expect(groupProducts([deleted])).to.have.length(0);
    });

    it("prices a variant at its own price, or its parent's plus its values' price changes", () => {
      const [tee, small, , large] = catalog();
      expect(variantPrice(tee, small)).to.equal(24.95);
      expect(variantPrice(tee, large)).to.be.closeTo(27.45, 0.0001);
      const own = { ...large, definition: { price: '31.10' } };
      expect(variantPrice(tee, own)).to.equal(31.1);
    });

    it('gives a parent the range of its variants prices, with trailing zeros', () => {
      const tee = groupProducts(catalog())[3];
      expect(formatPriceRange(priceRange(tee), 'USD', 'en')).to.equal('$24.95 – $27.45');
      const mug = groupProducts(catalog())[1];
      expect(formatPriceRange(priceRange(mug), 'USD', 'en')).to.equal('$16.40');
      expect(formatPriceRange(priceRange(mug), null, 'en')).to.equal('16.40');
      const template = groupProducts(catalog())[4];
      expect(priceRange(template)).to.equal(null);
    });

    it('sums stock across what holds it, and never counts a template', () => {
      const groups = groupProducts(catalog());
      expect(stockSummary(groups[3], 5)).to.deep.equal({
        state: 'low_stock',
        units: 21,
        out: 1,
        low: 1,
        holders: 3,
      });
      expect(stockSummary(groups[2], 5).state).to.equal('untracked');
      expect(stockSummary(groups[0], 5).state).to.equal('out_of_stock');
      expect(stockHolders(groups[4])).to.have.length(0);
    });

    it("finds a product by its name, its SKU or a variant's SKU", () => {
      const tee = groupProducts(catalog())[3];
      expect(matchesQuery(tee, 'cotton')).to.equal(true);
      expect(matchesQuery(tee, 'tee-org-m')).to.equal(true);
      expect(matchesQuery(tee, 'mug')).to.equal(false);
      expect(matchesQuery(tee, '  ')).to.equal(true);
    });

    it("labels a variant by its option values' labels in the parent's order", () => {
      const parent = product(1, {
        definition: {
          options: [
            { name: 'size', values: [{ value: 'S' }] },
            { name: 'color', values: [{ value: 'black', label: 'Black' }] },
          ],
        },
      });
      const variant = product(2, { option_values: { color: 'Black', size: 'S' } });
      expect(variantLabel(parent, variant)).to.equal('S / Black');
    });

    it('loads every page of a collection', async () => {
      const all = Array.from({ length: 450 }, (_, i) => product(i + 1));
      const urls: string[] = [];
      const loaded = await loadAllProducts('https://demo.api/hapi/stores/0/products', async url => {
        urls.push(url);
        const offset = Number(new URL(url).searchParams.get('offset'));
        return {
          total_items: String(all.length),
          _embedded: { 'fx:products': all.slice(offset, offset + 200) },
        };
      });
      expect(loaded).to.have.length(450);
      expect(urls).to.have.length(3);
    });

    it('orders collections as a tree, each with its depth and the names down to it', () => {
      // "/coffee-beans" sorts before "/coffee/blends" as plain text, which would split the tree.
      const tree = collectionTree([
        { id: 41, name: 'Coffee Beans', path: '/coffee-beans' },
        { id: 26, name: 'Blends', path: '/coffee/blends' },
        { id: 17, name: 'Coffee', path: '/coffee' },
      ]);
      expect(tree.map(c => [c.id, c.depth, c.trail])).to.deep.equal([
        [17, 0, 'Coffee'],
        [26, 1, 'Coffee › Blends'],
        [41, 0, 'Coffee Beans'],
      ]);
    });
  });
});
