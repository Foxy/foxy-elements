import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';

import './index';

import { InternalPostActionControlDialog as ControlDialog } from './InternalPostActionControlDialog';
import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { Dialog } from '../../private/Dialog/Dialog';

describe('InternalPostActionControl', () => {
  it('extends Dialog', () => {
    expect(new ControlDialog()).to.be.instanceOf(Dialog);
  });

  it('defines reactive properties and default values', () => {
    const dialog = new ControlDialog();

    expect(dialog.messageOptions).to.deep.equal({});
    expect(ControlDialog.properties).to.have.deep.property('messageOptions', {
      attribute: 'message-options',
      type: Object,
    });

    expect(dialog.href).to.be.null;
    expect(ControlDialog.properties).to.have.deep.property('href', {});

    expect(dialog.closable).to.be.true;
    expect(dialog.header).to.equal('header');
    expect(dialog.alert).to.be.true;
    expect(dialog.hiddenSelector.matches('close-button', true)).to.be.true;
  });

  it('renders idle state by default', async () => {
    const dialog = await fixture<ControlDialog>(html`
      <foxy-internal-post-action-control-dialog message-options=${JSON.stringify({ foo: 'bar' })}>
      </foxy-internal-post-action-control-dialog>
    `);

    await dialog.show();
    const $ = (selector: string) => dialog.renderRoot.querySelector(selector);

    const message = $('foxy-i18n[infer=""][key="message_idle"]');
    const cancelButtonCaption = $('foxy-i18n[infer=""][key="button_cancel"]');
    const confirmButtonCaption = $('foxy-i18n[infer=""][key="button_confirm"]');
    const cancelButton = cancelButtonCaption?.closest('vaadin-button');
    const confirmButton = confirmButtonCaption?.closest('vaadin-button');

    expect(message).to.exist;
    expect(message).to.have.deep.property('options', { foo: 'bar' });
    expect(cancelButtonCaption).to.exist;
    expect(confirmButtonCaption).to.exist;
    expect(cancelButton).to.exist;
    expect(confirmButton).to.exist;
    expect(cancelButton).to.not.have.attribute('disabled');
    expect(confirmButton).to.not.have.attribute('disabled');

    const hideEvent = oneEvent(dialog, 'hide');
    cancelButton?.click();
    expect(await hideEvent).to.have.nested.property('detail.cancelled', true);
  });

  it('sends a POST request to href when confirm button is clicked and renders busy state', async () => {
    let lastFetchEvent = null as FetchEvent | null;
    const $ = (selector: string) => dialog.renderRoot.querySelector(selector);

    const router = createRouter();
    const dialog = await fixture<ControlDialog>(html`
      <foxy-internal-post-action-control-dialog
        href="https://demo.api/virtual/stall"
        @fetch=${(evt: FetchEvent) => {
          lastFetchEvent = evt;
          router.handleEvent(evt);
        }}
      >
      </foxy-internal-post-action-control-dialog>
    `);

    await dialog.show();
    const confirmButtonCaption = $('foxy-i18n[key="button_confirm"]');
    const confirmButton = confirmButtonCaption?.closest('vaadin-button');

    expect($('foxy-spinner[infer=""]')).to.not.exist;
    lastFetchEvent = null as FetchEvent | null;
    confirmButton?.click();

    expect(lastFetchEvent).to.not.be.null;
    expect(lastFetchEvent?.request.url).to.equal('https://demo.api/virtual/stall');
    expect(lastFetchEvent?.request.method).to.equal('POST');

    await dialog.requestUpdate();
    expect($('foxy-spinner[infer=""]')).to.exist;
    expect(dialog.closable).to.be.false;
  });

  it('displays done state when POST request is successful', async () => {
    const router = createRouter();
    const dialog = await fixture<ControlDialog>(html`
      <foxy-internal-post-action-control-dialog
        href="https://demo.api/virtual/empty?status=200"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-post-action-control-dialog>
    `);

    await dialog.show();
    const $ = (selector: string) => dialog.renderRoot.querySelector(selector);
    const confirmButtonCaption = $('foxy-i18n[key="button_confirm"]');
    const confirmButton = confirmButtonCaption?.closest('vaadin-button');

    confirmButton?.click();
    await waitUntil(() => {
      dialog.requestUpdate();
      return !!$('foxy-i18n[infer=""][key="message_done"]');
    });

    const closeButtonCaption = $('foxy-i18n[key="button_close"]');
    const closeButton = closeButtonCaption?.closest('vaadin-button');

    expect($('foxy-spinner')).to.not.exist;
    expect(closeButtonCaption).to.exist;
    expect(closeButton).to.exist;
    expect(dialog.closable).to.be.true;

    const hideEvent = oneEvent(dialog, 'hide');
    closeButton?.click();
    expect(await hideEvent).to.have.nested.property('detail.cancelled', false);
  });

  it('displays fail state when POST request fails', async () => {
    const router = createRouter();
    const dialog = await fixture<ControlDialog>(html`
      <foxy-internal-post-action-control-dialog
        href="https://demo.api/virtual/empty?status=500"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-post-action-control-dialog>
    `);

    await dialog.show();
    const $ = (selector: string) => dialog.renderRoot.querySelector(selector);
    const confirmButtonCaption = $('foxy-i18n[key="button_confirm"]');
    const confirmButton = confirmButtonCaption?.closest('vaadin-button');

    confirmButton?.click();
    await waitUntil(() => {
      dialog.requestUpdate();
      return !!$('foxy-i18n[infer=""][key="message_fail"]');
    });

    const closeButtonCaption = $('foxy-i18n[key="button_close"]');
    const closeButton = closeButtonCaption?.closest('vaadin-button');

    expect($('foxy-spinner')).to.not.exist;
    expect(closeButtonCaption).to.exist;
    expect(closeButton).to.exist;
    expect(dialog.closable).to.be.true;

    const hideEvent = oneEvent(dialog, 'hide');
    closeButton?.click();
    expect(await hideEvent).to.have.nested.property('detail.cancelled', true);
  });
});
