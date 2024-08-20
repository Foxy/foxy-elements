import './index';

import { InternalCartFormPaymentMethodForm as Form } from './InternalCartFormPaymentMethodForm';
import { expect, fixture, html } from '@open-wc/testing';
import { UpdateEvent } from '../../../NucleonElement/UpdateEvent';
import { stub } from 'sinon';

describe('CartForm', () => {
  describe('InternalCartFormPaymentMethodForm', () => {
    it('imports and defines foxy-internal-async-list-control', async () => {
      expect(customElements.get('foxy-internal-async-list-control')).to.exist;
    });

    it('imports and defines foxy-internal-form', async () => {
      expect(customElements.get('foxy-internal-form')).to.exist;
    });

    it('imports and defines foxy-update-payment-method-form', async () => {
      expect(customElements.get('foxy-update-payment-method-form')).to.exist;
    });

    it('imports and defines foxy-i18n', async () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-cart-form-payment-method-form', async () => {
      expect(customElements.get('foxy-internal-cart-form-payment-method-form')).to.equal(Form);
    });

    it('extends foxy-internal-form', async () => {
      expect(new Form()).to.be.an.instanceOf(customElements.get('foxy-internal-form'));
    });

    it('has a reactive property for defaultPaymentMethod', async () => {
      expect(new Form()).to.have.property('defaultPaymentMethod', null);
      expect(Form).to.have.deep.nested.property('properties.defaultPaymentMethod', {
        attribute: 'default-payment-method',
      });
    });

    it('has a reactive property for paymentCardEmbedUrl', async () => {
      expect(new Form()).to.have.property('paymentCardEmbedUrl', null);
      expect(Form).to.have.deep.nested.property('properties.paymentCardEmbedUrl', {
        attribute: 'payment-card-embed-url',
      });
    });

    it('has a reactive property for selectionProps', async () => {
      expect(new Form()).to.have.deep.property('selectionProps', {});
      expect(Form).to.have.deep.nested.property('properties.selectionProps', { attribute: false });
    });

    it('renders update payment method form for default payment method', async () => {
      const element = await fixture<Form>(html`
        <foxy-internal-cart-form-payment-method-form
          default-payment-method="https://demo.api/hapi/payment_methods/0"
          payment-card-embed-url="https://embed.foxy.io/v1.html?template_set_id=0"
        >
        </foxy-internal-cart-form-payment-method-form>
      `);

      const form = element.renderRoot.querySelector('foxy-update-payment-method-form')!;

      expect(form).to.exist;
      expect(form).to.have.attribute('href', 'https://demo.api/hapi/payment_methods/0');
      expect(form).to.have.attribute('infer', 'default-payment-method');
      expect(form).to.have.attribute(
        'embed-url',
        'https://embed.foxy.io/v1.html?template_set_id=0'
      );

      stub(element, 'submit');
      stub(element, 'edit');

      form.dispatchEvent(
        new UpdateEvent('update', { detail: { result: UpdateEvent.UpdateResult.ResourceUpdated } })
      );

      expect(element.edit).to.have.been.calledOnceWith({ selection: '' });
      expect(element.submit).to.have.been.calledOnce;
    });

    it('renders a translatable separator', async () => {
      const element = await fixture<Form>(html`
        <foxy-internal-cart-form-payment-method-form></foxy-internal-cart-form-payment-method-form>
      `);

      const separator = element.renderRoot.querySelector('foxy-i18n[key="or"]')!;
      expect(separator).to.exist;
      expect(separator).to.have.attribute('infer', '');
    });

    it('renders a translatable header for selector', async () => {
      const element = await fixture<Form>(html`
        <foxy-internal-cart-form-payment-method-form></foxy-internal-cart-form-payment-method-form>
      `);

      const header = element.renderRoot.querySelector('foxy-i18n[key="select_previous"]')!;
      expect(header).to.exist;
      expect(header).to.have.attribute('infer', '');
    });

    it('renders an async list control for selection', async () => {
      const element = await fixture<Form>(html`
        <foxy-internal-cart-form-payment-method-form
          .selectionProps=${{ foo: 'bar' }}
        ></foxy-internal-cart-form-payment-method-form>
      `);

      const list = element.renderRoot.querySelector('foxy-internal-async-list-control')!;

      expect(list).to.exist;
      expect(list).to.have.attribute('infer', 'selection');
      expect(list).to.have.attribute('limit', '5');
      expect(list).to.have.attribute('form', 'foxy-null');
      expect(list).to.have.attribute('hide-delete-button');
      expect(list).to.have.attribute('hide-create-button');
      expect(list).to.have.attribute('foo', 'bar');

      stub(element, 'submit');
      stub(element, 'edit');

      const event = new CustomEvent('itemclick', {
        cancelable: true,
        detail: 'https://demo.api/hapi/payment_methods/0',
      });

      list.dispatchEvent(event);

      expect(event.defaultPrevented).to.be.true;
      expect(element.submit).to.have.been.calledOnce;
      expect(element.edit).to.have.been.calledOnceWith({
        selection: 'https://demo.api/hapi/payment_methods/0',
      });
    });
  });
});
