import type { QueryBuilder } from '../../public/QueryBuilder/QueryBuilder';

import './index';

import { InternalQueryBuilderControl as Control } from './InternalQueryBuilderControl';
import { expect, fixture, html } from '@open-wc/testing';
import { Operator } from '../../public/QueryBuilder/types';

describe('InternalQueryBuilderControl', () => {
  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.exist;
  });

  it('imports and defines foxy-query-builder', () => {
    expect(customElements.get('foxy-query-builder')).to.exist;
  });

  it('defines itself as foxy-internal-query-builder-control', () => {
    expect(customElements.get('foxy-internal-query-builder-control')).to.equal(Control);
  });

  it('has a reactive property "operators"', () => {
    expect(new Control()).to.have.deep.property('operators', Object.values(Operator));
    expect(Control).to.have.deep.nested.property('properties.operators', { type: Array });
  });

  it('has a reactive property "disableOr"', () => {
    expect(new Control()).to.have.property('disableOr', false);
    expect(Control).to.have.deep.nested.property('properties.disableOr', {
      type: Boolean,
      attribute: 'disable-or',
    });
  });

  it('has a reactive property "disableZoom"', () => {
    expect(new Control()).to.have.property('disableZoom', false);
    expect(Control).to.have.deep.nested.property('properties.disableZoom', {
      type: Boolean,
      attribute: 'disable-zoom',
    });
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('renders label', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-query-builder-control></foxy-internal-query-builder-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-query-builder-control></foxy-internal-query-builder-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text if available', async () => {
    let control = await fixture<Control>(html`
      <foxy-internal-query-builder-control></foxy-internal-query-builder-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    customElements.define(
      'x-test-control',
      class extends Control {
        protected get _errorMessage() {
          return 'Test error message';
        }
      }
    );

    control = await fixture<Control>(html`<x-test-control></x-test-control>`);
    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders query builder', async () => {
    let value = 'foo=bar';

    const control = await fixture<Control>(html`
      <foxy-internal-query-builder-control
        .operators=${[Operator.GreaterThan, Operator.GreaterThanOrEqual]}
        .getValue=${() => value}
        .setValue=${(newValue: string) => (value = newValue)}
      >
      </foxy-internal-query-builder-control>
    `);

    const builder = control.renderRoot.querySelector('foxy-query-builder') as QueryBuilder;

    expect(builder).to.exist;
    expect(builder).to.have.attribute('infer', 'query-builder');
    expect(builder).to.have.property('operators', control.operators);
    expect(builder).to.have.property('value', value);

    builder.value = 'bar=baz';
    builder.dispatchEvent(new CustomEvent('change'));
    expect(value).to.equal('bar=baz');

    expect(builder).to.have.property('disableOr', false);
    expect(builder).to.have.property('disableZoom', false);

    builder.disableOr = true;
    builder.disableZoom = true;
    await control.requestUpdate();

    expect(builder).to.have.property('disableOr', true);
    expect(builder).to.have.property('disableZoom', true);
  });
});
