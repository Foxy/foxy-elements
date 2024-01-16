import '../../index';

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { InternalItemFormLineItemDiscountControl } from './index';
import { getTestData } from '../../../../../testgen/getTestData';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';
import { ItemForm } from '../../ItemForm';
import { DiscountBuilder } from '../../../DiscountBuilder/DiscountBuilder';

describe('ItemForm', () => {
  describe('InternalItemFormLineItemDiscountControl', () => {
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

    it('imports and defines foxy-discount-builder', () => {
      expect(customElements.get('foxy-discount-builder')).to.exist;
    });

    it('imports and defines itself as foxy-internal-item-form-line-item-discount-control', () => {
      expect(customElements.get('foxy-internal-item-form-line-item-discount-control')).to.equal(
        InternalItemFormLineItemDiscountControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalItemFormLineItemDiscountControl()).to.be.instanceOf(InternalControl);
    });

    it('has an empty i18n namespace by default', () => {
      expect(InternalItemFormLineItemDiscountControl).to.have.property('defaultNS', '');
      expect(new InternalItemFormLineItemDiscountControl()).to.have.property('ns', '');
    });

    it('renders coupon selector as a control', async () => {
      const wrapper = await fixture(html`
        <foxy-item-form coupons="https://demo.api/hapi/coupons">
          <foxy-internal-item-form-line-item-discount-control infer="line-item-discount">
          </foxy-internal-item-form-line-item-discount-control>
        </foxy-item-form>
      `);

      const element = wrapper.firstElementChild as InternalItemFormLineItemDiscountControl;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(
        'foxy-internal-async-combo-box-control[infer="coupon"]'
      );

      expect(control).to.exist;
      expect(control).to.have.property('itemValuePath', '_links.self.href');
      expect(control).to.have.property('itemLabelPath', 'name');
      expect(control).to.have.property('first', 'https://demo.api/hapi/coupons');

      type Coupon = Resource<Rels.Coupon>;
      const coupon = await getTestData<Coupon>('./hapi/coupons/0');

      control?.dispatchEvent(new CustomEvent('change', { detail: coupon }));

      expect(wrapper).to.have.nested.property('form.discount_name', coupon.name);
      expect(wrapper).to.have.nested.property('form.discount_type', coupon.coupon_discount_type);
      expect(wrapper).to.have.nested.property(
        'form.discount_details',
        coupon.coupon_discount_details
      );
    });

    it('renders discount name as a control', async () => {
      const element = await fixture<InternalItemFormLineItemDiscountControl>(html`
        <foxy-internal-item-form-line-item-discount-control></foxy-internal-item-form-line-item-discount-control>
      `);

      const control = element.renderRoot.querySelector(
        'foxy-internal-text-control[infer="discount-name"]'
      );

      expect(control).to.exist;
    });

    it('renders discount builder', async () => {
      const wrapper = await fixture<ItemForm>(html`
        <foxy-item-form>
          <foxy-internal-item-form-line-item-discount-control infer="line-item-discount">
          </foxy-internal-item-form-line-item-discount-control>
        </foxy-item-form>
      `);

      wrapper.edit({
        discount_type: 'price_amount',
        discount_details: '1-2|3-4',
        discount_name: 'Test',
      });

      const element = wrapper.firstElementChild as InternalItemFormLineItemDiscountControl;
      const builder = element.renderRoot.querySelector<DiscountBuilder>('foxy-discount-builder')!;

      await wrapper.requestUpdate();
      await element.requestUpdate();

      expect(builder).to.exist;
      expect(builder).to.have.property('infer', 'discount-builder');
      expect(builder).to.have.deep.property('parsedValue', {
        type: 'price_amount',
        details: '1-2|3-4',
        name: 'Test',
      });

      builder.parsedValue = {
        type: 'quantity_amount',
        details: '5-6|7-8|9-10',
        name: 'Foo Bar',
      };

      builder.dispatchEvent(new CustomEvent('change'));

      expect(wrapper).to.have.nested.property('form.discount_type', 'quantity_amount');
      expect(wrapper).to.have.nested.property('form.discount_details', '5-6|7-8|9-10');
      expect(wrapper).to.have.nested.property('form.discount_name', 'Foo Bar');
    });
  });
});
