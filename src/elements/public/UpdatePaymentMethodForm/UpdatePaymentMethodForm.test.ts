import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { InternalUpdatePaymentMethodFormCcTokenControl } from './internal/InternalUpdatePaymentMethodFormCcTokenControl/InternalUpdatePaymentMethodFormCcTokenControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { UpdatePaymentMethodForm as Form } from './UpdatePaymentMethodForm';
import { InternalResourcePickerControl } from '../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import { createRouter } from '../../../server/index';

describe('UpdatePaymentMethodForm', () => {
  it('imports and defines foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-template-set-card', () => {
    expect(customElements.get('foxy-template-set-card')).to.exist;
  });

  it('imports and defines foxy-nucleon-element', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-spinner', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and defines foxy-internal-update-payment-method-form-cc-token-control', () => {
    const tag = 'foxy-internal-update-payment-method-form-cc-token-control';
    expect(customElements.get(tag)).to.exist;
  });

  it('defines itself as foxy-update-payment-method-form', () => {
    expect(customElements.get('foxy-update-payment-method-form')).to.equal(Form);
  });

  it('has a default i18n namespace of "update-payment-method-form"', () => {
    expect(Form).to.have.property('defaultNS', 'update-payment-method-form');
    expect(new Form()).to.have.property('ns', 'update-payment-method-form');
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a reactive property "embedUrl"', () => {
    expect(Form).to.have.deep.nested.property('properties.embedUrl', { attribute: 'embed-url' });
    expect(new Form()).to.have.property('embedUrl', null);
  });

  it('hides template set picker when using a preconfigured or demo embed URL', () => {
    const form = new Form();
    form.embedUrl = 'https://embed.foxy.io/v1?demo=default';
    expect(form.hiddenSelector.matches('template-set', true)).to.be.true;

    form.embedUrl = 'https://embed.foxy.io/v1?template_set_id=0';
    expect(form.hiddenSelector.matches('template-set', true)).to.be.true;

    form.embedUrl = 'https://embed.foxy.io/v1';
    expect(form.hiddenSelector.matches('template-set', true)).to.be.false;
  });

  it('hides card input when template set is not specified in live mode', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-update-payment-method-form
        href="https://demo.api/hapi/payment_methods/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-update-payment-method-form>
    `);

    await waitUntil(() => !!form.data);
    const picker = form.renderRoot.querySelector(
      '[infer="template-set"]'
    ) as InternalResourcePickerControl;

    expect(form.hiddenSelector.matches('cc-token', true)).to.be.true;

    form.embedUrl = 'https://embed.foxy.io/v1?template_set_id=0';
    expect(form.hiddenSelector.matches('cc-token', true)).to.be.false;

    form.embedUrl = 'https://embed.foxy.io/v1';
    picker?.setValue('https://demo.api/hapi/template_sets/0');
    expect(form.hiddenSelector.matches('cc-token', true)).to.be.false;
  });

  it('renders a spinner in empty state when href is not set', async () => {
    const layout = html`<foxy-update-payment-method-form></foxy-update-payment-method-form>`;
    const form = await fixture<Form>(layout);
    const spinner = form.renderRoot.querySelector('foxy-spinner');

    expect(spinner).to.exist;
    expect(spinner).to.have.attribute('state', 'empty');
    expect(spinner).to.have.attribute('layout', 'vertical');
    expect(spinner).to.have.attribute('infer', 'spinner');
  });

  it('renders a template set picker when href is set', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-update-payment-method-form
        embed-url="https://embed.foxy.io/v1"
        href="https://demo.api/hapi/payment_methods/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-update-payment-method-form>
    `);

    await waitUntil(() => {
      return (
        !!form.data && !!form.renderRoot.querySelector<NucleonElement<any>>('#store-loader')?.data
      );
    });

    const picker = form.renderRoot.querySelector(
      '[infer="template-set"]'
    ) as InternalResourcePickerControl;

    const ccToken = form.renderRoot.querySelector('[infer="cc-token"]');

    expect(picker).to.be.instanceOf(InternalResourcePickerControl);
    expect(picker).to.have.attribute('first', 'https://demo.api/hapi/template_sets?store_id=0');
    expect(picker).to.have.attribute('item', 'foxy-template-set-card');
    expect(picker.getValue()).to.equal(null);
    expect(ccToken).to.have.attribute('embed-url', 'https://embed.foxy.io/v1');

    picker.setValue('https://demo.api/hapi/template_sets/0');
    expect(picker.getValue()).to.equal('https://demo.api/hapi/template_sets/0');

    await form.requestUpdate();
    expect(ccToken).to.have.attribute('embed-url', 'https://embed.foxy.io/v1?template_set_id=0');
  });

  it('renders a card input when href is set', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-update-payment-method-form
        embed-url="https://embed.foxy.io/v1?demo=default"
        href="https://demo.api/hapi/payment_methods/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-update-payment-method-form>
    `);

    await waitUntil(() => !!form.data);
    const control = form.renderRoot.querySelector('[infer="cc-token"]') as NucleonElement<any>;

    expect(control).to.be.instanceOf(InternalUpdatePaymentMethodFormCcTokenControl);
    expect(control).to.have.attribute('embed-url', 'https://embed.foxy.io/v1?demo=default');
    expect(control).to.have.attribute('infer', 'cc-token');
  });
});
