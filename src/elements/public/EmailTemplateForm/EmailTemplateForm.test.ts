import type { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { EmailTemplateForm as Form } from './EmailTemplateForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('EmailTemplateForm', () => {
  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
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

  it('imports and defines foxy-internal-email-template-form-async-action', () => {
    expect(customElements.get('foxy-internal-email-template-form-async-action')).to.exist;
  });

  it('defines itself as foxy-email-template-form', () => {
    expect(customElements.get('foxy-email-template-form')).to.equal(Form);
  });

  it('has a reactive property "defaultSubject"', () => {
    expect(new Form()).to.have.property('defaultSubject', null);
    expect(Form.properties).to.have.deep.property('defaultSubject', {
      attribute: 'default-subject',
    });
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18next namespace of "email-template-form"', () => {
    expect(new Form().ns).to.equal('email-template-form');
    expect(Form.defaultNS).to.equal('email-template-form');
  });

  it('makes Cache buttons disabled when content_html_url or content_text_url are not set in data or when form is dirty', async () => {
    const form = new Form();
    expect(form.disabledSelector.matches('html-source:cache', true)).to.be.true;
    expect(form.disabledSelector.matches('text-source:cache', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/email_templates/0');
    data.subject = 'baz';

    data.content_html_url = '';
    data.content_text_url = '';
    form.data = { ...data };
    expect(form.disabledSelector.matches('html-source:cache', true)).to.be.true;
    expect(form.disabledSelector.matches('text-source:cache', true)).to.be.true;

    data.content_html_url = 'foo';
    data.content_text_url = 'bar';
    form.data = { ...data };
    expect(form.disabledSelector.matches('html-source:cache', true)).to.be.false;
    expect(form.disabledSelector.matches('text-source:cache', true)).to.be.false;

    form.edit({ subject: 'qux' });
    expect(form.disabledSelector.matches('html-source:cache', true)).to.be.true;
    expect(form.disabledSelector.matches('text-source:cache', true)).to.be.true;
  });

  it('disables template controls when subject is not set', () => {
    const form = new Form();
    expect(form.disabledSelector.matches('general:template-language', true)).to.be.true;
    expect(form.disabledSelector.matches('html-source', true)).to.be.true;
    expect(form.disabledSelector.matches('text-source', true)).to.be.true;
    expect(form.disabledSelector.matches('content-html', true)).to.be.true;
    expect(form.disabledSelector.matches('content-text', true)).to.be.true;

    form.edit({ subject: 'foo' });
    expect(form.disabledSelector.matches('general:template-language', true)).to.be.false;
    expect(form.disabledSelector.matches('html-source', true)).to.be.false;
    expect(form.disabledSelector.matches('text-source', true)).to.be.false;
    expect(form.disabledSelector.matches('content-html', true)).to.be.false;
    expect(form.disabledSelector.matches('content-text', true)).to.be.false;
  });

  it('hides Cache HTML button when content_html_url is not set in data', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('html-source:cache', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/email_templates/0');
    data.subject = 'foo';

    data.content_html_url = '';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('html-source:cache', true)).to.be.true;

    data.content_html_url = 'foo';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('html-source:cache', true)).to.be.false;
  });

  it('hides Cache Text button when content_text_url is not set in data', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('text-source:cache', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/email_templates/0');
    data.subject = 'foo';

    data.content_text_url = '';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('text-source:cache', true)).to.be.true;

    data.content_text_url = 'foo';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('text-source:cache', true)).to.be.false;
  });

  it('hides template controls when subject is not set both in data and form edits', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('general:template-language', true)).to.be.true;
    expect(form.hiddenSelector.matches('general:subject', true)).to.be.true;
    expect(form.hiddenSelector.matches('html-source', true)).to.be.true;
    expect(form.hiddenSelector.matches('text-source', true)).to.be.true;
    expect(form.hiddenSelector.matches('content-html', true)).to.be.true;
    expect(form.hiddenSelector.matches('content-html-warning', true)).to.be.true;
    expect(form.hiddenSelector.matches('content-text', true)).to.be.true;
    expect(form.hiddenSelector.matches('content-text-warning', true)).to.be.true;

    form.edit({
      content_html_url: 'https://example.com',
      content_text_url: 'https://example.com',
      content_html: '<p>Test</p>',
      content_text: 'Test',
      subject: 'foo',
    });

    expect(form.hiddenSelector.matches('general:template-language', true)).to.be.false;
    expect(form.hiddenSelector.matches('general:subject', true)).to.be.false;
    expect(form.hiddenSelector.matches('html-source', true)).to.be.false;
    expect(form.hiddenSelector.matches('text-source', true)).to.be.false;
    expect(form.hiddenSelector.matches('content-html', true)).to.be.false;
    expect(form.hiddenSelector.matches('content-html-warning', true)).to.be.false;
    expect(form.hiddenSelector.matches('content-text', true)).to.be.false;
    expect(form.hiddenSelector.matches('content-text-warning', true)).to.be.false;
  });

  it('hides html content field warning when html content url is not set or when html content is unchanged otherwise', async () => {
    const form = new Form();
    form.edit({ subject: 'Test' });
    expect(form.hiddenSelector.matches('content-html-warning', true)).to.be.true;

    form.edit({ content_html_url: 'https://example.com' });
    expect(form.hiddenSelector.matches('content-html-warning', true)).to.be.false;

    form.edit({ content_html: '' });
    expect(form.hiddenSelector.matches('content-html-warning', true)).to.be.true;

    form.edit({ content_html: '<p>Test</p>' });
    expect(form.hiddenSelector.matches('content-html-warning', true)).to.be.false;
  });

  it('hides text content field warning when text content url is not set or when text content is unchanged otherwise', async () => {
    const form = new Form();
    form.edit({ subject: 'Test' });
    expect(form.hiddenSelector.matches('content-text-warning', true)).to.be.true;

    form.edit({ content_text_url: 'https://example.com' });
    expect(form.hiddenSelector.matches('content-text-warning', true)).to.be.false;

    form.edit({ content_text: '' });
    expect(form.hiddenSelector.matches('content-text-warning', true)).to.be.true;

    form.edit({ content_text: 'Test' });
    expect(form.hiddenSelector.matches('content-text-warning', true)).to.be.false;
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders General summary', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector('[infer="general"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders a text control for Description in General summary', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="description"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a switch control for On/Off Toggle in General summary', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="general"] foxy-internal-switch-control[infer="toggle"]'
    );

    expect(control).to.exist;
    form.edit({ subject: '' });
    expect(control?.getValue()).to.be.false;

    control?.setValue(true);
    expect(control?.getValue()).to.be.true;
    expect(form.form.subject).to.equal('general.subject.default_value');

    control?.setValue(false);
    expect(control?.getValue()).to.be.false;
    expect(form.form.subject).to.equal('');

    form.defaultSubject = 'Receipt ({{ order_id }})';
    control?.setValue(true);
    expect(control?.getValue()).to.be.true;
    expect(form.form.subject).to.equal('Receipt ({{ order_id }})');
  });

  it('renders a text control for Subject in General summary', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="subject"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a select control for Template Language in General summary', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-email-template-form
        href="https://demo.api/hapi/email_templates/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-email-template-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();

    const control = form.renderRoot.querySelector<HTMLSelectElement>(
      '[infer="general"] foxy-internal-select-control[infer="template-language"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { rawLabel: 'Nunjucks', value: 'nunjucks' },
      { rawLabel: 'Handlebars', value: 'handlebars' },
      { rawLabel: 'Pug', value: 'pug' },
      { rawLabel: 'Twig', value: 'twig' },
      { rawLabel: 'EJS', value: 'ejs' },
    ]);
  });

  it('renders a default slot', async () => {
    const form = await fixture<Form>(html` <foxy-email-template-form></foxy-email-template-form> `);
    expect(form.renderRoot.querySelector('slot:not([name])')).to.exist;
  });

  it('renders a source control for HTML Content', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector('[infer="content-html"]');
    expect(control?.localName).to.equal('foxy-internal-source-control');
  });

  it('renders a warning text for HTML Content', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const wrapper = form.renderRoot.querySelector('[infer="content-html-warning"]');
    const text = wrapper?.querySelector('foxy-i18n[infer=""][key="text"]');
    expect(text).to.exist;
  });

  it('renders a summary control for HTML Source', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector('[infer="html-source"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders a text control for HTML Content URL in HTML Source summary', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector(
      '[infer="html-source"] foxy-internal-text-control[infer="content-html-url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders an async action control for caching HTML Content in HTML Source summary', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-email-template-form
        href="https://demo.api/hapi/email_templates/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-email-template-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector(
      '[infer="html-source"] foxy-internal-email-template-form-async-action[infer="cache"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('theme', 'tertiary-inline');
    expect(control).to.have.attribute('href', form.data!._links['fx:cache'].href);
  });

  it('renders a source control for Text Content', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector('[infer="content-text"]');
    expect(control?.localName).to.equal('foxy-internal-source-control');
  });

  it('renders a warning text for Text Content', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const wrapper = form.renderRoot.querySelector('[infer="content-text-warning"]');
    const text = wrapper?.querySelector('foxy-i18n[infer=""][key="text"]');
    expect(text).to.exist;
  });

  it('renders a summary control for Text Source', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector('[infer="text-source"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders a text control for Text Content URL in Text Source summary', async () => {
    const form = await fixture<Form>(html`<foxy-email-template-form></foxy-email-template-form>`);
    const control = form.renderRoot.querySelector(
      '[infer="text-source"] foxy-internal-text-control[infer="content-text-url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders an async action control for caching Text Content in Text Source summary', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-email-template-form
        href="https://demo.api/hapi/email_templates/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-email-template-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector(
      '[infer="text-source"] foxy-internal-email-template-form-async-action[infer="cache"]'
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
        <foxy-email-template-form
          parent="https://demo.api/hapi/email_templates"
          @fetch=${(evt: FetchEvent) => {
            if (evt.defaultPrevented) return;
            requests.push(evt.request);
            router.handleEvent(evt);
          }}
        >
        </foxy-email-template-form>
      `
    );

    form.edit({
      content_html_url: 'https://example.com',
      content_text_url: 'https://example.com',
      subject: 'Test',
    });

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
        <foxy-email-template-form
          href="https://demo.api/hapi/email_templates/0"
          @fetch=${(evt: FetchEvent) => {
            if (evt.defaultPrevented) return;
            requests.push(evt.request);
            router.handleEvent(evt);
          }}
        >
        </foxy-email-template-form>
      `
    );

    await waitUntil(() => !!form.data, '', { timeout: 5000 });

    form.edit({
      content_html_url: 'https://example.com',
      content_text_url: 'https://example.com',
      subject: 'Test',
    });

    requests.length = 0;
    form.submit();
    await waitUntil(() => requests.length >= 3, '', { timeout: 5000 });
    const cacheRequest = requests.find(
      req => req.method === 'POST' && req.url === form.data?._links['fx:cache'].href
    );

    expect(cacheRequest).to.exist;
  });
});
