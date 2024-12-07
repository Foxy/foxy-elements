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

  it('has a reactive property "layout" that defaults to null', () => {
    expect(Control).to.have.deep.nested.property('properties.layout', {});
    expect(new Control()).to.have.property('layout', null);
  });

  it('has a reactive property "open" that defaults to false', () => {
    expect(Control).to.have.deep.nested.property('properties.open', { type: Boolean });
    expect(new Control()).to.have.property('open', false);
  });

  it('renders nothing in light DOM', () => {
    expect(new Control().renderLightDom()).to.be.undefined;
  });

  it('renders label in default layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control></foxy-internal-summary-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text in default layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control></foxy-internal-summary-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders default slot in default layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control></foxy-internal-summary-control>
    `);

    expect(control.renderRoot).to.include.html('<slot></slot>');
  });

  it('renders details/summary in "details" layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control layout="details"></foxy-internal-summary-control>
    `);

    const details = control.renderRoot.querySelector('details')!;
    const summary = control.renderRoot.querySelector('details > summary')!;

    expect(details).to.exist;
    expect(summary).to.exist;
    expect(details.open).to.be.false;

    control.open = true;
    await control.requestUpdate();
    expect(details.open).to.be.true;
  });

  it('renders label inside of the details summary in details layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control layout="details"></foxy-internal-summary-control>
    `);

    const summary = control.renderRoot.querySelector('summary');
    expect(summary).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(summary).to.not.include.text('label');
    expect(summary).to.include.text('Foo bar');
  });

  it('renders helper text inside of the details summary in details layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control layout="details"></foxy-internal-summary-control>
    `);

    const summary = control.renderRoot.querySelector('summary');
    expect(summary).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(summary).to.not.include.text('helper_text');
    expect(summary).to.include.text('Test helper text');
  });

  it('renders default slot inside of the details content in details layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control layout="details"></foxy-internal-summary-control>
    `);

    const summary = control.renderRoot.querySelector('details');
    expect(summary).to.include.html('<slot></slot>');
  });

  it('toggles open state when details is toggled', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control layout="details"></foxy-internal-summary-control>
    `);

    const details = control.renderRoot.querySelector('details')!;
    expect(control.open).to.be.false;

    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await control.requestUpdate();
    expect(control.open).to.be.true;

    details.open = false;
    details.dispatchEvent(new Event('toggle'));
    await control.requestUpdate();
    expect(control.open).to.be.false;
  });

  it('dispatches "toggle" event when details is toggled', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-summary-control layout="details"></foxy-internal-summary-control>
    `);

    const details = control.renderRoot.querySelector('details')!;
    let eventCount = 0;

    control.addEventListener('toggle', () => eventCount++);
    details.dispatchEvent(new Event('toggle'));
    await control.requestUpdate();
    expect(eventCount).to.equal(1);
  });
});
