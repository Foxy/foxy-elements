import '../../public/I18n/index';

import { expect, fixture, oneEvent } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Dialog } from '../../private/Dialog/Dialog';
import { InternalConfirmDialog } from './InternalConfirmDialog';
import { html } from 'lit-html';

customElements.define('foxy-internal-confirm-dialog', InternalConfirmDialog);

describe('InternalConfirmDialog', () => {
  it('extends Dialog', () => {
    const dialog = new InternalConfirmDialog();

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
    const template = html`<foxy-internal-confirm-dialog></foxy-internal-confirm-dialog>`;
    const dialog = await fixture<InternalConfirmDialog>(template);
    await dialog.show();

    dialog.renderRoot.querySelectorAll('foxy-i18n').forEach(i18nElement => {
      expect(i18nElement).to.have.attribute('lang', dialog.lang);
      expect(i18nElement).to.have.attribute('ns', dialog.ns);
    });
  });

  it('renders default confirmation ui when opened', async () => {
    const dialog = await fixture<InternalConfirmDialog>(html`
      <foxy-internal-confirm-dialog message-options='{"foo":"bar"}'> </foxy-internal-confirm-dialog>
    `);

    await dialog.show();

    const root = dialog.renderRoot;
    const message = root.querySelector(`foxy-i18n[key="${dialog.message}"]`);

    expect(message).to.exist;
    expect(message).to.have.deep.property('options', { foo: 'bar' });
    expect(root.querySelector(`foxy-i18n[key="${dialog.confirm}"]`)).to.exist;
    expect(root.querySelector(`foxy-i18n[key="${dialog.cancel}"]`)).to.exist;

    const confirmButton = root.querySelector('[data-testid="confirmButton"]');
    expect(confirmButton).to.have.attribute('theme', dialog.theme);
  });

  it('renders custom confirmation ui when opened', async () => {
    const dialog = await fixture<InternalConfirmDialog>(html`
      <foxy-internal-confirm-dialog message="foo" confirm="bar" cancel="baz" theme="contrast">
      </foxy-internal-confirm-dialog>
    `);

    await dialog.show();

    expect(dialog.renderRoot.querySelector('foxy-i18n[key="foo"]')).to.exist;
    expect(dialog.renderRoot.querySelector('foxy-i18n[key="bar"]')).to.exist;
    expect(dialog.renderRoot.querySelector('foxy-i18n[key="baz"]')).to.exist;

    const confirmButton = dialog.renderRoot.querySelector('[data-testid="confirmButton"]');
    expect(confirmButton).to.have.attribute('theme', 'contrast');
  });

  it('while open, reacts to cancel button click', async () => {
    const template = html`<foxy-internal-confirm-dialog></foxy-internal-confirm-dialog>`;
    const dialog = await fixture<InternalConfirmDialog>(template);

    await dialog.show();

    const cancelButton = dialog.renderRoot.querySelector('[data-testid="cancelButton"]');
    (cancelButton as ButtonElement).click();

    const hideEvent = await oneEvent(dialog, 'hide');
    expect(hideEvent.detail).to.have.property('cancelled', true);
  });

  it('while open, reacts to confirm button click', async () => {
    const template = html`<foxy-internal-confirm-dialog></foxy-internal-confirm-dialog>`;
    const dialog = await fixture<InternalConfirmDialog>(template);

    await dialog.show();

    const confirmButton = dialog.renderRoot.querySelector('[data-testid="confirmButton"]');
    (confirmButton as ButtonElement).click();

    const hideEvent = await oneEvent(dialog, 'hide');
    expect(hideEvent.detail).to.have.property('cancelled', false);
  });
});
