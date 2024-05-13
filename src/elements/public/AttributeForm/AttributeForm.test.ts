import type { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { AttributeForm } from './AttributeForm';

describe('AttributeForm', () => {
  it('imports and defines foxy-internal-radio-group-control', () => {
    expect(customElements.get('foxy-internal-radio-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-attribute-form', () => {
    expect(customElements.get('foxy-attribute-form')).to.equal(AttributeForm);
  });

  it('has a default i18next namespace of "attribute-form"', () => {
    expect(AttributeForm).to.have.property('defaultNS', 'attribute-form');
    expect(new AttributeForm()).to.have.property('ns', 'attribute-form');
  });

  it('produces "value:v8n_required" v8n error when value is empty', async () => {
    const element = new AttributeForm();
    expect(element.errors).to.include('value:v8n_required');

    element.edit({ value: 'foo' });
    expect(element.errors).not.to.include('value:v8n_required');
  });

  it('produces "value:v8n_too_long" v8n error when value is too long', async () => {
    const element = new AttributeForm();
    expect(element.errors).to.not.include('value:v8n_too_long');

    element.edit({ value: 'foo' });
    expect(element.errors).not.to.include('value:v8n_too_long');

    element.edit({ value: 'a'.repeat(1001) });
    expect(element.errors).to.include('value:v8n_too_long');
  });

  it('produces "name:v8n_required" v8n error when name is empty', async () => {
    const element = new AttributeForm();
    expect(element.errors).to.include('name:v8n_required');

    element.edit({ name: 'foo' });
    expect(element.errors).not.to.include('name:v8n_required');
  });

  it('produces "name:v8n_too_long" v8n error when name is too long', async () => {
    const element = new AttributeForm();
    expect(element.errors).to.not.include('name:v8n_too_long');

    element.edit({ name: 'foo' });
    expect(element.errors).not.to.include('name:v8n_too_long');

    element.edit({ name: 'a'.repeat(501) });
    expect(element.errors).to.include('name:v8n_too_long');
  });

  it('makes visibility control readonly when href is set', async () => {
    const element = new AttributeForm();
    expect(element.readonlySelector.matches('visibility', true)).to.be.false;

    element.href = 'https://demo.api/hapi/customer_attributes/0';
    expect(element.readonlySelector.matches('visibility', true)).to.be.true;
  });

  it('renders a source control for name', async () => {
    const element = await fixture<AttributeForm>(html`<foxy-attribute-form></foxy-attribute-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-source-control[infer="name"]');
    expect(control).to.exist;
  });

  it('renders a source control for value', async () => {
    const element = await fixture<AttributeForm>(html`<foxy-attribute-form></foxy-attribute-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-source-control[infer="value"]');
    expect(control).to.exist;
  });

  it('renders a radio group control for visibility', async () => {
    const element = await fixture<AttributeForm>(html`<foxy-attribute-form></foxy-attribute-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-radio-group-control[infer="visibility"]'
    ) as InternalRadioGroupControl;

    expect(control).to.exist;
    expect(control).to.have.deep.property('options', [
      { label: 'option_public', value: 'public' },
      { label: 'option_restricted', value: 'restricted' },
      { label: 'option_private', value: 'private' },
    ]);

    expect(control.getValue()).to.equal('private');
    element.edit({ visibility: 'public' });
    expect(control.getValue()).to.equal('public');
  });
});
