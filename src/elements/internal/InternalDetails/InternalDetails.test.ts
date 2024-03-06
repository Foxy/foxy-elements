import './index';

import { InternalDetails as Control } from './InternalDetails';
import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit-element';
import { I18n } from '../../public/I18n/I18n';

describe('InternalDetailsControl', () => {
  it('imports and defines iron-icon', () => {
    expect(customElements.get('iron-icon')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and defines itself as foxy-internal-details', () => {
    expect(customElements.get('foxy-internal-details')).to.equal(Control);
  });

  it('extends LitElement', () => {
    expect(new Control()).to.be.instanceOf(LitElement);
  });

  it('defines a reactive property for "summary" (String)', () => {
    expect(Control).to.have.nested.property('properties.summary.type', String);
    expect(new Control()).to.have.property('summary', null);
  });

  it('defines a reactive property for "open" (Boolean)', () => {
    expect(Control).to.have.nested.property('properties.open.type', Boolean);
    expect(new Control()).to.have.property('open', false);
  });

  it('renders details/summary', async () => {
    const layout = html`<foxy-internal-details></foxy-internal-details>`;
    const control = await fixture<Control>(layout);

    expect(control.renderRoot.querySelector('details')).to.exist;
    expect(control.renderRoot.querySelector('details summary')).to.exist;
  });

  it('syncs the value of "open" with the same property on details', async () => {
    const layout = html`<foxy-internal-details></foxy-internal-details>`;
    const control = await fixture<Control>(layout);
    const details = control.renderRoot.querySelector('details')!;

    expect(control).to.have.property('open', false);
    expect(details).to.have.property('open', false);

    control.open = true;
    await control.requestUpdate();

    expect(control).to.have.property('open', true);
    expect(details).to.have.property('open', true);

    details.open = false;
    details.dispatchEvent(new CustomEvent('toggle'));

    expect(control).to.have.property('open', false);
    expect(details).to.have.property('open', false);
  });

  it('renders translatable summary', async () => {
    const layout = html`<foxy-internal-details></foxy-internal-details>`;
    const control = await fixture<Control>(layout);
    const label = control.renderRoot.querySelector('summary foxy-i18n')!;

    expect(label).to.have.property('infer', '');
    expect(label).to.have.property('key', '');

    control.summary = 'foo';
    await control.requestUpdate();

    expect(label).to.have.property('infer', '');
    expect(label).to.have.property('key', 'foo');
  });

  it('renders a slot for details content', async () => {
    const layout = html`<foxy-internal-details></foxy-internal-details>`;
    const control = await fixture<Control>(layout);
    const slot = control.renderRoot.querySelector('slot:not([name])')!;

    expect(slot).to.exist;
    expect(slot.closest('details')).to.exist;
    expect(slot.closest('summary')).to.not.exist;
  });
});
