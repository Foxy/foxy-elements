import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html, LitElement } from 'lit-element';
import { stub } from 'sinon';
import { CopyToClipboard } from './index';

describe('CopyToClipboard', () => {
  it('imports and registers iron-icon element', () => {
    expect(customElements.get('iron-icon')).to.exist;
  });

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and registers itself as foxy-copy-to-clipboard', () => {
    expect(customElements.get('foxy-copy-to-clipboard')).to.equal(CopyToClipboard);
  });

  it('extends LitElement', () => {
    expect(new CopyToClipboard()).to.be.instanceOf(LitElement);
  });

  it('has a reactive property/attribite named "text" (String)', () => {
    expect(CopyToClipboard).to.have.nested.property('properties.text.type', String);
  });

  it('has a default i18next namespace "copy-to-clipboard"', () => {
    expect(CopyToClipboard).to.have.property('defaultNS', 'copy-to-clipboard');
    expect(new CopyToClipboard()).to.have.property('ns', 'copy-to-clipboard');
  });

  it('renders in the idle state by default', async () => {
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;

    expect(button).to.have.property('title', 'click_to_copy');
  });

  it('copies text on click', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const layout = html`<foxy-copy-to-clipboard text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;

    button.click();
    await waitUntil(
      () => {
        try {
          expect(writeTextMethod).to.have.been.calledOnceWith('Foo');
          return true;
        } catch {
          return false;
        }
      },
      undefined,
      { timeout: 5000 }
    );

    expect(writeTextMethod).to.have.been.calledOnceWith('Foo');
    writeTextMethod.restore();
  });

  it('switches to the busy state when copying text', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').returns(
      new Promise(() => void 0)
    );

    const layout = html`<foxy-copy-to-clipboard text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;

    button.click();
    await element.updateComplete;

    expect(button).to.have.property('title', 'copying');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text successfully', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;

    button.click();
    await element.updateComplete;
    await waitUntil(() => button.title === 'click_to_copy', undefined, { timeout: 5000 });

    expect(button).to.have.property('title', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the error state when copying text fails', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;

    button.click();
    await element.updateComplete;
    await waitUntil(() => button.title === 'failed_to_copy', undefined, { timeout: 5000 });

    expect(button).to.have.property('title', 'failed_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text fails', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;

    button.click();
    await element.updateComplete;
    await waitUntil(() => button.title === 'click_to_copy', undefined, { timeout: 5000 });

    expect(button).to.have.property('title', 'click_to_copy');
    writeTextMethod.restore();
  });
});
