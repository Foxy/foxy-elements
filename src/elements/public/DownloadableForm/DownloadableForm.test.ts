import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { html, expect, fixture } from '@open-wc/testing';
import { DownloadableForm as Form } from './DownloadableForm';
import { createRouter } from '../../../server/hapi/index';
import { stub } from 'sinon';

describe('DownloadableForm', () => {
  it('imports and defines foxy-internal-downloadable-form-upload-control', () => {
    expect(customElements.get('foxy-internal-downloadable-form-upload-control')).to.exist;
  });

  it('imports and defines foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines itself as foxy-downloadable-form', () => {
    expect(customElements.get('foxy-downloadable-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18n namespace "downloadable-form"', () => {
    expect(Form).to.have.property('defaultNS', 'downloadable-form');
    expect(new Form()).to.have.property('ns', 'downloadable-form');
  });

  it('has a reactive property "downloadableItemCategories"', () => {
    expect(new Form()).to.have.property('downloadableItemCategories', null);
    expect(Form).to.have.deep.nested.property('properties.downloadableItemCategories', {
      attribute: 'downloadable-item-categories',
    });
  });

  it('logs a v8n error "item-category-uri:v8n_required" when no item category is selected', () => {
    const form = new Form();
    expect(form.errors).to.include('item-category-uri:v8n_required');

    form.edit({ item_category_uri: 'https://demo.api/hapi/item_categories/0' });
    expect(form.errors).to.not.include('item-category-uri:v8n_required');
  });

  it('logs a v8n error "upload:v8n_required" when no file is selected', () => {
    const form = new Form();
    expect(form.errors).to.include('upload:v8n_required');

    form.edit({ file_name: 'test_file.png' });
    expect(form.errors).to.not.include('upload:v8n_required');
  });

  it('logs a v8n error "price:v8n_required" when no price is provided', () => {
    const form = new Form();
    expect(form.errors).to.include('price:v8n_required');

    form.edit({ price: 25 });
    expect(form.errors).to.not.include('price:v8n_required');
  });

  it('logs a v8n error "price:v8n_negative" when price is < 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('price:v8n_negative');

    form.edit({ price: -25 });
    expect(form.errors).to.include('price:v8n_negative');

    form.edit({ price: 25 });
    expect(form.errors).to.not.include('price:v8n_negative');
  });

  it('logs a v8n error "name:v8n_required" when no name is provided', () => {
    const form = new Form();
    expect(form.errors).to.include('name:v8n_required');

    form.edit({ name: 'Test Downloadable' });
    expect(form.errors).to.not.include('name:v8n_required');
  });

  it('logs a v8n error "name:v8n_too_long" when name is longer than 100 characters', () => {
    const form = new Form();
    expect(form.errors).to.not.include('name:v8n_too_long');

    form.edit({ name: 'Test Downloadable' });
    expect(form.errors).to.not.include('name:v8n_too_long');

    form.edit({ name: 'A'.repeat(100) });
    expect(form.errors).to.not.include('name:v8n_too_long');

    form.edit({ name: 'A'.repeat(101) });
    expect(form.errors).to.include('name:v8n_too_long');
  });

  it('logs a v8n error "code:v8n_required" when no code is provided', () => {
    const form = new Form();
    expect(form.errors).to.include('code:v8n_required');

    form.edit({ code: 'TEST_DOWNLOADABLE' });
    expect(form.errors).to.not.include('code:v8n_required');
  });

  it('logs a v8n error "code:v8n_too_long" when code is longer than 50 characters', () => {
    const form = new Form();
    expect(form.errors).to.not.include('code:v8n_too_long');

    form.edit({ code: 'TEST_DOWNLOADABLE' });
    expect(form.errors).to.not.include('code:v8n_too_long');

    form.edit({ code: 'A'.repeat(50) });
    expect(form.errors).to.not.include('code:v8n_too_long');

    form.edit({ code: 'A'.repeat(51) });
    expect(form.errors).to.include('code:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a foxy-internal-resource-picker-control for item category uri', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-downloadable-form
        downloadable-item-categories="https://demo.api/hapi/item_categories"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-downloadable-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="group-one"] foxy-internal-resource-picker-control[infer="item-category-uri"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/item_categories');
  });

  it('renders a foxy-internal-text-control for name', async () => {
    const element = await fixture<Form>(html`<foxy-downloadable-form></foxy-downloadable-form>`);
    const control = element.renderRoot.querySelector('[infer="group-one"] [infer="name"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for code', async () => {
    const element = await fixture<Form>(html`<foxy-downloadable-form></foxy-downloadable-form>`);
    const control = element.renderRoot.querySelector('[infer="group-one"] [infer="code"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-number-control for price', async () => {
    const element = await fixture<Form>(html`<foxy-downloadable-form></foxy-downloadable-form>`);
    const control = element.renderRoot.querySelector('[infer="group-two"] [infer="price"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-number-control'));
    expect(control).to.have.attribute('min', '0');
  });

  it('renders a foxy-internal-downloadable-form-upload-control for file', async () => {
    const element = await fixture<Form>(html`<foxy-downloadable-form></foxy-downloadable-form>`);
    const control = element.renderRoot.querySelector('[infer="group-three"] [infer="upload"]');
    expect(control).to.be.instanceOf(
      customElements.get('foxy-internal-downloadable-form-upload-control')
    );
  });
});
