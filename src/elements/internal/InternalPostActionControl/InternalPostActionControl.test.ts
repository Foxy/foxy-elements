import type { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import type { NotificationElement } from '@vaadin/vaadin-notification';
import type { ButtonElement } from '@vaadin/vaadin-button';
import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';

import './index';

import { InternalPostActionControl as Control } from './InternalPostActionControl';
import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { stub } from 'sinon';

describe('InternalPostActionControl', () => {
  it('imports dependencies', () => {
    expect(customElements.get('vaadin-notification')).to.exist;
    expect(customElements.get('vaadin-button')).to.exist;
    expect(customElements.get('foxy-internal-confirm-dialog')).to.exist;
    expect(customElements.get('foxy-internal-control')).to.exist;
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-internal-post-action-control', () => {
    expect(customElements.get('foxy-internal-post-action-control')).to.equal(Control);
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

  it('renders internal confirm dialog', async () => {
    const control = await fixture<Control>(
      html`
        <foxy-internal-post-action-control .messageOptions=${{ foo: 'bar' }}>
        </foxy-internal-post-action-control>
      `
    );

    const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog');

    expect(dialog).to.exist;
    expect(dialog).to.have.attribute('header', 'header');
    expect(dialog).to.have.attribute('infer', 'confirm-dialog');
    expect(dialog).to.have.deep.property('messageOptions', { foo: 'bar' });
  });

  ['success', 'error'].forEach(theme => {
    it(`renders ${theme} notification`, async () => {
      const control = await fixture<Control>(
        html`
          <foxy-internal-post-action-control lang="es" ns="post-action">
          </foxy-internal-post-action-control>
        `
      );

      const notification = control.renderRoot.querySelector<NotificationElement>(
        `#${theme}-notification`
      );

      expect(notification).to.exist;
      expect(notification).to.have.attribute('position', 'bottom-end');
      expect(notification).to.have.attribute('duration', '3000');
      expect(notification).to.have.attribute('theme', theme);

      const root = document.createElement('div');
      notification?.renderer?.(root);

      const message = root.querySelector('foxy-i18n');
      expect(message).to.exist;
      expect(message).to.have.attribute('key', theme);
      expect(message).to.have.attribute('lang', 'es');
      expect(message).to.have.attribute('ns', 'post-action notification');
    });
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
    expect(caption).to.have.attribute('key', 'idle');
  });

  it('opens confirm dialog on button click', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-post-action-control></foxy-internal-post-action-control>
    `);

    const button = control.renderRoot.querySelector('vaadin-button') as ButtonElement;
    const dialog = control.renderRoot.querySelector(
      'foxy-internal-confirm-dialog'
    ) as InternalConfirmDialog;

    const showMethod = stub(dialog, 'show');
    button.click();

    expect(showMethod).to.have.been.calledOnce;
    expect(showMethod).to.have.been.calledWith(button);
  });

  it('sends POST request on confirm dialog submit (successful response)', async () => {
    let lastSuccessEvent = null as CustomEvent | null;
    let lastFetchEvent = null as FetchEvent | null;

    const control = await fixture<Control>(html`
      <foxy-internal-post-action-control
        href="https://demo.api/virtual/empty"
        @success=${(evt: CustomEvent) => (lastSuccessEvent = evt)}
        @fetch=${(evt: FetchEvent) => {
          lastFetchEvent = evt;
          evt.respondWith(Promise.resolve(new Response()));
        }}
      >
      </foxy-internal-post-action-control>
    `);

    const dialog = control.renderRoot.querySelector(
      'foxy-internal-confirm-dialog'
    ) as InternalConfirmDialog;

    dialog.dispatchEvent(new DialogHideEvent(false));
    await control.requestUpdate();
    const button = control.renderRoot.querySelector('vaadin-button') as ButtonElement;
    const caption = button.querySelector('foxy-i18n');
    expect(button).to.have.attribute('disabled');
    expect(caption).to.have.attribute('key', 'busy');

    await waitUntil(() => lastFetchEvent !== null);
    expect(lastFetchEvent?.request.url).to.equal('https://demo.api/virtual/empty');
    expect(lastFetchEvent?.request.method).to.equal('POST');

    await waitUntil(() => lastSuccessEvent !== null);
    await control.requestUpdate();
    expect(button).to.not.have.attribute('disabled');
    expect(caption).to.have.attribute('key', 'idle');
  });

  it('sends POST request on confirm dialog submit (failed response)', async () => {
    let lastErrorEvent = null as CustomEvent | null;
    let lastFetchEvent = null as FetchEvent | null;

    const control = await fixture<Control>(html`
      <foxy-internal-post-action-control
        href="https://demo.api/virtual/empty"
        @error=${(evt: CustomEvent) => (lastErrorEvent = evt)}
        @fetch=${(evt: FetchEvent) => {
          lastFetchEvent = evt;
          evt.respondWith(Promise.resolve(new Response(null, { status: 400 })));
        }}
      >
      </foxy-internal-post-action-control>
    `);

    const dialog = control.renderRoot.querySelector(
      'foxy-internal-confirm-dialog'
    ) as InternalConfirmDialog;

    dialog.dispatchEvent(new DialogHideEvent(false));
    await control.requestUpdate();
    const button = control.renderRoot.querySelector('vaadin-button') as ButtonElement;
    const caption = button.querySelector('foxy-i18n');
    expect(button).to.have.attribute('disabled');
    expect(caption).to.have.attribute('key', 'busy');

    await waitUntil(() => lastFetchEvent !== null);
    expect(lastFetchEvent?.request.url).to.equal('https://demo.api/virtual/empty');
    expect(lastFetchEvent?.request.method).to.equal('POST');

    await waitUntil(() => lastErrorEvent !== null);
    await control.requestUpdate();
    expect(button).to.not.have.attribute('disabled');
    expect(caption).to.have.attribute('key', 'idle');
  });
});
