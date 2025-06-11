import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { TemplateForm as Form } from './TemplateForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('TemplateForm', () => {
  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-template-form-async-action', () => {
    expect(customElements.get('foxy-internal-template-form-async-action')).to.exist;
  });

  it('defines itself as foxy-template-form', () => {
    expect(customElements.get('foxy-template-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18next namespace of "template-form"', () => {
    expect(new Form().ns).to.equal('template-form');
    expect(Form.defaultNS).to.equal('template-form');
  });

  it('makes Cache button disabled when content_url is not set in data or when form is dirty', async () => {
    const form = new Form();
    expect(form.disabledSelector.matches('source:cache', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/cart_templates/0');
    data.content_url = '';
    form.data = { ...data };
    expect(form.disabledSelector.matches('source:cache', true)).to.be.true;

    data.content_url = 'foo';
    form.data = { ...data };
    expect(form.disabledSelector.matches('source:cache', true)).to.be.false;
  });

  it('hides Cache HTML button when content_url is not set in data', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('source:cache', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/cart_templates/0');
    data.content_url = '';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('source:cache', true)).to.be.true;

    data.content_url = 'foo';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('source:cache', true)).to.be.false;
  });

  it('hides content field warning when content url is not set or when content is unchanged otherwise', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('content-warning', true)).to.be.true;

    form.edit({ content_url: 'https://example.com' });
    expect(form.hiddenSelector.matches('content-warning', true)).to.be.false;

    form.edit({ content: '' });
    expect(form.hiddenSelector.matches('content-warning', true)).to.be.true;

    form.edit({ content: '<p>Test</p>' });
    expect(form.hiddenSelector.matches('content-warning', true)).to.be.false;
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders General summary', async () => {
    const form = await fixture<Form>(html`<foxy-template-form></foxy-template-form>`);
    const control = form.renderRoot.querySelector('[infer="general"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders a text control for Description in General summary', async () => {
    const form = await fixture<Form>(html`<foxy-template-form></foxy-template-form>`);
    const control = form.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="description"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a default slot', async () => {
    const form = await fixture<Form>(html` <foxy-template-form></foxy-template-form> `);
    expect(form.renderRoot.querySelector('slot:not([name])')).to.exist;
  });

  it('renders a source control for Content', async () => {
    const form = await fixture<Form>(html`<foxy-template-form></foxy-template-form>`);
    const control = form.renderRoot.querySelector('[infer="content"]');
    expect(control?.localName).to.equal('foxy-internal-source-control');
  });

  it('renders a warning text for Content', async () => {
    const form = await fixture<Form>(html`<foxy-template-form></foxy-template-form>`);
    const wrapper = form.renderRoot.querySelector('[infer="content-warning"]');
    const text = wrapper?.querySelector('foxy-i18n[infer=""][key="text"]');
    expect(text).to.exist;
  });

  it('renders a summary control for Source', async () => {
    const form = await fixture<Form>(html`<foxy-template-form></foxy-template-form>`);
    const control = form.renderRoot.querySelector('[infer="source"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders a text control for Content URL in Source summary', async () => {
    const form = await fixture<Form>(html`<foxy-template-form></foxy-template-form>`);
    const control = form.renderRoot.querySelector(
      '[infer="source"] foxy-internal-text-control[infer="content-url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders an async action control for caching Content in Source summary', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-template-form
        href="https://demo.api/hapi/cart_templates/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-template-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector(
      '[infer="source"] foxy-internal-template-form-async-action[infer="cache"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('theme', 'tertiary-inline');
    expect(control).to.have.attribute('href', form.data!._links['fx:cache'].href);
  });

  it('caches content on POST', async () => {
    const requests: Request[] = [];
    const router = createRouter();
    const form = await fixture<Form>(
      html`
        <foxy-template-form
          parent="https://demo.api/hapi/cart_templates"
          @fetch=${(evt: FetchEvent) => {
            if (evt.defaultPrevented) return;
            requests.push(evt.request);
            router.handleEvent(evt);
          }}
        >
        </foxy-template-form>
      `
    );

    form.edit({ content_url: 'https://example.com' });
    requests.length = 0;
    form.submit();
    await waitUntil(() => requests.length >= 3, '', { timeout: 5000 });
    const cacheRequest = requests.find(
      req => req.method === 'POST' && req.url === form.data?._links['fx:cache'].href
    );

    expect(cacheRequest).to.exist;
  });

  it('caches content on PATCH', async () => {
    const requests: Request[] = [];
    const router = createRouter();
    const form = await fixture<Form>(
      html`
        <foxy-template-form
          href="https://demo.api/hapi/cart_templates/0"
          @fetch=${(evt: FetchEvent) => {
            if (evt.defaultPrevented) return;
            requests.push(evt.request);
            router.handleEvent(evt);
          }}
        >
        </foxy-template-form>
      `
    );

    await waitUntil(() => !!form.data, '', { timeout: 5000 });

    form.edit({ content_url: 'https://example.com' });
    requests.length = 0;
    form.submit();
    await waitUntil(() => requests.length >= 3, '', { timeout: 5000 });
    const cacheRequest = requests.find(
      req => req.method === 'POST' && req.url === form.data?._links['fx:cache'].href
    );

    expect(cacheRequest).to.exist;
  });
});
