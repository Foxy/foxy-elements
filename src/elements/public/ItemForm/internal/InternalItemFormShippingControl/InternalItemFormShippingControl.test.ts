import '../../index';

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { InternalItemFormShippingControl } from './index';

describe('ItemForm', () => {
  describe('InternalItemFormShippingControl', () => {
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

    it('imports and defines itself as foxy-internal-item-form-shipping-control', () => {
      expect(customElements.get('foxy-internal-item-form-shipping-control')).to.equal(
        InternalItemFormShippingControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalItemFormShippingControl()).to.be.instanceOf(InternalControl);
    });

    it('has an empty i18n namespace by default', () => {
      expect(InternalItemFormShippingControl).to.have.property('defaultNS', '');
      expect(new InternalItemFormShippingControl()).to.have.property('ns', '');
    });

    it('renders customer address as a control', async () => {
      const wrapper = await fixture(html`
        <foxy-item-form customer-addresses="https://demo.api/hapi/customer_addresses">
          <foxy-internal-item-form-shipping-control infer="shipping">
          </foxy-internal-item-form-shipping-control>
        </foxy-item-form>
      `);

      const element = wrapper.firstElementChild as InternalItemFormShippingControl;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(
        'foxy-internal-async-combo-box-control[infer="shipto"]'
      );

      expect(control).to.exist;
      expect(control).to.have.property('itemValuePath', 'address_name');
      expect(control).to.have.property('itemLabelPath', 'address_name');
      expect(control).to.have.property('first', 'https://demo.api/hapi/customer_addresses');
    });

    it('renders item width as a control', async () => {
      const element = await fixture<InternalItemFormShippingControl>(html`
        <foxy-internal-item-form-shipping-control></foxy-internal-item-form-shipping-control>
      `);

      expect(element.renderRoot.querySelector('foxy-internal-integer-control[infer="width"]')).to
        .exist;
    });

    it('renders item height as a control', async () => {
      const element = await fixture<InternalItemFormShippingControl>(html`
        <foxy-internal-item-form-shipping-control></foxy-internal-item-form-shipping-control>
      `);

      expect(element.renderRoot.querySelector('foxy-internal-integer-control[infer="height"]')).to
        .exist;
    });

    it('renders item length as a control', async () => {
      const element = await fixture<InternalItemFormShippingControl>(html`
        <foxy-internal-item-form-shipping-control></foxy-internal-item-form-shipping-control>
      `);

      expect(element.renderRoot.querySelector('foxy-internal-integer-control[infer="length"]')).to
        .exist;
    });

    it('renders item weight as a control', async () => {
      const element = await fixture<InternalItemFormShippingControl>(html`
        <foxy-internal-item-form-shipping-control></foxy-internal-item-form-shipping-control>
      `);

      expect(element.renderRoot.querySelector('foxy-internal-integer-control[infer="weight"]')).to
        .exist;
    });
  });
});
