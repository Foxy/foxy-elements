import './index';

import { html, expect, fixture } from '@open-wc/testing';
import { PasskeyForm as Form } from './PasskeyForm';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import uainfer from 'uainfer/src/uainfer.js';

describe('passkeyForm', () => {
  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-spinner', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and defines itself as foxy-passkey-form', () => {
    expect(customElements.get('foxy-passkey-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18n namespace "passkey-form"', () => {
    expect(Form).to.have.property('defaultNS', 'passkey-form');
    expect(new Form()).to.have.property('ns', 'passkey-form');
  });

  it('renders a form header', async () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.data = await getTestData('./hapi/passkeys/0');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a foxy-internal-text-control for credential id', async () => {
    const element = await fixture<Form>(html`<foxy-passkey-form></foxy-passkey-form>`);
    element.data = await getTestData('./hapi/passkeys/0');
    await element.requestUpdate();

    const control = element.renderRoot.querySelector('[infer="settings"] [infer=credential-id]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control with human readable last login user agent', async () => {
    const element = await fixture<Form>(html`<foxy-passkey-form></foxy-passkey-form>`);
    const analyzeStub = stub(uainfer, 'analyze').returns({ toString: () => 'Stub Agent' });
    element.data = await getTestData('./hapi/passkeys/0');
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="settings"] [infer=last-login-ua]'
    ) as HTMLElement;
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));

    const input = control.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input?.value).to.equal('Stub Agent');
    expect(analyzeStub).to.have.been.calledWithExactly(element.data?.last_login_ua);
    analyzeStub.restore();
  });

  it('renders a spinner in empty state element when empty', async () => {
    const element = await fixture<Form>(html`<foxy-passkey-form></foxy-passkey-form>`);
    const spinner = element.renderRoot.querySelector('foxy-spinner');

    expect(spinner).to.have.attribute('infer', 'spinner');
    expect(spinner).to.have.attribute('state', 'empty');
  });

  it('always marks settings section as readonly', async () => {
    const element = await fixture<Form>(html`<foxy-passkey-form></foxy-passkey-form>`);
    expect(element.readonlySelector.matches('settings', true)).to.be.true;
  });
});
