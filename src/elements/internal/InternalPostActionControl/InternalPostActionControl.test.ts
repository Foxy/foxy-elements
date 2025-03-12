import type { ButtonElement } from '@vaadin/vaadin-button';

import './index';

import { InternalPostActionControlDialog as ControlDialog } from './InternalPostActionControlDialog';
import { InternalPostActionControl as Control } from './InternalPostActionControl';
import { html, expect, fixture } from '@open-wc/testing';
import { stub } from 'sinon';

describe('InternalPostActionControl', () => {
  it('imports dependencies', () => {
    expect(customElements.get('vaadin-button')).to.exist;
    expect(customElements.get('foxy-internal-control')).to.exist;
    expect(customElements.get('foxy-spinner')).to.exist;
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-internal-post-action-control', () => {
    expect(customElements.get('foxy-internal-post-action-control')).to.equal(Control);
  });

  it('defines the dialog as foxy-internal-post-action-control-dialog', () => {
    expect(customElements.get('foxy-internal-post-action-control-dialog')).to.equal(ControlDialog);
  });

  it('defines reactive properties', () => {
    expect(new Control()).to.have.property('theme', null);
    expect(Control.properties).to.have.property('theme');

    expect(new Control()).to.have.property('href', null);
    expect(Control.properties).to.have.property('href');

    expect(new Control()).to.have.deep.property('messageOptions', {});
    expect(Control.properties).to.have.deep.property('messageOptions', {
      attribute: 'message-options',
      type: Object,
    });
  });

  it('extends foxy-internal-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
  });

  it('renders internal dialog', async () => {
    const control = await fixture<Control>(
      html`
        <foxy-internal-post-action-control
          .messageOptions=${{ foo: 'bar' }}
          href="https://demo.api/virtual/empty"
        >
        </foxy-internal-post-action-control>
      `
    );

    const dialog = control.renderRoot.querySelector('foxy-internal-post-action-control-dialog');

    expect(dialog).to.exist;
    expect(dialog).to.have.attribute('message-options', JSON.stringify({ foo: 'bar' }));
    expect(dialog).to.have.attribute('infer', '');
    expect(dialog).to.have.attribute('href', 'https://demo.api/virtual/empty');
  });

  it('renders button', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-post-action-control theme="primary"></foxy-internal-post-action-control>
    `);

    const button = control.renderRoot.querySelector('vaadin-button');
    expect(button).to.exist;
    expect(button).to.have.attribute('theme', 'primary');

    const caption = button?.querySelector('foxy-i18n');
    expect(caption).to.exist;
    expect(caption).to.have.attribute('key', 'button');
  });

  it('opens confirm dialog on button click', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-post-action-control></foxy-internal-post-action-control>
    `);

    const button = control.renderRoot.querySelector('vaadin-button') as ButtonElement;
    const dialog = control.renderRoot.querySelector(
      'foxy-internal-post-action-control-dialog'
    ) as ControlDialog;

    const showMethod = stub(dialog, 'show');
    button.click();

    expect(showMethod).to.have.been.calledOnce;
    expect(showMethod).to.have.been.calledWith(button);
  });

  it('dispatches "success" event on dialog hide', async () => {
    let isSuccessEventDispatched = false;

    const control = await fixture<Control>(html`
      <foxy-internal-post-action-control @success=${() => (isSuccessEventDispatched = true)}>
      </foxy-internal-post-action-control>
    `);

    const dialog = control.renderRoot.querySelector(
      'foxy-internal-post-action-control-dialog'
    ) as ControlDialog;

    isSuccessEventDispatched = false;
    dialog.dispatchEvent(new CustomEvent('hide', { detail: { cancelled: false } }));
    expect(isSuccessEventDispatched).to.be.true;

    isSuccessEventDispatched = false;
    dialog.dispatchEvent(new CustomEvent('hide', { detail: { cancelled: true } }));
    expect(isSuccessEventDispatched).to.be.false;
  });
});
