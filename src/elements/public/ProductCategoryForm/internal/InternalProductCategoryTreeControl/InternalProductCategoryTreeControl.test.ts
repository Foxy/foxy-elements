import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalProductCategoryTreeControl } from './InternalProductCategoryTreeControl';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { createRouter } from '../../../../../server/index';
import { getByTestId } from '../../../../../testgen/getByTestId';

describe('InternalProductCategoryTreeControl', () => {
  it('imports and registers itself as foxy-internal-product-category-tree-control', () => {
    expect(customElements.get('foxy-internal-product-category-tree-control')).to.equal(
      InternalProductCategoryTreeControl
    );
  });

  it('extends InternalControl', () => {
    expect(new InternalProductCategoryTreeControl()).to.be.instanceOf(InternalControl);
  });

  it('renders an empty placeholder when there are no categories', async () => {
    const element = await fixture<InternalProductCategoryTreeControl>(html`
      <foxy-internal-product-category-tree-control></foxy-internal-product-category-tree-control>
    `);
    // No `first` URL set; the loader has no data; the tree should be empty.
    expect(await getByTestId(element, 'tree')).to.exist;
    expect(await getByTestId(element, 'empty')).to.exist;
  });

  it('renders the root-level "Add Category" affordance even when empty', async () => {
    const element = await fixture<InternalProductCategoryTreeControl>(html`
      <foxy-internal-product-category-tree-control></foxy-internal-product-category-tree-control>
    `);
    expect(await getByTestId(element, 'add-root')).to.exist;
  });

  it('builds a nested tree from the fetched collection', async () => {
    const router = createRouter();
    const element = await fixture<InternalProductCategoryTreeControl>(html`
      <foxy-internal-product-category-tree-control
        first="https://demo.api/hapi/product_categories"
        @fetch=${(e: Event) => router.handleEvent(e as any)}
      >
      </foxy-internal-product-category-tree-control>
    `);
    await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

    const nodes = Array.from(element.renderRoot.querySelectorAll('[data-testid="node"]'));
    // 4 seeded categories total (All Products / Apparel / Shirts / Accessories).
    expect(nodes.length).to.equal(4);

    // Root nodes (children of the top-level <ul>) should be just one in the
    // seed dataset — "All Products" — since Apparel + Accessories are its
    // children.
    const topLevelUl = element.renderRoot.querySelector('[data-testid="tree"] > ul');
    const topLevelNodes = topLevelUl?.querySelectorAll(':scope > [data-testid="node"]') ?? [];
    expect(topLevelNodes.length).to.equal(1);
  });

  describe('action events', () => {
    it('dispatches productcategory:create with parent_id=null on root add', async () => {
      const element = await fixture<InternalProductCategoryTreeControl>(html`
        <foxy-internal-product-category-tree-control></foxy-internal-product-category-tree-control>
      `);
      const button = (await getByTestId(element, 'add-root')) as HTMLButtonElement;

      let detail: any = null;
      element.addEventListener('productcategory:create', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      button.click();
      expect(detail).to.deep.equal({ parent_id: null });
    });

    it('dispatches productcategory:create with parent_id on child add', async () => {
      const router = createRouter();
      const element = await fixture<InternalProductCategoryTreeControl>(html`
        <foxy-internal-product-category-tree-control
          first="https://demo.api/hapi/product_categories"
          @fetch=${(e: Event) => router.handleEvent(e as any)}
        >
        </foxy-internal-product-category-tree-control>
      `);
      await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

      // Pick any node's "add child" button and verify the dispatched parent_id.
      const addChild = element.renderRoot.querySelector(
        '[data-testid="add-child"]'
      ) as HTMLButtonElement | null;
      expect(addChild).to.exist;
      const expectedId = Number(addChild!.dataset.id);

      let detail: any = null;
      element.addEventListener('productcategory:create', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      addChild!.click();
      expect(detail).to.deep.equal({ parent_id: expectedId });
    });

    it('dispatches productcategory:edit with id', async () => {
      const router = createRouter();
      const element = await fixture<InternalProductCategoryTreeControl>(html`
        <foxy-internal-product-category-tree-control
          first="https://demo.api/hapi/product_categories"
          @fetch=${(e: Event) => router.handleEvent(e as any)}
        >
        </foxy-internal-product-category-tree-control>
      `);
      await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

      const editBtn = element.renderRoot.querySelector(
        '[data-testid="edit"]'
      ) as HTMLButtonElement | null;
      const expectedId = Number(editBtn!.dataset.id);

      let detail: any = null;
      element.addEventListener('productcategory:edit', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      editBtn!.click();
      expect(detail).to.deep.equal({ id: expectedId });
    });

    it('dispatches productcategory:delete with id', async () => {
      const router = createRouter();
      const element = await fixture<InternalProductCategoryTreeControl>(html`
        <foxy-internal-product-category-tree-control
          first="https://demo.api/hapi/product_categories"
          @fetch=${(e: Event) => router.handleEvent(e as any)}
        >
        </foxy-internal-product-category-tree-control>
      `);
      await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

      const deleteBtn = element.renderRoot.querySelector(
        '[data-testid="delete"]'
      ) as HTMLButtonElement | null;
      const expectedId = Number(deleteBtn!.dataset.id);

      let detail: any = null;
      element.addEventListener('productcategory:delete', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      deleteBtn!.click();
      expect(detail).to.deep.equal({ id: expectedId });
    });
  });
});
