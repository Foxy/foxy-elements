import type { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import type { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { FilterAttributeForm as Form } from './FilterAttributeForm';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';

describe('FilterAttributeForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('defines foxy-internal-filter-attribute-form-action-control', () => {
    const localName = 'foxy-internal-filter-attribute-form-action-control';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines foxy-internal-text-control', () => {
    const localName = 'foxy-internal-text-control';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines foxy-internal-form', () => {
    const localName = 'foxy-internal-form';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines foxy-query-builder', () => {
    const localName = 'foxy-query-builder';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines itself as foxy-filter-attribute-form', () => {
    const localName = 'foxy-filter-attribute-form';
    expect(customElements.get(localName)).to.equal(Form);
  });

  it('has a static property "attributeVisibility"', () => {
    expect(Form).to.have.property('attributeVisibility', 'restricted');
  });

  it('has a static property "filterQueryKey"', () => {
    expect(Form).to.have.property('filterQueryKey', 'filter_query');
  });

  it('has a static property "attributeName"', () => {
    expect(Form).to.have.property('attributeName', 'foxy-admin-bookmark');
  });

  it('has a static property "filterNameKey"', () => {
    expect(Form).to.have.property('filterNameKey', 'filter_name');
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "filter-attribute-form"', () => {
    expect(Form).to.have.property('defaultNS', 'filter-attribute-form');
    expect(new Form()).to.have.property('ns', 'filter-attribute-form');
  });

  it('has a reactive property "pathname"', async () => {
    expect(Form).to.have.deep.nested.property('properties.pathname', {});

    const layout = html`<foxy-filter-attribute-form></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);
    expect(element).to.have.deep.property('pathname', null);

    element.edit({ value: '/?filter_name=foo' });
    element.pathname = '/abc/d';
    await element.requestUpdate();
    expect(element).to.have.nested.property('form.value', '/abc/d?filter_name=foo');
  });

  it('has a reactive property "options"', () => {
    expect(Form).to.have.deep.nested.property('properties.options', { type: Array });
    expect(new Form()).to.have.deep.property('options', []);
  });

  it('renders query builder', async () => {
    const layout = html`<foxy-filter-attribute-form pathname="/foo"></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<QueryBuilder>('[infer="filter-query"]')!;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(customElements.get('foxy-query-builder'));

    const options: Form['options'] = [];
    element.options = options;
    await element.requestUpdate();
    expect(control).to.have.property('options', options);

    element.edit({ value: '/foo?filter_query=color%3Dred' });
    await element.requestUpdate();
    expect(control).to.have.property('value', 'color=red');

    control.value = 'color=green';
    control.dispatchEvent(new CustomEvent('change'));
    expect(element).to.have.nested.property('form.value', '/foo?filter_query=color%3Dgreen');
  });

  it('renders name field', async () => {
    const layout = html`<foxy-filter-attribute-form pathname="/bar"></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalTextControl>('[infer="filter-name"]')!;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));

    element.edit({ value: '/bar?filter_name=my+filter' });
    expect(control.getValue()).to.equal('my filter');

    control.setValue('foo bar baz');
    expect(element).to.have.nested.property('form.value', '/bar?filter_name=foo+bar+baz');
  });

  it('renders action', async () => {
    const layout = html`<foxy-filter-attribute-form></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-filter-attribute-form-action-control[infer="action"]'
    )!;

    expect(control).to.exist;
  });

  it('hides filter name until the attribute is created', async () => {
    const layout = html`<foxy-filter-attribute-form></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);

    expect(element.hiddenSelector.matches('filter-name', true)).to.be.true;
    element.data = await getTestData('./hapi/store_attributes/0');
    expect(element.hiddenSelector.matches('filter-name', true)).to.be.false;
  });

  it('hides action when appropriate', async () => {
    const layout = html`<foxy-filter-attribute-form></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);

    expect(element.hiddenSelector.matches('action', true)).to.be.true;
    element.data = await getTestData('./hapi/store_attributes/0');
    expect(element.hiddenSelector.matches('action', true)).to.be.false;
    element.edit({ value: '' });
    expect(element.hiddenSelector.matches('action', true)).to.be.true;
  });

  it('uses fixed visibility and attribute name when creating a resource', async () => {
    const layout = html`<foxy-filter-attribute-form
      parent="https://demo.api/hapi/store_attributes"
    ></foxy-filter-attribute-form>`;

    const element = await fixture<Form>(layout);
    const whenEventCaptured = oneEvent(element, 'fetch');

    element.edit({ value: '/?filter_query=test' });
    element.submit();

    const event = (await whenEventCaptured) as unknown as FetchEvent;
    const json = await event.request.clone().json();

    expect(json).to.have.property('visibility', 'restricted');
    expect(json).to.have.property('name', 'foxy-admin-bookmark');
  });
});
