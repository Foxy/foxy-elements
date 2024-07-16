import type { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { CustomFieldForm } from './CustomFieldForm';
import { stub } from 'sinon';

describe('CustomFieldForm', () => {
  it('imports and defines foxy-internal-checkbox-group-control', () => {
    expect(customElements.get('foxy-internal-checkbox-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-custom-field-form', () => {
    expect(customElements.get('foxy-custom-field-form')).to.equal(CustomFieldForm);
  });

  it('has a default i18next namespace of "custom-field-form"', () => {
    expect(CustomFieldForm).to.have.property('defaultNS', 'custom-field-form');
    expect(new CustomFieldForm()).to.have.property('ns', 'custom-field-form');
  });

  it('produces "value:v8n_required" v8n error when value is empty', async () => {
    const element = new CustomFieldForm();
    expect(element.errors).to.include('value:v8n_required');

    element.edit({ value: 'foo' });
    expect(element.errors).not.to.include('value:v8n_required');
  });

  it('produces "value:v8n_too_long" v8n error when value is too long', async () => {
    const element = new CustomFieldForm();
    expect(element.errors).to.not.include('value:v8n_too_long');

    element.edit({ value: 'foo' });
    expect(element.errors).not.to.include('value:v8n_too_long');

    element.edit({ value: 'a'.repeat(701) });
    expect(element.errors).to.include('value:v8n_too_long');
  });

  it('produces "name:v8n_required" v8n error when name is empty', async () => {
    const element = new CustomFieldForm();
    expect(element.errors).to.include('name:v8n_required');

    element.edit({ name: 'foo' });
    expect(element.errors).not.to.include('name:v8n_required');
  });

  it('produces "name:v8n_too_long" v8n error when name is too long', async () => {
    const element = new CustomFieldForm();
    expect(element.errors).to.not.include('name:v8n_too_long');

    element.edit({ name: 'foo' });
    expect(element.errors).not.to.include('name:v8n_too_long');

    element.edit({ name: 'a'.repeat(101) });
    expect(element.errors).to.include('name:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new CustomFieldForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a source control for name', async () => {
    const element = await fixture<CustomFieldForm>(
      html`<foxy-custom-field-form></foxy-custom-field-form>`
    );
    const control = element.renderRoot.querySelector('foxy-internal-source-control[infer="name"]');
    expect(control).to.exist;
  });

  it('renders a source control for value', async () => {
    const element = await fixture<CustomFieldForm>(
      html`<foxy-custom-field-form></foxy-custom-field-form>`
    );
    const control = element.renderRoot.querySelector('foxy-internal-source-control[infer="value"]');
    expect(control).to.exist;
  });

  it('renders a checkbox group control for visibility', async () => {
    const element = await fixture<CustomFieldForm>(
      html`<foxy-custom-field-form></foxy-custom-field-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-checkbox-group-control[infer="visibility"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.exist;
    expect(control).to.have.deep.property('options', [{ label: 'option_hidden', value: 'hidden' }]);

    expect(control.getValue()).to.deep.equal([]);
    element.edit({ is_hidden: true });
    expect(control.getValue()).to.deep.equal(['hidden']);
    control.setValue([]);
    expect(element).to.have.nested.property('form.is_hidden', false);
  });
});
