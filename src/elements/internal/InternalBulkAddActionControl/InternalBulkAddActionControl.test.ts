import type { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import type { FormDialog } from '../../public/FormDialog';

import '../../public/NucleonElement/index';
import './index';

import { InternalBulkAddActionControl as Control } from './InternalBulkAddActionControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/hapi';

describe('CouponForm', () => {
  describe('InternalBulkAddActionControl', () => {
    it('imports and registers vaadin-button element', () => {
      expect(customElements.get('vaadin-button')).to.exist;
    });

    it('imports and registers foxy-internal-control element', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and registers foxy-form-dialog element', () => {
      expect(customElements.get('foxy-form-dialog')).to.exist;
    });

    it('imports and registers foxy-i18n element', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('registers itself as foxy-internal-bulk-add-action-control', () => {
      expect(customElements.get('foxy-internal-bulk-add-action-control')).to.equal(Control);
    });

    it('extends foxy-internal-control', () => {
      expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
    });

    it('has a reactive property "parent"', () => {
      expect(Control).to.have.deep.nested.property('properties.parent', {});
      expect(new Control()).to.have.property('parent', null);
    });

    it('has a reactive property "form"', () => {
      expect(Control).to.have.deep.nested.property('properties.form', {});
      expect(new Control()).to.have.property('form', null);
    });

    it('renders form dialog', async () => {
      const router = createRouter();

      const wrapper = await fixture(html`
        <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
          <foxy-nucleon href="https://demo.api/hapi/coupons/0">
            <foxy-internal-bulk-add-action-control
              parent="https://demo.api/hapi/coupon_codes"
              infer=""
              form="foxy-coupon-codes-form"
              .related=${['https://demo.api/hapi/coupon_codes?coupon_id=0']}
            >
            </foxy-internal-bulk-add-action-control>
          </foxy-nucleon>
        </div>
      `);

      const nucleon = wrapper.firstElementChild as NucleonElement<any>;
      await waitUntil(() => !!nucleon.data);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const dialog = control.renderRoot.querySelector('foxy-form-dialog');
      expect(dialog).to.exist;

      expect(dialog).to.have.attribute('header', 'header');
      expect(dialog).to.have.attribute('parent', 'https://demo.api/hapi/coupon_codes');
      expect(dialog).to.have.attribute('infer', 'dialog');
      expect(dialog).to.have.attribute('form', 'foxy-coupon-codes-form');
      expect(dialog).to.have.attribute('alert');

      expect(dialog).to.have.deep.property('related', [
        'https://demo.api/hapi/coupon_codes?coupon_id=0',
      ]);
    });

    it('renders translatable button opening the form dialog', async () => {
      const router = createRouter();

      const wrapper = await fixture(html`
        <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
          <foxy-nucleon href="https://demo.api/hapi/coupons/0">
            <foxy-internal-bulk-add-action-control
              parent="https://demo.api/hapi/coupon_codes"
              infer=""
              form="foxy-coupon-codes-form"
            >
            </foxy-internal-bulk-add-action-control>
          </foxy-nucleon>
        </div>
      `);

      const nucleon = wrapper.firstElementChild as NucleonElement<any>;
      await waitUntil(() => !!nucleon.data);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const button = control.renderRoot.querySelector('vaadin-button');
      const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
      const label = button?.querySelector('foxy-i18n[infer=""][key="button_text"]');

      expect(button).to.exist;
      expect(label).to.exist;

      button?.dispatchEvent(new CustomEvent('click'));
      await waitUntil(() => dialog?.open);

      expect(dialog).to.have.property('href', '');
      expect(dialog).to.have.property('open', true);
    });

    it('disables the button when control is disabled', async () => {
      const router = createRouter();

      const wrapper = await fixture(html`
        <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
          <foxy-nucleon href="https://demo.api/hapi/coupons/0">
            <foxy-internal-bulk-add-action-control
              parent="https://demo.api/hapi/coupon_codes"
              infer=""
              form="foxy-coupon-codes-form"
            >
            </foxy-internal-bulk-add-action-control>
          </foxy-nucleon>
        </div>
      `);

      const nucleon = wrapper.firstElementChild as NucleonElement<any>;
      await waitUntil(() => !!nucleon.data);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const button = control.renderRoot.querySelector('vaadin-button');
      expect(button).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });
  });
});
