import type { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { FilterAttributeForm as Form } from './FilterAttributeForm';
import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { Type } from '../QueryBuilder/types';
import { createRouter } from '../../../server';
import { stub } from 'sinon';

describe('FilterAttributeForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('defines vaadin-button', () => {
    const localName = 'vaadin-button';
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

  it('defines foxy-i18n', () => {
    const localName = 'foxy-i18n';
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

  it('has a reactive property "defaults"', () => {
    expect(Form).to.have.deep.nested.property('properties.defaults', {});
    expect(new Form()).to.have.property('defaults', null);
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

  it('has a reactive property "docsHref"', () => {
    expect(Form).to.have.deep.nested.property('properties.docsHref', { attribute: 'docs-href' });
    expect(new Form()).to.have.property('docsHref', null);
  });

  it('has a reactive property "options"', () => {
    expect(Form).to.have.deep.nested.property('properties.options', { type: Array });
    expect(new Form()).to.have.deep.property('options', []);
  });

  it('renders query builder', async () => {
    const element = await fixture<Form>(html`
      <foxy-filter-attribute-form pathname="/foo" defaults="color=blue">
      </foxy-filter-attribute-form>
    `);

    const control = element.renderRoot.querySelector<QueryBuilder>('[infer="filter-query"]')!;
    expect(control).to.exist;
    expect(control).to.be.instanceOf(customElements.get('foxy-query-builder'));
    expect(control).to.have.property('value', 'color=blue');
    expect(control).to.have.property('disableZoom', true);

    const options: Form['options'] = [{ type: Type.String, label: 'option_color', path: 'color' }];
    element.options = options;
    element.docsHref = 'https://example.com';
    await element.requestUpdate();
    expect(control).to.have.deep.property('options', options);
    expect(control).to.have.property('docsHref', 'https://example.com');

    element.edit({ value: '/foo?filter_query=color%3Dred' });
    await element.requestUpdate();
    expect(control).to.have.property('value', 'color=red');

    control.value = 'color=green';
    control.dispatchEvent(new CustomEvent('change'));
    expect(element).to.have.nested.property('form.value', '/foo?filter_query=color%3Dgreen');
  });

  it('renders header in template state', async () => {
    const layout = html`<foxy-filter-attribute-form
      pathname="/stores/0/transactions"
    ></foxy-filter-attribute-form>`;
    const element = await fixture<Form>(layout);
    expect(element.renderRoot.querySelector('foxy-i18n[infer="header"][key="title"]')).to.exist;
  });

  it('renders name field in snapshot state', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-filter-attribute-form
        pathname="/stores/0/transactions"
        href="https://demo.api/hapi/store_attributes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-filter-attribute-form>
    `;

    const element = await fixture<Form>(layout);
    await waitUntil(() => element.in('idle'));
    const input = element.renderRoot.querySelector<HTMLInputElement>(
      'input[aria-label="filter-name.label"]'
    )!;

    element.edit({ value: '/stores/0/transactions?filter_name=my+filter' });
    await element.requestUpdate();
    expect(input.value).to.equal('my filter');

    input.value = 'foo bar baz';
    input.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.nested.property(
      'form.value',
      '/stores/0/transactions?filter_name=foo+bar+baz'
    );
  });

  it('renders Reset button when appropriate', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-filter-attribute-form
        pathname="/stores/0/transactions"
        href="https://demo.api/hapi/store_attributes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-filter-attribute-form>
    `);

    await waitUntil(() => element.in('idle'));
    let button = element.renderRoot.querySelector('vaadin-button[aria-label="action.reset"]');
    expect(button).to.not.exist;

    element.edit({ value: '/stores/0/transactions?filter_name=my+filter' });
    await element.requestUpdate();
    button = element.renderRoot.querySelector('vaadin-button[aria-label="action.reset"]');
    expect(button).to.exist;

    const undoMethod = stub(element, 'undo');
    button?.dispatchEvent(new CustomEvent('click'));
    expect(undoMethod).to.have.been.calledOnce;
  });

  it('renders Update button when appropriate', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-filter-attribute-form
        pathname="/stores/0/transactions"
        href="https://demo.api/hapi/store_attributes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-filter-attribute-form>
    `);

    await waitUntil(() => element.in('idle'));
    let caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="update"]');
    let button = caption?.closest('vaadin-button');
    expect(button).to.not.exist;

    element.edit({ value: '/stores/0/transactions?filter_name=my+filter' });
    await element.requestUpdate();
    caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="update"]');
    button = caption?.closest('vaadin-button');
    expect(button).to.exist;

    const submitMethod = stub(element, 'submit');
    button?.dispatchEvent(new CustomEvent('click'));
    expect(submitMethod).to.have.been.calledOnce;
  });

  it('renders Delete button when appropriate', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-filter-attribute-form
        pathname="/stores/0/transactions"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-filter-attribute-form>
    `);

    let caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="delete"]');
    let button = caption?.closest('vaadin-button');
    expect(button).to.not.exist;

    element.href = 'https://demo.api/hapi/store_attributes/0';
    await waitUntil(() => element.in('idle'));
    caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="delete"]');
    button = caption?.closest('vaadin-button');
    expect(button).to.exist;

    const deleteMethod = stub(element, 'delete');
    button?.dispatchEvent(new CustomEvent('click'));
    expect(deleteMethod).to.have.been.calledOnce;
  });

  it('renders Create button when appropriate', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-filter-attribute-form
        pathname="/stores/0/transactions"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-filter-attribute-form>
    `);

    let caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="create"]');
    let button = caption?.closest('vaadin-button');
    expect(button).to.not.exist;

    element.edit({ value: '/stores/0/transactions?filter_name=my+filter&filter_query=color=red' });
    await element.requestUpdate();
    caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="create"]');
    button = caption?.closest('vaadin-button');
    expect(button).to.exist;

    const submitMethod = stub(element, 'submit');
    button?.dispatchEvent(new CustomEvent('click'));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
    element.href = 'https://demo.api/hapi/store_attributes/0';
    await waitUntil(() => element.in('idle'));
    caption = element.renderRoot.querySelector('foxy-i18n[infer="action"][key="create"]');
    button = caption?.closest('vaadin-button');
    expect(button).to.not.exist;
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
