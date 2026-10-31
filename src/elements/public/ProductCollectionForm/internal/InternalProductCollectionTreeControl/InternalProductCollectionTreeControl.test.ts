import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalProductCollectionTreeControl } from './InternalProductCollectionTreeControl';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { createRouter } from '../../../../../server/index';
import { getByTestId } from '../../../../../testgen/getByTestId';

describe('InternalProductCollectionTreeControl', () => {
  it('imports and registers itself as foxy-internal-product-collection-tree-control', () => {
    expect(customElements.get('foxy-internal-product-collection-tree-control')).to.equal(
      InternalProductCollectionTreeControl
    );
  });

  it('extends InternalControl', () => {
    expect(new InternalProductCollectionTreeControl()).to.be.instanceOf(InternalControl);
  });

  it('renders an empty placeholder when there are no collections', async () => {
    const element = await fixture<InternalProductCollectionTreeControl>(html`
      <foxy-internal-product-collection-tree-control></foxy-internal-product-collection-tree-control>
    `);
    // No `first` URL set; the loader has no data; the tree should be empty.
    expect(await getByTestId(element, 'tree')).to.exist;
    expect(await getByTestId(element, 'empty')).to.exist;
  });

  it('renders the root-level "Add Collection" affordance even when empty', async () => {
    const element = await fixture<InternalProductCollectionTreeControl>(html`
      <foxy-internal-product-collection-tree-control></foxy-internal-product-collection-tree-control>
    `);
    expect(await getByTestId(element, 'add-root')).to.exist;
  });

  it('builds a nested tree from the fetched collection', async () => {
    const router = createRouter();
    const element = await fixture<InternalProductCollectionTreeControl>(html`
      <foxy-internal-product-collection-tree-control
        first="https://demo.api/hapi/product_collections"
        @fetch=${(e: Event) => router.handleEvent(e as any)}
      >
      </foxy-internal-product-collection-tree-control>
    `);
    await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

    const nodes = Array.from(element.renderRoot.querySelectorAll('[data-testid="node"]'));
    // 4 seeded collections total (All Products / Apparel / Shirts / Accessories).
    expect(nodes.length).to.equal(4);

    // Root nodes (children of the top-level <ul>) should be just one in the
    // seed dataset — "All Products" — since Apparel + Accessories are its
    // children.
    const topLevelUl = element.renderRoot.querySelector('[data-testid="tree"] > ul');
    const topLevelNodes = topLevelUl?.querySelectorAll(':scope > [data-testid="node"]') ?? [];
    expect(topLevelNodes.length).to.equal(1);
  });

  describe('action events', () => {
    it('dispatches productcollection:create with parent_id=null on root add', async () => {
      const element = await fixture<InternalProductCollectionTreeControl>(html`
        <foxy-internal-product-collection-tree-control></foxy-internal-product-collection-tree-control>
      `);
      const button = (await getByTestId(element, 'add-root')) as HTMLButtonElement;

      let detail: any = null;
      element.addEventListener('productcollection:create', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      button.click();
      expect(detail).to.deep.equal({ parent_id: null });
    });

    it('dispatches productcollection:create with parent_id on child add', async () => {
      const router = createRouter();
      const element = await fixture<InternalProductCollectionTreeControl>(html`
        <foxy-internal-product-collection-tree-control
          first="https://demo.api/hapi/product_collections"
          @fetch=${(e: Event) => router.handleEvent(e as any)}
        >
        </foxy-internal-product-collection-tree-control>
      `);
      await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

      // Pick any node's "add child" button and verify the dispatched parent_id.
      const addChild = element.renderRoot.querySelector(
        '[data-testid="add-child"]'
      ) as HTMLButtonElement | null;
      expect(addChild).to.exist;
      const expectedId = Number(addChild!.dataset.id);

      let detail: any = null;
      element.addEventListener('productcollection:create', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      addChild!.click();
      expect(detail).to.deep.equal({ parent_id: expectedId });
    });

    it('dispatches productcollection:edit with id', async () => {
      const router = createRouter();
      const element = await fixture<InternalProductCollectionTreeControl>(html`
        <foxy-internal-product-collection-tree-control
          first="https://demo.api/hapi/product_collections"
          @fetch=${(e: Event) => router.handleEvent(e as any)}
        >
        </foxy-internal-product-collection-tree-control>
      `);
      await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

      const editBtn = element.renderRoot.querySelector(
        '[data-testid="edit"]'
      ) as HTMLButtonElement | null;
      const expectedId = Number(editBtn!.dataset.id);

      let detail: any = null;
      element.addEventListener('productcollection:edit', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      editBtn!.click();
      expect(detail).to.deep.equal({ id: expectedId });
    });

    it('dispatches productcollection:delete with id', async () => {
      const router = createRouter();
      const element = await fixture<InternalProductCollectionTreeControl>(html`
        <foxy-internal-product-collection-tree-control
          first="https://demo.api/hapi/product_collections"
          @fetch=${(e: Event) => router.handleEvent(e as any)}
        >
        </foxy-internal-product-collection-tree-control>
      `);
      await waitUntil(() => element.renderRoot.querySelectorAll('[data-testid="node"]').length > 0);

      const deleteBtn = element.renderRoot.querySelector(
        '[data-testid="delete"]'
      ) as HTMLButtonElement | null;
      const expectedId = Number(deleteBtn!.dataset.id);

      let detail: any = null;
      element.addEventListener('productcollection:delete', (e: Event) => {
        detail = (e as CustomEvent).detail;
      });
      deleteBtn!.click();
      expect(detail).to.deep.equal({ id: expectedId });
    });
  });
});
