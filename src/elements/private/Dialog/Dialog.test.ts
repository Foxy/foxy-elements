import { TemplateResult, html } from 'lit-html';
import { expect, fixture, oneEvent } from '@open-wc/testing';

import { Dialog } from './Dialog';
import { DialogHideEvent } from './DialogHideEvent';
import { DialogWindow } from './DialogWindow';

class TestDialog extends Dialog {
  render(): TemplateResult {
    return super.render(() => html`<div data-testid="content"></div>`);
  }
}

customElements.define('test-dialog', TestDialog);

describe('Dialog', () => {
  it('renders hidden with defaults', async () => {
    const template = html`<test-dialog></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);

    expect(dialog).to.have.property('closable', false);
    expect(dialog).to.have.property('editable', false);
    expect(dialog).to.have.property('header', '');
    expect(dialog).to.have.property('alert', false);
    expect(dialog).to.have.property('lang', '');
    expect(dialog).to.have.property('open', false);
    expect(dialog).to.have.property('ns', '');

    const outlet = document.querySelector(TestDialog.dialogWindowsHost);
    const window = TestDialog.dialogWindows.get(dialog) as DialogWindow;

    expect(window).to.have.property('parentElement', outlet);
    expect(dialog).to.have.property('renderRoot', window?.shadowRoot);
    expect(dialog.renderRoot.querySelector('[data-testid="content"]')).not.to.exist;
  });

  it('can be opened with element.show()', async () => {
    const template = html`<test-dialog></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);

    await dialog.show();

    expect(dialog).to.have.property('open', true);
    expect(dialog.renderRoot.querySelector('[data-testid="content"]')).to.exist;
  });

  it('can be opened with element.open = true', async () => {
    const template = html`<test-dialog></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);

    dialog.open = true;
    await oneEvent(dialog, 'show');

    expect(dialog).to.have.property('open', true);
    expect(dialog.renderRoot.querySelector('[data-testid="content"]')).to.exist;
  });

  it('once opened, can be hidden with element.hide()', async () => {
    const template = html`<test-dialog></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);

    await dialog.show();
    await dialog.hide();

    expect(dialog).to.have.property('open', false);
    expect(dialog.renderRoot.querySelector('[data-testid="content"]')).not.to.exist;
  });

  it('once opened, can be hidden with element.open = false', async () => {
    const template = html`<test-dialog></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);

    dialog.open = true;
    await oneEvent(dialog, 'show');

    dialog.open = false;
    await oneEvent(dialog, 'hide');

    expect(dialog).to.have.property('open', false);
    expect(dialog.renderRoot.querySelector('[data-testid="content"]')).not.to.exist;
  });

  it('once opened, can be hidden with ESC when closable === true', async () => {
    const template = html`<test-dialog closable></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);

    await dialog.show();
    dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await oneEvent(dialog, 'hide');

    expect(dialog).to.have.property('open', false);
    expect(dialog.renderRoot.querySelector('[data-testid="content"]')).not.to.exist;
  });

  it('renders close button with element.closable === true', async () => {
    const template = html`<test-dialog closable></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);
    const root = dialog.renderRoot;

    await dialog.show();
    (root.querySelector('#close-button') as HTMLButtonElement).click();
    const hideEvent = (await oneEvent(dialog, 'hide')) as DialogHideEvent;

    expect(hideEvent.detail).to.have.property('cancelled', true);
    expect(dialog).to.have.property('open', false);
  });

  it('renders save button with element.editable === true', async () => {
    const template = html`<test-dialog editable></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);
    const root = dialog.renderRoot;

    await dialog.show();
    (root.querySelector('[data-testid="save-button"]') as HTMLButtonElement).click();
    const hideEvent = (await oneEvent(dialog, 'hide')) as DialogHideEvent;

    expect(hideEvent.detail).to.have.property('cancelled', false);
    expect(dialog).to.have.property('open', false);
  });

  it('allows i18n customizations', async () => {
    const template = html`<test-dialog header="foo" lang="it" ns="bar"></test-dialog>`;
    const dialog = await fixture<TestDialog>(template);
    const root = dialog.renderRoot;

    await dialog.show();

    root.querySelectorAll('foxy-i18n').forEach(i18nElement => {
      expect(i18nElement).to.have.attribute('lang', 'it');
      expect(i18nElement).to.have.attribute('ns', 'bar');
    });

    expect(root.querySelector('foxy-i18n[key="foo"]')).to.exist;
  });
});
