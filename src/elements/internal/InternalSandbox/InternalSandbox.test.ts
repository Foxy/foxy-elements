import './index';

import { LitElement, html } from 'lit-element';
import { expect, fixture } from '@open-wc/testing';

import { InternalSandbox } from './InternalSandbox';

describe('InternalSandbox', () => {
  it('extends LitElement', () => {
    expect(new InternalSandbox()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-internal-sandbox', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('re-renders once .render property changes', async () => {
    const layout = html`<foxy-internal-sandbox></foxy-internal-sandbox>`;
    const element = await fixture<InternalSandbox>(layout);

    element.render = () => html`Test`;
    await element.requestUpdate();

    expect(element.shadowRoot).to.include.text('Test');
  });
});
