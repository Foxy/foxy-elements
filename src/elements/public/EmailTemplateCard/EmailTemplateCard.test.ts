import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { EmailTemplateCard } from './EmailTemplateCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { I18n } from '../I18n/I18n';

describe('EmailTemplateCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and registers itself as foxy-email-template-card', () => {
    expect(customElements.get('foxy-email-template-card')).to.equal(EmailTemplateCard);
  });

  it('has a default i18n namespace "email-template-card"', () => {
    expect(EmailTemplateCard.defaultNS).to.equal('email-template-card');
  });

  it('extends TwoLineCard', () => {
    expect(new EmailTemplateCard()).to.be.instanceOf(TwoLineCard);
  });

  it('renders template description in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text(data.description);
  });

  it('supports default template type', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    data.content_html = '';
    data.content_text = '';
    data.content_html_url = '';
    data.content_text_url = '';
    element.data = { ...data };

    expect(await getByKey(element, 'type_default')).to.exist;
    expect(await getByKey(element, 'type_default')).to.have.attribute('infer', '');
  });

  it('supports custom html template type', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    data.content_html = '<div>Test</div>';
    data.content_text = '';
    data.content_html_url = '';
    data.content_text_url = '';
    element.data = { ...data };

    expect(await getByKey(element, 'type_custom_html')).to.exist;
    expect(await getByKey(element, 'type_custom_html')).to.have.attribute('infer', '');
  });

  it('supports custom text template type', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    data.content_html = '';
    data.content_text = 'Test';
    data.content_html_url = '';
    data.content_text_url = '';
    element.data = { ...data };

    expect(await getByKey(element, 'type_custom_text')).to.exist;
    expect(await getByKey(element, 'type_custom_text')).to.have.attribute('infer', '');
  });

  it('supports custom html url template type', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    data.content_html = '';
    data.content_text = '';
    data.content_html_url = 'https://example.com/template.html';
    data.content_text_url = '';
    element.data = { ...data };

    expect(await getByKey(element, 'type_custom_html_url')).to.exist;
    expect(await getByKey(element, 'type_custom_html_url')).to.have.attribute('infer', '');
  });

  it('supports custom text url template type', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    data.content_html = '';
    data.content_text = '';
    data.content_html_url = '';
    data.content_text_url = 'https://example.com/template.txt';
    element.data = { ...data };

    expect(await getByKey(element, 'type_custom_text_url')).to.exist;
    expect(await getByKey(element, 'type_custom_text_url')).to.have.attribute('infer', '');
  });

  it('supports mixed template type', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/email_templates/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<EmailTemplateCard>(html`
      <foxy-email-template-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-email-template-card>
    `);

    data.content_html = '<div>Test</div>';
    data.content_text = '';
    data.content_html_url = '';
    data.content_text_url = 'https://example.com/template.txt';
    element.data = { ...data };

    expect(await getByKey(element, 'type_mixed')).to.exist;
    expect(await getByKey(element, 'type_mixed')).to.have.attribute('infer', '');
  });
});
