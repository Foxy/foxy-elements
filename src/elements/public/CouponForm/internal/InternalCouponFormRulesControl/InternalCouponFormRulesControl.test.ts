import type { DiscountBuilder } from '../../../DiscountBuilder/DiscountBuilder';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';

import '../../../NucleonElement/index';
import './index';

import { InternalCouponFormRulesControl as Control } from './InternalCouponFormRulesControl';
import { expect, fixture, html } from '@open-wc/testing';
import { getByTestId } from '../../../../../testgen/getByTestId';

describe('CouponForm', () => {
  describe('InternalCouponFormRulesControl', () => {
    it('imports and defines foxy-internal-editable-control', () => {
      expect(customElements.get('foxy-internal-editable-control')).to.exist;
    });

    it('imports and defines foxy-copy-to-clipboard', () => {
      expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
    });

    it('imports and defines foxy-discount-builder', () => {
      expect(customElements.get('foxy-discount-builder')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-coupon-form-rules-control', () => {
      expect(customElements.get('foxy-internal-coupon-form-rules-control')).to.equal(Control);
    });

    it('extends foxy-internal-editable-control', () => {
      expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
    });

    it('renders label', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-coupon-form-rules-control></foxy-internal-coupon-form-rules-control>
      `);

      expect(control.renderRoot).to.include.text('label');

      control.label = 'Foo bar';
      await control.requestUpdate();

      expect(control.renderRoot).to.not.include.text('label');
      expect(control.renderRoot).to.include.text('Foo bar');
    });

    it('renders helper text', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-coupon-form-rules-control></foxy-internal-coupon-form-rules-control>
      `);

      expect(control.renderRoot).to.include.text('helper_text');

      control.helperText = 'Test helper text';
      await control.requestUpdate();

      expect(control.renderRoot).to.not.include.text('helper_text');
      expect(control.renderRoot).to.include.text('Test helper text');
    });

    it('renders error text if available', async () => {
      let control = await fixture<Control>(html`
        <foxy-internal-coupon-form-rules-control></foxy-internal-coupon-form-rules-control>
      `);

      expect(control.renderRoot).to.not.include.text('Test error message');

      customElements.define(
        'x-test-control',
        class extends Control {
          protected get _errorMessage() {
            return 'Test error message';
          }
        }
      );

      control = await fixture<Control>(html`<x-test-control></x-test-control>`);
      expect(control.renderRoot).to.include.text('Test error message');
    });

    it('renders presets', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-coupon-form-rules-control></foxy-internal-coupon-form-rules-control>
      `);

      const wrapper = await getByTestId(control, 'rules:preset');
      const i18n = wrapper?.querySelector('foxy-i18n[infer=""][key="preset"]');
      expect(i18n).to.exist;

      const options = [
        { type: 'quantity_amount', details: 'allunits|2-2' },
        { type: 'quantity_percentage', details: 'allunits|5-10|10-20' },
        { type: 'quantity_amount', details: 'incremental|3-5' },
        { type: 'quantity_percentage', details: 'incremental|11-10|51-15|101-20' },
        { type: 'quantity_percentage', details: 'repeat|2-100' },
        { type: 'quantity_percentage', details: 'repeat|4-50' },
        { type: 'quantity_amount', details: 'single|5-10' },
        { type: 'price_percentage', details: 'single|99.99-10' },
      ];

      const select = wrapper?.querySelector('select');
      expect(select).to.exist;

      options.forEach((preset, index) => {
        expect(select).to.have.nested.property(`options[${index}].value`, preset.details);
        expect(select).to.include.text('discount_summary');
      });

      expect(select).to.have.nested.property('options[8].value', 'custom');
      expect(select).to.include.text('custom_discount');
    });

    it('binds preset picker to nucleon.form.coupon_discount_details', async () => {
      const element = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-coupon-form-rules-control infer="">
          </foxy-internal-coupon-form-rules-control>
        </foxy-nucleon>
      `);

      const control = element.firstElementChild as Control;
      const wrapper = await getByTestId(control, 'rules:preset');

      let select = wrapper?.querySelector('select') as HTMLSelectElement;
      expect(select).to.have.nested.property('selectedOptions[0].value', 'custom');

      select.selectedIndex = 0;
      select.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property(
        'form.coupon_discount_details',
        select.options[0].value
      );

      await element.requestUpdate();
      element.inferPropertiesInDescendants();
      await control.requestUpdate();

      element.edit({
        coupon_discount_details: 'incremental|11-10|51-15|101-20',
        coupon_discount_type: 'quantity_percentage',
      });

      await element.requestUpdate();
      element.inferPropertiesInDescendants();
      await control.requestUpdate();

      select = wrapper?.querySelector('select') as HTMLSelectElement;
      expect(select).to.have.nested.property('selectedIndex', 3);
    });

    it('disables preset picker if control is disabled', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-coupon-form-rules-control></foxy-internal-coupon-form-rules-control>
      `);

      const select = control.renderRoot.querySelector('select');
      expect(select).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(select).to.have.attribute('disabled');
    });

    it('disables preset picker if control is readonly', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-coupon-form-rules-control></foxy-internal-coupon-form-rules-control>
      `);

      const select = control.renderRoot.querySelector('select');
      expect(select).to.not.have.attribute('disabled');

      control.readonly = true;
      await control.requestUpdate();
      expect(select).to.have.attribute('disabled');
    });

    it('renders discount builder', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-coupon-form-rules-control infer="">
          </foxy-internal-coupon-form-rules-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      const builder = control.renderRoot.querySelector('foxy-discount-builder') as DiscountBuilder;

      expect(builder).to.exist;
      expect(builder).to.have.attribute('infer', 'discount-builder');
      expect(builder).to.have.deep.property('parsedValue', {
        details: '',
        type: 'quantity_amount',
        name: 'Rules',
      });

      builder.parsedValue = { details: 'allunits|2-2', type: 'price_percentage', name: 'Rules' };
      builder.dispatchEvent(new CustomEvent('change'));

      expect(nucleon).to.have.nested.property('form.coupon_discount_details', 'allunits|2-2');
      expect(nucleon).to.have.nested.property('form.coupon_discount_type', 'price_percentage');

      nucleon.edit({
        coupon_discount_details: 'incremental|11-10|51-15|101-20',
        coupon_discount_type: 'quantity_percentage',
      });

      await nucleon.requestUpdate();
      nucleon.inferPropertiesInDescendants();
      await control.requestUpdate();

      expect(builder).to.have.deep.property('parsedValue', {
        details: 'incremental|11-10|51-15|101-20',
        type: 'quantity_percentage',
        name: 'Rules',
      });
    });
  });
});
