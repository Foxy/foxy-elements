import './index';

import { InternalSummaryControl as Control } from './InternalSummaryControl';
import { expect, fixture, html } from '@open-wc/testing';

describe('InternalSummaryControl', () => {
  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('renders nothing in light DOM', () => {
    expect(new Control().renderLightDom()).to.be.undefined;
  });

  it('renders label', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control></foxy-internal-summary-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control></foxy-internal-summary-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders default slot', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control></foxy-internal-summary-control>
    `);

    expect(control.renderRoot).to.include.html('<slot></slot>');
  });
});
