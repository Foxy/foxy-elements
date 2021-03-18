import '../../public/I18n/index';

import { expect, fixture, oneEvent } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from '../Dialog/Dialog';
import { html } from 'lit-html';

customElements.define('x-confirm-dialog', ConfirmDialog);

describe('ConfirmDialog', () => {
  it('extends Dialog', () => {
    const dialog = new ConfirmDialog();

    expect(dialog).to.be.instanceOf(Dialog);
    expect(dialog).to.have.property('closable', false);
    expect(dialog).to.have.property('editable', false);
    expect(dialog).to.have.property('confirm', 'confirm');
    expect(dialog).to.have.property('message', 'message');
    expect(dialog).to.have.property('cancel', 'cancel');
    expect(dialog).to.have.property('alert', true);
    expect(dialog).to.have.property('theme', 'primary');
  });

  it('propagates lang and ns to foxy-i18n when opened', async () => {
    const template = html`<x-confirm-dialog></x-confirm-dialog>`;
    const dialog = await fixture<ConfirmDialog>(template);
    await dialog.show();

    dialog.renderRoot.querySelectorAll('foxy-i18n').forEach(i18nElement => {
      expect(i18nElement).to.have.attribute('lang', dialog.lang);
      expect(i18nElement).to.have.attribute('ns', dialog.ns);
    });
  });

  it('renders default confirmation ui when opened', async () => {
    const template = html`<x-confirm-dialog></x-confirm-dialog>`;
    const dialog = await fixture<ConfirmDialog>(template);
    const root = dialog.renderRoot;

    await dialog.show();

    expect(root.querySelector(`foxy-i18n[key="${dialog.message}"]`)).to.exist;
    expect(root.querySelector(`foxy-i18n[key="${dialog.confirm}"]`)).to.exist;
    expect(root.querySelector(`foxy-i18n[key="${dialog.cancel}"]`)).to.exist;

    const confirmButton = root.querySelector('[data-testid="confirmButton"]');
    expect(confirmButton).to.have.attribute('theme', dialog.theme);
  });

  it('renders custom confirmation ui when opened', async () => {
    const dialog = await fixture<ConfirmDialog>(html`
      <x-confirm-dialog message="foo" confirm="bar" cancel="baz" theme="contrast">
      </x-confirm-dialog>
    `);

    await dialog.show();

    expect(dialog.renderRoot.querySelector('foxy-i18n[key="foo"]')).to.exist;
    expect(dialog.renderRoot.querySelector('foxy-i18n[key="bar"]')).to.exist;
    expect(dialog.renderRoot.querySelector('foxy-i18n[key="baz"]')).to.exist;

    const confirmButton = dialog.renderRoot.querySelector('[data-testid="confirmButton"]');
    expect(confirmButton).to.have.attribute('theme', 'contrast');
  });

  it('while open, reacts to cancel button click', async () => {
    const template = html`<x-confirm-dialog></x-confirm-dialog>`;
    const dialog = await fixture<ConfirmDialog>(template);

    await dialog.show();

    const cancelButton = dialog.renderRoot.querySelector('[data-testid="cancelButton"]');
    (cancelButton as ButtonElement).click();

    const hideEvent = await oneEvent(dialog, 'hide');
    expect(hideEvent.detail).to.have.property('cancelled', true);
  });

  it('while open, reacts to confirm button click', async () => {
    const template = html`<x-confirm-dialog></x-confirm-dialog>`;
    const dialog = await fixture<ConfirmDialog>(template);

    await dialog.show();

    const confirmButton = dialog.renderRoot.querySelector('[data-testid="confirmButton"]');
    (confirmButton as ButtonElement).click();

    const hideEvent = await oneEvent(dialog, 'hide');
    expect(hideEvent.detail).to.have.property('cancelled', false);
  });
});
