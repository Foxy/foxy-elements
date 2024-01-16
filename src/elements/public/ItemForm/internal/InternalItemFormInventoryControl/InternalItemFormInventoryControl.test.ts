import type { InternalAsyncComboBoxControl } from '../../../../internal/InternalAsyncComboBoxControl';

import '../../index';

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { InternalItemFormInventoryControl } from './index';

describe('ItemForm', () => {
  describe('InternalItemFormInventoryControl', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines foxy-internal-async-combo-box-control', () => {
      expect(customElements.get('foxy-internal-async-combo-box-control')).to.exist;
    });

    it('imports and defines foxy-internal-text-control', () => {
      expect(customElements.get('foxy-internal-text-control')).to.exist;
    });

    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines itself as foxy-internal-item-form-inventory-control', () => {
      expect(customElements.get('foxy-internal-item-form-inventory-control')).to.equal(
        InternalItemFormInventoryControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalItemFormInventoryControl()).to.be.instanceOf(InternalControl);
    });

    it('has an empty i18n namespace by default', () => {
      expect(InternalItemFormInventoryControl).to.have.property('defaultNS', '');
      expect(new InternalItemFormInventoryControl()).to.have.property('ns', '');
    });

    it('renders item category as a control', async () => {
      const wrapper = await fixture(html`
        <foxy-item-form item-categories="https://demo.api/hapi/item_categories">
          <foxy-internal-item-form-inventory-control infer="inventory">
          </foxy-internal-item-form-inventory-control>
        </foxy-item-form>
      `);

      const element = wrapper.firstElementChild as InternalItemFormInventoryControl;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(
        'foxy-internal-async-combo-box-control[infer="category"]'
      );

      expect(control).to.exist;
      expect(control).to.have.property('itemValuePath', '_links.self.href');
      expect(control).to.have.property('itemLabelPath', 'name');
      expect(control).to.have.property('property', 'item_category_uri');
      expect(control).to.have.property('first', 'https://demo.api/hapi/item_categories');
    });

    it('renders item code as a control', async () => {
      const element = await fixture<InternalItemFormInventoryControl>(html`
        <foxy-internal-item-form-inventory-control></foxy-internal-item-form-inventory-control>
      `);

      expect(element.renderRoot.querySelector('foxy-internal-text-control[infer="code"]')).to.exist;
    });

    it('renders item parent code as a control', async () => {
      const element = await fixture<InternalItemFormInventoryControl>(html`
        <foxy-internal-item-form-inventory-control></foxy-internal-item-form-inventory-control>
      `);

      const control = element.renderRoot.querySelector(
        'foxy-internal-text-control[infer="parent-code"]'
      );
      expect(control).to.exist;
    });
  });
});
