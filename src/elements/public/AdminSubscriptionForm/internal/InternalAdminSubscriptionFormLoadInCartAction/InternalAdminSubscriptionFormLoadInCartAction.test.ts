import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Data } from '../../types';

import { InternalAdminSubscriptionFormLoadInCartAction as Control } from './InternalAdminSubscriptionFormLoadInCartAction';
import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../../../testgen/getTestData';

import '../../../NucleonElement/index';
import './index';

describe('AdminSubscriptionForm', () => {
  describe('InternalAdminSubscriptionFormLoadInCartAction', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-admin-subscription-form-load-in-cart-action', () => {
      expect(
        customElements.get('foxy-internal-admin-subscription-form-load-in-cart-action')
      ).to.equal(Control);
    });

    it('has a reactive property "action" that defaults to null', () => {
      expect(new Control()).to.have.property('action', null);
      expect(Control).to.have.deep.nested.property('properties.action', {});
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
    });

    it('renders sub_token link from parent form by default', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data._links['fx:sub_token_url'].href = 'https://example.com/sub_token_url';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-load-in-cart-action infer="">
          </foxy-internal-admin-subscription-form-load-in-cart-action>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const link = control.renderRoot.querySelector('a') as HTMLAnchorElement;
      expect(link).to.exist;
      expect(link.href).to.equal('https://example.com/sub_token_url');
      expect(link.target).to.equal('_blank');
    });

    it('renders cancel link when action is set to "cancel"', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data._links['fx:sub_token_url'].href = 'https://example.com/sub_token_url';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-load-in-cart-action action="cancel" infer="">
          </foxy-internal-admin-subscription-form-load-in-cart-action>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const link = control.renderRoot.querySelector('a') as HTMLAnchorElement;
      expect(link).to.exist;
      expect(link.href).to.equal('https://example.com/sub_token_url?sub_cancel=true');
      expect(link.target).to.equal('_blank');
    });

    it('renders a translatable caption inside of the link', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data._links['fx:sub_token_url'].href = 'https://example.com/sub_token_url';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-load-in-cart-action infer="">
          </foxy-internal-admin-subscription-form-load-in-cart-action>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const i18n = control.renderRoot.querySelector('foxy-i18n') as HTMLElement;
      expect(i18n).to.exist;
      expect(i18n).to.have.attribute('key', 'caption');
      expect(i18n).to.have.attribute('infer', '');
      expect(i18n.closest('a')).to.exist;
    });
  });
});
