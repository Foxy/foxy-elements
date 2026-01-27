import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { html, expect, fixture } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { ClientForm as Form } from './ClientForm';
import { stub } from 'sinon';
import { Data } from './types';

describe('ClientForm', () => {
  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines itself as foxy-client-form', () => {
    expect(customElements.get('foxy-client-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18n namespace "client-form"', () => {
    expect(Form).to.have.property('defaultNS', 'client-form');
    expect(new Form()).to.have.property('ns', 'client-form');
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a foxy-internal-summary-control for general section', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="general"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-summary-control'));
  });

  it('renders a foxy-internal-summary-control for project section', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="project"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-summary-control'));
  });

  it('renders a foxy-internal-summary-control for company section', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="company"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-summary-control'));
  });

  it('renders a foxy-internal-summary-control for contact section', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="contact"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-summary-control'));
  });

  it('renders a foxy-internal-text-control for client id', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="general"] [infer="client-id"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for client secret', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="general"] [infer="client-secret"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for redirect uri', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="general"] [infer="redirect-uri"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for project name', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="project"] [infer="project-name"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for project description', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="project"] [infer="project-description"]'
    );
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for company name', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="company"] [infer="company-name"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for company url', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="company"] [infer="company-url"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for company logo', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="company"] [infer="company-logo"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for contact name', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="contact"] [infer="contact-name"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for contact email', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="contact"] [infer="contact-email"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('renders a foxy-internal-text-control for contact phone', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const control = element.renderRoot.querySelector('[infer="contact"] [infer="contact-phone"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-text-control'));
  });

  it('always marks client secret control as readonly', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    expect(element.readonlySelector.matches('general:client-secret', true)).to.be.true;
  });

  it('marks client id control as readonly when loaded', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    expect(element.readonlySelector.matches('general:client-id', true)).to.be.false;
    element.data = await getTestData('./hapi/clients/0');
    expect(element.readonlySelector.matches('general:client-id', true)).to.be.true;
  });

  it('marks client id control as readonly when loading', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-client-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-client-form>
    `);

    expect(element.readonlySelector.matches('general:client-id', true)).to.be.false;
    element.href = 'https://demo.api/virtual/stall';
    await element.requestUpdate();
    expect(element.readonlySelector.matches('general:client-id', true)).to.be.true;
  });

  it('hides client secret control when empty', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    expect(element.hiddenSelector.matches('general:client-secret', true)).to.be.true;
  });

  it('uses custom options for header subtitle', async () => {
    const element = await fixture<Form>(html`<foxy-client-form></foxy-client-form>`);
    const data = await getTestData<Data>('./hapi/clients/0');

    data.redirect_uri = 'https://demo.api/redirect';
    element.data = data;

    expect(element.headerSubtitleOptions).to.deep.equal({
      context: 'with_domain',
      domain: 'demo.api',
    });
  });
});
