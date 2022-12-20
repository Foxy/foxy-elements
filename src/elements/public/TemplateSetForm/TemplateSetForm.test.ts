import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import { TemplateSetForm as Form } from './TemplateSetForm';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { getByTestId } from '../../../testgen/getByTestId';
import { I18nEditor } from '../I18nEditor/I18nEditor';
import { stub } from 'sinon';

describe('TemplateSetForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-internal-async-combo-box-control element', () => {
    const constructor = customElements.get('foxy-internal-async-combo-box-control');
    expect(constructor).to.equal(InternalAsyncComboBoxControl);
  });

  it('imports and registers foxy-internal-select-control element', () => {
    const constructor = customElements.get('foxy-internal-select-control');
    expect(constructor).to.equal(InternalSelectControl);
  });

  it('imports and registers foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.equal(InternalTextControl);
  });

  it('imports and registers foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and registers foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.equal(InternalForm);
  });

  it('imports and registers foxy-i18n-editor element', () => {
    expect(customElements.get('foxy-i18n-editor')).to.equal(I18nEditor);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers itself as foxy-template-set-form', () => {
    expect(customElements.get('foxy-template-set-form')).to.equal(Form);
  });

  it('has a default i18n namespace "template-set-form"', () => {
    expect(Form.defaultNS).to.equal('template-set-form');
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a reactive property paymentMethodSets (String, attribute payment-method-sets)', () => {
    expect(new Form()).to.have.property('paymentMethodSets', null);
    expect(Form).to.have.nested.property('properties.paymentMethodSets');
    expect(Form).to.have.nested.property(
      'properties.paymentMethodSets.attribute',
      'payment-method-sets'
    );
  });

  it('has a reactive property languageStrings (String, attribute language-strings)', () => {
    expect(new Form()).to.have.property('languageStrings', null);
    expect(Form).to.have.nested.property('properties.languageStrings');
    expect(Form).to.have.nested.property(
      'properties.languageStrings.attribute',
      'language-strings'
    );
  });

  it('has a reactive property localeCodes (String, attribute locale-codes)', () => {
    expect(new Form()).to.have.property('localeCodes', null);
    expect(Form).to.have.nested.property('properties.localeCodes');
    expect(Form).to.have.nested.property('properties.localeCodes.attribute', 'locale-codes');
  });

  it('has a reactive property languages (String, attribute languages)', () => {
    expect(new Form()).to.have.property('languages', null);
    expect(Form).to.have.nested.property('properties.languages');
  });

  it('renders a textbox for code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-template-set-form
        href="https://demo.api/hapi/template_sets/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="code"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a textbox for description', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-template-set-form
        href="https://demo.api/hapi/template_sets/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="description"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a select dropdown for language', async () => {
    const router = createRouter();

    const helperHref = 'https://demo.api/hapi/property_helpers/6';
    const helper = await getTestData<Resource<Rels.Languages>>(helperHref, router);
    const options = Object.entries(helper.values).map(v => ({ value: v[0], label: v[1] }));

    const element = await fixture<Form>(html`
      <foxy-template-set-form
        languages=${helperHref}
        href="https://demo.api/hapi/template_sets/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    const root = element.renderRoot;
    const control = root.querySelector<InternalSelectControl>('[infer="language"]')!;

    await waitUntil(() => !!element.data && control.options.length > 0, '', { timeout: 5000 });

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', options);
  });

  it('renders a select dropdown for locale code', async () => {
    const router = createRouter();

    const helperHref = 'https://demo.api/hapi/property_helpers/7';
    const helper = await getTestData<Resource<Rels.LocaleCodes>>(helperHref, router);
    const options = Object.entries(helper.values).map(v => ({ value: v[0], label: v[1] }));

    const element = await fixture<Form>(html`
      <foxy-template-set-form
        locale-codes=${helperHref}
        href="https://demo.api/hapi/template_sets/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    const root = element.renderRoot;
    const control = root.querySelector<InternalSelectControl>('[infer="locale-code"]')!;

    await waitUntil(() => !!element.data && control.options.length > 0, '', { timeout: 5000 });

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', options);
  });

  it('renders a combobox dropdown for payment method set', async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/template_sets/0', router);
    const element = await fixture<Form>(html`
      <foxy-template-set-form
        payment-method-sets="https://demo.api/hapi/payment_method_sets"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    data.payment_method_set_uri = 'https://demo.api/hapi/payment_method_sets/0';
    element.data = data;
    await element.updateComplete;

    const root = element.renderRoot;
    const control = root.querySelector<InternalAsyncComboBoxControl>(
      '[infer="payment-method-set-uri"]'
    )!;

    await waitUntil(() => !!control.selectedItem);

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'description');
    expect(control).to.have.attribute('item-id-path', '_links.self.href');
    expect(control).to.have.attribute('first', element.paymentMethodSets as string);
    expect(control).to.have.deep.property(
      'selectedItem',
      await getTestData(data.payment_method_set_uri, router)
    );
  });

  it('renders i18n editor in snapshot state', async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/template_sets/0', router);
    const element = await fixture<Form>(html`
      <foxy-template-set-form
        language-strings="https://demo.api/hapi/property_helpers/10"
        href="https://demo.api/hapi/template_sets/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const root = element.renderRoot;
    const editor = root.querySelector<I18nEditor>('[infer="language-overrides"]')!;

    expect(editor).to.exist;
    expect(editor).to.be.instanceOf(I18nEditor);
    expect(editor).to.have.attribute('selected-language', data.language);
    expect(editor).to.have.attribute('href', element.languageStrings as string);
    expect(editor).to.have.attribute(
      'language-overrides',
      data._links['fx:language_overrides'].href
    );
  });

  it('renders slots or templates before and after i18n editor in snapshot state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-template-set-form
        language-strings="https://demo.api/hapi/property_helpers/10"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    stub(element, 'renderTemplateOrSlot').callsFake(
      (name?: string) => html`<div data-testid="template-or-slot-${name}"></div>`
    );

    element.href = 'https://demo.api/hapi/template_sets/0';
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(await getByTestId(element, 'template-or-slot-language-overrides:before')).to.exist;
    expect(await getByTestId(element, 'template-or-slot-language-overrides:after')).to.exist;
  });

  it('hides i18n editor in snapshot state if hidden selector matches language-overrides', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-template-set-form
        language-strings="https://demo.api/hapi/property_helpers/10"
        hiddencontrols="language-overrides"
        href="https://demo.api/hapi/template_sets/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-set-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const root = element.renderRoot;
    const editor = root.querySelector<I18nEditor>('[infer="language-overrides"]')!;

    expect(editor).to.not.exist;
  });
});
