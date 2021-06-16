import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders busy horizontal layout by default', async () => {
    const template = html`<foxy-spinner></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('layout', 'horizontal');
    expect(element).to.have.property('state', 'busy');
    expect(element).to.have.property('lang', '');

    expect(text).to.have.attribute('lang', '');
    expect(text).to.have.attribute('key', 'loading_busy');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('active');
    expect(icon).to.have.property('localName', 'paper-spinner-lite');
  });

  it('passes lang down to children', async () => {
    const template = html`<foxy-spinner lang="en-AU"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');

    expect(text).to.have.attribute('lang', 'en-AU');
  });

  it('renders busy state', async () => {
    const template = html`<foxy-spinner state="busy"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('state', 'busy');

    expect(text).to.have.attribute('lang', element.lang);
    expect(text).to.have.attribute('key', 'loading_busy');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('active');
    expect(icon).to.have.property('localName', 'paper-spinner-lite');
  });

  it('renders end state', async () => {
    const template = html`<foxy-spinner state="end"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('state', 'end');

    expect(text).to.have.attribute('lang', element.lang);
    expect(text).to.have.attribute('key', 'loading_end');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('icon', 'icons:done-all');
    expect(icon).to.have.property('localName', 'iron-icon');
  });

  it('renders error state', async () => {
    const template = html`<foxy-spinner state="error"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('state', 'error');

    expect(text).to.have.attribute('lang', element.lang);
    expect(text).to.have.attribute('key', 'loading_error');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('icon', 'icons:error-outline');
    expect(icon).to.have.property('localName', 'iron-icon');
  });

  it('renders paused state', async () => {
    const template = html`<foxy-spinner state="paused"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('state', 'paused');

    expect(text).to.have.attribute('lang', element.lang);
    expect(text).to.have.attribute('key', 'loading_paused');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('icon', 'icons:more-horiz');
    expect(icon).to.have.property('localName', 'iron-icon');
  });

  it('renders empty state', async () => {
    const template = html`<foxy-spinner state="empty"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('state', 'empty');

    expect(text).to.have.attribute('lang', element.lang);
    expect(text).to.have.attribute('key', 'loading_empty');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('icon', 'icons:info-outline');
    expect(icon).to.have.property('localName', 'iron-icon');
  });

  it('renders horizontal layout', async () => {
    const template = html`<foxy-spinner layout="horizontal"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);

    expect(element.renderRoot.firstElementChild).not.to.have.class('flex-col');
  });

  it('renders vertical layout', async () => {
    const template = html`<foxy-spinner layout="vertical"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);

    expect(element.renderRoot.firstElementChild).to.have.class('flex-col');
  });

  it('renders no-label layout', async () => {
    const template = html`<foxy-spinner layout="no-label"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');

    expect(text).to.have.class('sr-only');
  });
});
