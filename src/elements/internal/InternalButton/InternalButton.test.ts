import type { InternalButton } from './index';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { stub } from 'sinon';

describe('InternalButton', () => {
  it('defines itself as foxy-internal-button', () => {
    expect(customElements.get('foxy-internal-button')).to.exist;
  });

  it('is an accessible button with no focusable descendants', async () => {
    const button = await fixture<InternalButton>(
      html`<foxy-internal-button aria-label="Sign out"
        ><iron-icon></iron-icon
      ></foxy-internal-button>`
    );

    expect(button).to.have.attribute('role', 'button');
    expect(button).to.have.attribute('tabindex', '0');
    expect(button.renderRoot.querySelector('button, [tabindex]')).to.not.exist;
    await expect(button).to.be.accessible();
  });

  it('renders prefix, default and suffix slots', async () => {
    const button = await fixture<InternalButton>(
      html`<foxy-internal-button></foxy-internal-button>`
    );
    expect(button.renderRoot.querySelector('[part="prefix"] slot[name="prefix"]')).to.exist;
    expect(button.renderRoot.querySelector('[part="label"] slot:not([name])')).to.exist;
    expect(button.renderRoot.querySelector('[part="suffix"] slot[name="suffix"]')).to.exist;
  });

  it('dispatches click on Enter keydown and Space keyup', async () => {
    const button = await fixture<InternalButton>(
      html`<foxy-internal-button>Go</foxy-internal-button>`
    );
    const handler = stub();
    button.addEventListener('click', handler);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(handler).to.have.been.calledOnce;

    const spaceDown = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    button.dispatchEvent(spaceDown);
    expect(spaceDown.defaultPrevented).to.be.true;
    expect(handler).to.have.been.calledOnce;

    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(handler).to.have.been.calledTwice;
  });

  it('blocks .click() and keyboard activation when disabled', async () => {
    const button = await fixture<InternalButton>(
      html`<foxy-internal-button disabled>Go</foxy-internal-button>`
    );

    const handler = stub();
    button.addEventListener('click', handler);

    button.click();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));

    expect(handler).to.not.have.been.called;
    expect(button).to.have.attribute('aria-disabled', 'true');
    expect(button).to.not.have.attribute('tabindex');
  });

  it('becomes focusable again when re-enabled', async () => {
    const button = await fixture<InternalButton>(
      html`<foxy-internal-button disabled>Go</foxy-internal-button>`
    );

    button.disabled = false;
    await button.updateComplete;

    expect(button).to.not.have.attribute('aria-disabled');
    expect(button).to.have.attribute('tabindex', '0');
  });

  it('keeps the host as click target when a slotted child is clicked', async () => {
    const button = await fixture<InternalButton>(
      html`<foxy-internal-button><span>Go</span></foxy-internal-button>`
    );

    const span = button.querySelector('span')!;
    expect(getComputedStyle(span).pointerEvents).to.equal('none');
  });
});
