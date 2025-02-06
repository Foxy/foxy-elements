import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html, LitElement } from 'lit-element';
import { stub } from 'sinon';
import { CopyToClipboard } from './index';

describe('CopyToClipboard', () => {
  it('imports and registers vcf-tooltip element', () => {
    expect(customElements.get('vcf-tooltip')).to.exist;
  });

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

  it('has a reactive property/attribite named "layout" (String)', () => {
    expect(CopyToClipboard).to.have.deep.nested.property('properties.layout', {});
    expect(new CopyToClipboard()).to.have.property('layout', null);
  });

  it('has a reactive property/attribite named "theme" (String)', () => {
    expect(CopyToClipboard).to.have.deep.nested.property('properties.theme', {});
    expect(new CopyToClipboard()).to.have.property('theme', null);
  });

  it('has a reactive property/attribite named "text" (String)', () => {
    expect(CopyToClipboard).to.have.nested.property('properties.text.type', String);
  });

  it('has a reactive property/attribite named "icon" (String)', () => {
    expect(CopyToClipboard).to.have.nested.property('properties.icon.type', String);
  });

  it('has a default i18next namespace "copy-to-clipboard"', () => {
    expect(CopyToClipboard).to.have.property('defaultNS', 'copy-to-clipboard');
    expect(new CopyToClipboard()).to.have.property('ns', 'copy-to-clipboard');
  });

  it('renders in the idle state by default (icon layout)', async () => {
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const tooltip = element.renderRoot.querySelector('vcf-tooltip foxy-i18n') as HTMLElement;

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
  });

  it('renders in the idle state by default (text layout)', async () => {
    const layout = html`<foxy-copy-to-clipboard layout="text"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const tooltip = element.renderRoot.querySelector('vaadin-button foxy-i18n') as HTMLElement;

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
  });

  it('renders in the idle state by default (complete layout)', async () => {
    const layout = html`<foxy-copy-to-clipboard layout="complete"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const tooltip = element.renderRoot.querySelector('vaadin-button foxy-i18n') as HTMLElement;

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
  });

  it('renders default icon in icon layout when icon attribute is not set', async () => {
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const icon = element.renderRoot.querySelector('iron-icon') as HTMLElement;

    expect(icon).to.have.property('icon', 'icons:content-copy');
  });

  it('renders default icon in complete layout when icon attribute is not set', async () => {
    const layout = html`<foxy-copy-to-clipboard layout="complete"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const icon = element.renderRoot.querySelector('iron-icon') as HTMLElement;

    expect(icon).to.have.property('icon', 'icons:content-copy');
  });

  it('renders custom icon in icon layout when icon attribute is set', async () => {
    const layout = html`<foxy-copy-to-clipboard icon="icons:foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const icon = element.renderRoot.querySelector('iron-icon') as HTMLElement;

    expect(icon).to.have.property('icon', 'icons:foo');
  });

  it('renders custom icon in complete layout when icon attribute is set', async () => {
    const element = await fixture<CopyToClipboard>(html`
      <foxy-copy-to-clipboard layout="complete" icon="icons:foo"> </foxy-copy-to-clipboard>
    `);

    const icon = element.renderRoot.querySelector('iron-icon') as HTMLElement;
    expect(icon).to.have.property('icon', 'icons:foo');
  });

  it('copies text on click in icon layout', async () => {
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

  it('copies text on click in text layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const layout = html`<foxy-copy-to-clipboard layout="text" text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');

    button?.click();
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

  it('copies text on click in complete layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const element = await fixture<CopyToClipboard>(html`
      <foxy-copy-to-clipboard layout="complete" text="Foo"> </foxy-copy-to-clipboard>
    `);

    const button = element.renderRoot.querySelector('vaadin-button');
    button?.click();
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

  it('switches to the busy state when copying text in icon layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').returns(
      new Promise(() => void 0)
    );

    const layout = html`<foxy-copy-to-clipboard text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;
    const tooltip = element.renderRoot.querySelector('vcf-tooltip foxy-i18n') as HTMLElement;

    button.click();
    await element.requestUpdate();

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'copying');
    writeTextMethod.restore();
  });

  it('switches to the busy state when copying text in text layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').returns(
      new Promise(() => void 0)
    );

    const layout = html`<foxy-copy-to-clipboard layout="text" text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();
    await element.requestUpdate();

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'copying');
    writeTextMethod.restore();
  });

  it('switches to the busy state when copying text in complete layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').returns(
      new Promise(() => void 0)
    );

    const element = await fixture<CopyToClipboard>(html`
      <foxy-copy-to-clipboard layout="complete" text="Foo"> </foxy-copy-to-clipboard>
    `);

    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();
    await element.requestUpdate();

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'copying');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text successfully in icon layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;
    const tooltip = element.renderRoot.querySelector('vcf-tooltip foxy-i18n') as HTMLElement;

    button.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip.getAttribute('key') === 'click_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text successfully in text layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const layout = html`<foxy-copy-to-clipboard layout="text"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip?.getAttribute('key') === 'click_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text successfully in complete layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const layout = html`<foxy-copy-to-clipboard layout="complete"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip?.getAttribute('key') === 'click_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the error state when copying text fails in icon layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;
    const tooltip = element.renderRoot.querySelector('vcf-tooltip foxy-i18n') as HTMLElement;

    button.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip.getAttribute('key') === 'failed_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'failed_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the error state when copying text fails in text layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard layout="text" text="Foo"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip?.getAttribute('key') === 'failed_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'failed_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the error state when copying text fails in complete layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const element = await fixture<CopyToClipboard>(html`
      <foxy-copy-to-clipboard layout="complete" text="Foo"> </foxy-copy-to-clipboard>
    `);

    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip?.getAttribute('key') === 'failed_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'failed_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text fails in icon layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('button') as HTMLButtonElement;
    const tooltip = element.renderRoot.querySelector('vcf-tooltip foxy-i18n') as HTMLElement;

    button.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip.getAttribute('key') === 'click_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text fails in text layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard layout="text"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip?.getAttribute('key') === 'click_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('switches to the idle state ~2s after copying text fails in complete layout', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').rejects();
    const layout = html`<foxy-copy-to-clipboard layout="complete"></foxy-copy-to-clipboard>`;
    const element = await fixture<CopyToClipboard>(layout);
    const button = element.renderRoot.querySelector('vaadin-button');
    const tooltip = button?.querySelector('foxy-i18n');

    button?.click();

    await waitUntil(
      async () => {
        await element.requestUpdate();
        return tooltip?.getAttribute('key') === 'click_to_copy';
      },
      undefined,
      { timeout: 5000 }
    );

    expect(tooltip).to.have.property('infer', '');
    expect(tooltip).to.have.property('key', 'click_to_copy');
    writeTextMethod.restore();
  });

  it('propagates theme attribute to vaadin-button in text layout', async () => {
    const element = await fixture<CopyToClipboard>(html`
      <foxy-copy-to-clipboard layout="text" theme="foo"></foxy-copy-to-clipboard>
    `);

    const button = element.renderRoot.querySelector('vaadin-button');
    expect(button).to.have.attribute('theme', 'foo');
  });

  it('propagates theme attribute to vaadin-button in complete layout', async () => {
    const element = await fixture<CopyToClipboard>(html`
      <foxy-copy-to-clipboard layout="complete" theme="foo"></foxy-copy-to-clipboard>
    `);

    const button = element.renderRoot.querySelector('vaadin-button');
    expect(button).to.have.attribute('theme', 'foo');
  });
});
