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

    expect(icon).to.have.property('localName', 'svg');
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

    expect(icon).to.have.property('localName', 'svg');
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

  it('defaults errorType to generic', async () => {
    const element = await fixture<Spinner>(html`<foxy-spinner></foxy-spinner>`);
    expect(element).to.have.property('errorType', 'generic');
  });

  it('renders the access-denied error type', async () => {
    const template = html`<foxy-spinner state="error" error-type="access-denied"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');
    const icon = element.renderRoot.querySelector('[data-testid="icon"]');

    expect(element).to.have.property('state', 'error');
    expect(element).to.have.property('errorType', 'access-denied');

    expect(text).to.have.attribute('lang', element.lang);
    expect(text).to.have.attribute('key', 'loading_access_denied');
    expect(text).to.have.attribute('ns', 'spinner');
    expect(text).to.have.property('localName', 'foxy-i18n');

    expect(icon).to.have.attribute('icon', 'icons:block');
    expect(icon).to.have.property('localName', 'iron-icon');
  });

  it('ignores errorType in states other than error', async () => {
    const template = html`<foxy-spinner state="busy" error-type="access-denied"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');

    expect(text).to.have.attribute('key', 'loading_busy');
  });

  it('falls back to the generic message for an unknown error type', async () => {
    const template = html`<foxy-spinner state="error" error-type="wat"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);
    const text = element.renderRoot.querySelector('[data-testid="text"]');

    expect(text).to.have.attribute('key', 'loading_error');
  });

  it('re-renders when errorType changes after first render', async () => {
    const template = html`<foxy-spinner state="error"></foxy-spinner>`;
    const element = await fixture<Spinner>(template);

    expect(element.renderRoot.querySelector('[data-testid="text"]')).to.have.attribute(
      'key',
      'loading_error'
    );

    element.errorType = 'access-denied';
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[data-testid="text"]')).to.have.attribute(
      'key',
      'loading_access_denied'
    );
  });

  it('does not infer errorType from an ancestor', async () => {
    // Inference lands after lit commits bindings and would overwrite the explicit
    // value the call sites pass. See Task 3 note 2.
    expect(Spinner.inferredProperties).to.not.include('errorType');
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

  it('renders horizonal layout', async () => {
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
