import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import { InternalSubmitControl as Control } from './index';
import { InternalControl } from '../InternalControl/InternalControl';
import { NucleonElement } from '../../public/NucleonElement/index';
import { stub } from 'sinon';

const nucleon = new NucleonElement();

class TestControl extends Control {
  nucleon = nucleon;
}

customElements.define('test-internal-submit-control', TestControl);

describe('InternalSubmitControl', () => {
  before(() => document.body.appendChild(nucleon));
  beforeEach(() => nucleon.undo());
  after(() => nucleon.remove());

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.not.be.undefined;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-control', () => {
    expect(customElements.get('foxy-internal-control')).to.equal(InternalControl);
  });

  it('imports and defines itself as foxy-internal-submit-control', () => {
    expect(customElements.get('foxy-internal-submit-control')).to.equal(Control);
  });

  it('defines a reactive property for "theme" (String)', () => {
    expect(Control).to.have.nested.property('properties.theme.type', String);
    expect(new Control()).to.have.property('theme', 'primary');
  });

  it('extends InternalControl', () => {
    expect(new Control()).to.be.instanceOf(InternalControl);
  });

  it('renders vaadin-button element', async () => {
    const layout = html`<test-internal-submit-control></test-internal-submit-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button');

    expect(button).to.not.be.null;
  });

  it('renders translatable label "caption" within vaadin-button element', async () => {
    const layout = html`<test-internal-submit-control></test-internal-submit-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button');
    const label = button?.querySelector('foxy-i18n');

    expect(label).to.not.be.null;
    expect(label).to.have.property('key', 'caption');
    expect(label).to.have.property('infer', '');
  });

  it('sets "disabled" on vaadin-button from "disabled" on itself', async () => {
    const layout = html`<test-internal-submit-control></test-internal-submit-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(button).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(button).to.have.property('disabled', false);
  });

  it('submits the host nucleon form on click', async () => {
    const layout = html`<test-internal-submit-control></test-internal-submit-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button')!;
    const submitMethod = stub(control.nucleon, 'submit');

    button.dispatchEvent(new MouseEvent('click'));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });
});
