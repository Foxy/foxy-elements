import type { NucleonElement } from '../../public/NucleonElement/index';
import type { InternalSandbox } from '../InternalSandbox/InternalSandbox';

import '../../public/NucleonElement/index';
import '../../public/AddressCard/index';

import { expect, fixture } from '@open-wc/testing';
import { html, LitElement } from 'lit-element';
import { InternalControl } from './index';
import { render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { stub } from 'sinon';

describe('InternalControl', () => {
  it('imports and defines foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-internal-control', () => {
    expect(customElements.get('foxy-internal-control')).to.equal(InternalControl);
  });

  it('has no i18n namespace by default', () => {
    expect(new InternalControl()).to.have.empty.property('ns');
  });

  it('has "nucleon" among inferred properties', () => {
    expect(InternalControl.inferredProperties).to.include('nucleon');
  });

  it('has a reactive property "nucleon"', () => {
    expect(InternalControl).to.have.nested.property('properties.nucleon.attribute', false);
    expect(new InternalControl()).to.have.property('nucleon', null);
  });

  it('extends LitElement', () => {
    expect(new InternalControl()).to.be.instanceOf(LitElement);
  });

  it('sets the closest NucleonElement instance up the DOM tree as the value of the "nucleon" property', async () => {
    const nucleonElement = await fixture<NucleonElement<any>>(html`
      <foxy-nucleon>
        <foxy-internal-control infer=""></foxy-internal-control>
      </foxy-nucleon>
    `);

    const control = nucleonElement.firstElementChild as InternalControl;

    expect(control).to.have.property('nucleon', nucleonElement);
  });

  it('renders before and after slots', async () => {
    const control = await fixture<InternalControl>(html`
      <foxy-internal-control infer="foo"></foxy-internal-control>
    `);

    const beforeSlot = control.querySelector('slot[name="foo:before"]');
    const afterSlot = control.querySelector('slot[name="foo:after"]');

    expect(beforeSlot).to.exist;
    expect(afterSlot).to.exist;
  });

  it('has a renderControl() method that renders nothing by default', () => {
    const expected = document.createElement('div');
    const actual = document.createElement('div');

    render(new InternalControl().renderControl(), actual);
    render(html``, expected);

    expect(expected.innerHTML).to.equal(actual.innerHTML);
  });

  it('renders nothing in shadow DOM if the control is hidden via hiddencontrols', async () => {
    const addressCard = await fixture(html`
      <foxy-address-card hiddencontrols="foo">
        <foxy-internal-control infer="foo"></foxy-internal-control>
      </foxy-address-card>
    `);

    const control = addressCard.firstElementChild as InternalControl;
    await control.requestUpdate();

    const expected = document.createElement('div');
    render(html``, expected);

    expect(control.renderRoot).to.have.html(expected.innerHTML);
  });

  it('renders "before" slot if visible', async () => {
    const control = await fixture<InternalControl>(
      html`<foxy-internal-control></foxy-internal-control>`
    );

    expect(control.renderRoot.querySelector('slot[name="before"]')).to.exist;
  });

  it('replaces "before" slot with template "before" if available', async () => {
    const value = '<p>Value of the "before" template.</p>';
    const element = await fixture(html`
      <foxy-address-card>
        <template slot="foo:before">${unsafeHTML(value)}</template>
        <foxy-internal-control infer="foo"></foxy-internal-control>
      </foxy-address-card>
    `);

    const control = element.lastElementChild as InternalControl;
    await control.requestUpdate();

    const slot = control.renderRoot.querySelector('slot[name="before"]');
    const sandbox = control.renderRoot.querySelector('[data-testid="before"]') as InternalSandbox;

    expect(slot).to.not.exist;
    expect(sandbox.renderRoot).to.contain.html(value);
  });

  it('renders "after" slot if visible', async () => {
    const control = await fixture<InternalControl>(
      html`<foxy-internal-control></foxy-internal-control>`
    );

    expect(control.renderRoot.querySelector('slot[name="after"]')).to.exist;
  });

  it('replaces "after" slot with template "after" if available', async () => {
    const value = '<p>Value of the "after" template.</p>';
    const element = await fixture(html`
      <foxy-address-card>
        <template slot="foo:after">${unsafeHTML(value)}</template>
        <foxy-internal-control infer="foo"></foxy-internal-control>
      </foxy-address-card>
    `);

    const control = element.lastElementChild as InternalControl;
    await control.requestUpdate();

    const slot = control.renderRoot.querySelector('slot[name="after"]');
    const sandbox = control.renderRoot.querySelector('[data-testid="after"]') as InternalSandbox;

    expect(slot).to.not.exist;
    expect(sandbox.renderRoot).to.contain.html(value);
  });

  it('renders the output of .renderControl() when visible', async () => {
    const control = await fixture<InternalControl>(
      html`<foxy-internal-control></foxy-internal-control>`
    );

    const renderControlMethod = stub(control, 'renderControl').returns(html`<p>Test</p>`);
    await control.requestUpdate();

    expect(control.renderRoot).to.contain.html('<p>Test</p>');
    renderControlMethod.restore();
  });
});
