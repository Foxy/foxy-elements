import type { ItemCategoryForm } from '../../ItemCategoryForm';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../index';
import './index';

import { InternalItemCategoryFormTaxesControl as Control } from './InternalItemCategoryFormTaxesControl';
import { InternalItemCategoryFormTaxesControlItem } from '../InternalItemCategoryFormTaxesControlItem/InternalItemCategoryFormTaxesControlItem';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { CollectionPage } from '../../../CollectionPage/CollectionPage';
import { createRouter } from '../../../../../server';
import { Pagination } from '../../../Pagination/Pagination';
import { getByKey } from '../../../../../testgen/getByKey';
import { getByTag } from '../../../../../testgen/getByTag';

describe('ItemCategoryForm', () => {
  describe('InternalItemCategoryFormTaxesControl', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines foxy-internal-control', () => {
      const element = customElements.get('foxy-internal-control');
      expect(element).to.equal(InternalControl);
    });

    it('imports and defines foxy-collection-page', () => {
      const element = customElements.get('foxy-collection-page');
      expect(element).to.equal(CollectionPage);
    });

    it('imports and defines foxy-pagination', () => {
      const element = customElements.get('foxy-pagination');
      expect(element).to.equal(Pagination);
    });

    it('imports and defines foxy-internal-item-category-form-taxes-control-item', () => {
      const element = customElements.get('foxy-internal-item-category-form-taxes-control-item');
      expect(element).to.equal(InternalItemCategoryFormTaxesControlItem);
    });

    it('imports and defines itself as foxy-internal-item-category-form-taxes-control', () => {
      const element = customElements.get('foxy-internal-item-category-form-taxes-control');
      expect(element).to.equal(Control);
    });

    it('extends foxy-internal-control', () => {
      expect(new Control()).to.be.instanceOf(InternalControl);
    });

    it('has a reactive property "taxes"', () => {
      expect(new Control()).to.have.property('taxes', null);
      expect(Control).to.have.nested.property('properties.taxes');
      expect(Control).to.not.have.nested.property('properties.taxes.type');
      expect(Control).to.not.have.nested.property('properties.taxes.attribute');
    });

    it('renders translatable label', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-item-category-form-taxes-control></foxy-internal-item-category-form-taxes-control>
      `);

      const label = await getByKey(control, 'title');

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
    });

    it('renders pagination for taxes', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-item-category-form-taxes-control taxes="https://demo.api/hapi/taxes">
        </foxy-internal-item-category-form-taxes-control>
      `);

      const pagination = await getByTag(control, 'foxy-pagination');

      expect(pagination).to.exist;
      expect(pagination).to.have.attribute('infer', 'pagination');
      expect(pagination).to.have.attribute('first', 'https://demo.api/hapi/taxes?limit=5');
    });

    it('renders pagination page for taxes', async () => {
      const router = createRouter();

      const element = await fixture<ItemCategoryForm>(html`
        <foxy-item-category-form
          href="https://demo.api/hapi/item_categories/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-item-category-form-taxes-control
            taxes="https://demo.api/hapi/taxes"
            infer="taxes"
          >
          </foxy-internal-item-category-form-taxes-control>
        </foxy-item-category-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });

      const control = element.firstElementChild as Control;
      const pagination = (await getByTag(control, 'foxy-pagination')) as Pagination;
      const page = pagination.firstElementChild as CollectionPage<any>;

      expect(page).to.exist;
      expect(page).to.have.attribute('infer', '');
      expect(page).to.have.attribute('item', 'foxy-internal-item-category-form-taxes-control-item');
      expect(page).to.have.deep.property('props', {
        'tax-item-categories': 'https://demo.api/hapi/tax_item_categories?item_category_id=0',
        'item-category': 'https://demo.api/hapi/item_categories/0',
      });
    });

    it('renders translatable helper text', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-item-category-form-taxes-control></foxy-internal-item-category-form-taxes-control>
      `);

      const helperText = await getByKey(control, 'helper_text');

      expect(helperText).to.exist;
      expect(helperText).to.have.attribute('infer', '');
    });
  });
});
