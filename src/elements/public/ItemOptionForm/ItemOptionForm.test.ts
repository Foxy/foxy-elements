import { expect, fixture, html } from '@open-wc/testing';
import { stub } from 'sinon';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { ItemOptionForm } from './index';

describe('ItemOptionForm', () => {
  it('imports and defines foxy-internal-number-control element', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control element', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines itself as foxy-item-option-form', () => {
    expect(customElements.get('foxy-item-option-form')).to.equal(ItemOptionForm);
  });

  it('extends InternalForm', () => {
    expect(new ItemOptionForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace of item-option-form', () => {
    expect(ItemOptionForm).to.have.property('defaultNS', 'item-option-form');
    expect(new ItemOptionForm()).to.have.property('ns', 'item-option-form');
  });

  it('produces an v8n error if item option name is missing', () => {
    const form = new ItemOptionForm();
    expect(ItemOptionForm.v8n.map(fn => fn({}, form))).to.include('name:v8n_required');
  });

  it('produces an v8n error if item option name is too long', () => {
    const name = 'A'.repeat(101);
    const form = new ItemOptionForm();
    expect(ItemOptionForm.v8n.map(fn => fn({ name }, form))).to.include('name:v8n_too_long');
  });

  it('produces an v8n error if item option value is missing', () => {
    const form = new ItemOptionForm();
    expect(ItemOptionForm.v8n.map(fn => fn({}, form))).to.include('value:v8n_required');
  });

  it('produces an v8n error if item option value is too long', () => {
    const value = 'A'.repeat(1025);
    const form = new ItemOptionForm();
    expect(ItemOptionForm.v8n.map(fn => fn({ value }, form))).to.include('value:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new ItemOptionForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders general summary control', async () => {
    const element = await fixture<ItemOptionForm>(
      html`<foxy-item-option-form></foxy-item-option-form>`
    );

    const control = element.renderRoot.querySelector('[infer="general"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders item option name as text control in the general summary', async () => {
    const element = await fixture<ItemOptionForm>(
      html`<foxy-item-option-form></foxy-item-option-form>`
    );

    const control = element.renderRoot.querySelector('[infer="general"] [infer="name"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders item option value as text control in the general summary', async () => {
    const element = await fixture<ItemOptionForm>(
      html`<foxy-item-option-form></foxy-item-option-form>`
    );

    const control = element.renderRoot.querySelector('[infer="general"] [infer="value"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders item option modifications summary control', async () => {
    const element = await fixture<ItemOptionForm>(
      html`<foxy-item-option-form></foxy-item-option-form>`
    );

    const control = element.renderRoot.querySelector('[infer="mods"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders item option price modification as text control in the mods summary', async () => {
    const element = await fixture<ItemOptionForm>(
      html`<foxy-item-option-form></foxy-item-option-form>`
    );

    const control = element.renderRoot.querySelector('[infer="mods"] [infer="price-mod"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders item option weight modification as text control in the mods summary', async () => {
    const element = await fixture<ItemOptionForm>(
      html`<foxy-item-option-form></foxy-item-option-form>`
    );

    const control = element.renderRoot.querySelector('[infer="mods"] [infer="weight-mod"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });
});
