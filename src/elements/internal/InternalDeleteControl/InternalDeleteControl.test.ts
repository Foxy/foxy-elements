import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import { InternalDeleteControl as Control } from './index';
import { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import { InternalControl } from '../InternalControl/InternalControl';
import { NucleonElement } from '../../public/NucleonElement/index';
import { stub } from 'sinon';

const nucleon = new NucleonElement();

class TestControl extends Control {
  nucleon = nucleon;
}

customElements.define('test-internal-delete-control', TestControl);

describe('InternalDeleteControl', () => {
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

  it('imports and defines foxy-internal-confirm-dialog', () => {
    expect(customElements.get('foxy-internal-confirm-dialog')).to.equal(InternalConfirmDialog);
  });

  it('imports and defines itself as foxy-internal-delete-control', () => {
    expect(customElements.get('foxy-internal-delete-control')).to.equal(Control);
  });

  it('defines a reactive property for "theme" (String)', () => {
    expect(Control).to.have.nested.property('properties.theme.type', String);
    expect(new Control()).to.have.property('theme', 'primary error');
  });

  it('extends InternalControl', () => {
    expect(new Control()).to.be.instanceOf(InternalControl);
  });

  it('renders vaadin-button element', async () => {
    const layout = html`<test-internal-delete-control></test-internal-delete-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button');

    expect(button).to.not.be.null;
  });

  it('renders translatable label "delete" within vaadin-button element', async () => {
    const layout = html`<test-internal-delete-control></test-internal-delete-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button');
    const label = button?.querySelector('foxy-i18n');

    expect(label).to.not.be.null;
    expect(label).to.have.property('key', 'delete');
    expect(label).to.have.property('infer', '');
  });

  it('sets "disabled" on vaadin-button from "disabled" on itself', async () => {
    const layout = html`<test-internal-delete-control></test-internal-delete-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button')!;

    control.disabled = true;
    await control.updateComplete;
    expect(button).to.have.property('disabled', true);

    control.disabled = false;
    await control.updateComplete;
    expect(button).to.have.property('disabled', false);
  });

  it('shows deletion confirmation dialog on click', async () => {
    const layout = html`<test-internal-delete-control></test-internal-delete-control>`;
    const control = await fixture<TestControl>(layout);
    const button = control.renderRoot.querySelector('vaadin-button')!;
    const confirm = control.renderRoot.querySelector<InternalConfirmDialog>(
      'foxy-internal-confirm-dialog'
    );

    expect(confirm).to.have.property('message', 'delete_prompt');
    expect(confirm).to.have.property('confirm', 'delete');
    expect(confirm).to.have.property('cancel', 'cancel');
    expect(confirm).to.have.property('header', 'delete');
    expect(confirm).to.have.property('infer', '');

    const showMethod = stub(confirm!, 'show');
    button.dispatchEvent(new CustomEvent('click'));
    expect(showMethod).to.have.been.called;
  });

  it('deletes resource if deletion is confirmed', async () => {
    const layout = html`<test-internal-delete-control></test-internal-delete-control>`;
    const control = await fixture<TestControl>(layout);
    const confirm = control.renderRoot.querySelector<InternalConfirmDialog>(
      'foxy-internal-confirm-dialog'
    )!;

    const deleteMethod = stub(control.nucleon, 'delete');
    confirm.dispatchEvent(new InternalConfirmDialog.HideEvent(false));
    expect(deleteMethod).to.have.been.called;
  });
});
