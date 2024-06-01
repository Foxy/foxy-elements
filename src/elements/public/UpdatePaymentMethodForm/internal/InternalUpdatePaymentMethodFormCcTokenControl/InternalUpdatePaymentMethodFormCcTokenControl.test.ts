import type { PaymentCardEmbedElement } from '../../../PaymentCardEmbedElement/PaymentCardEmbedElement';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';

import '../../../NucleonElement/index';
import './index';

import { InternalUpdatePaymentMethodFormCcTokenControl as Control } from './InternalUpdatePaymentMethodFormCcTokenControl';
import { expect, fixture, html } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { stub } from 'sinon';

describe('UpdatePaymentMethodForm', () => {
  describe('InternalUpdatePaymentMethodFormCcTokenControl', () => {
    it('imports and defines foxy-payment-card-embed', () => {
      expect(customElements.get('foxy-payment-card-embed')).to.exist;
    });

    it('imports and defines vaadin-button', () => {
      expect(customElements.get('vaadin-button')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-update-payment-method-form-cc-token-control', () => {
      const tag = 'foxy-internal-update-payment-method-form-cc-token-control';
      expect(customElements.get(tag)).to.equal(Control);
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(InternalControl);
    });

    it('has a reactive property "embedUrl"', () => {
      expect(new Control()).to.have.property('embedUrl', null);
      expect(Control).to.have.deep.nested.property('properties.embedUrl', {
        attribute: 'embed-url',
      });
    });

    it('renders a foxy-payment-card-embed element', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-update-payment-method-form-cc-token-control
          embed-url="https://embed.foxy.io/v1?demo=default"
        >
        </foxy-internal-update-payment-method-form-cc-token-control>
      `);

      const element = control.renderRoot.querySelector('foxy-payment-card-embed');
      expect(element).to.exist;
      expect(element).to.have.attribute('infer', 'payment-card-embed');
      expect(element).to.have.attribute('url', 'https://embed.foxy.io/v1?demo=default');
    });

    it('renders a button that tokenizes the card on click', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-update-payment-method-form-cc-token-control infer="">
          </foxy-internal-update-payment-method-form-cc-token-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      const label = control.renderRoot.querySelector('foxy-i18n[key="tokenize"]')!;
      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');

      const button = label.closest('vaadin-button')!;
      expect(button).to.exist;
      expect(button).to.have.attribute('theme', 'primary');

      const embed = control.renderRoot.querySelector(
        'foxy-payment-card-embed'
      ) as PaymentCardEmbedElement;

      const tokenize = stub(embed, 'tokenize').resolves('test-token');
      const edit = stub(nucleon, 'edit');
      const submit = stub(nucleon, 'submit');

      button.click();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(tokenize).to.have.been.called;
      expect(edit).to.have.been.calledWith({ cc_token: 'test-token' });
      expect(submit).to.have.been.called;
    });

    it('disables the button when control is disabled', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-update-payment-method-form-cc-token-control>
        </foxy-internal-update-payment-method-form-cc-token-control>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      expect(button).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });
  });
});
