import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html } from 'lit-html';
import { stub } from 'sinon';
import { createRouter } from '../../../server/index';
import { CollectionPage } from '../CollectionPage/CollectionPage';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ApiBrowser } from './index';
import { InternalApiBrowserResourceForm } from './internal/InternalApiBrowserResourceForm/InternalApiBrowserResourceForm';

describe('ApiBrowser', () => {
  it('imports and defines vaadin-text-field', () => {
    expect(customElements.get('vaadin-text-field')).to.exist;
  });

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines iron-icon', () => {
    expect(customElements.get('iron-icon')).to.exist;
  });

  it('imports and defines foxy-collection-page', () => {
    expect(customElements.get('foxy-collection-page')).to.exist;
  });

  it('imports and defines foxy-pagination', () => {
    expect(customElements.get('foxy-pagination')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-api-browser-resource-form', () => {
    expect(customElements.get('foxy-internal-api-browser-resource-form')).to.exist;
  });

  it('imports and defines itself as foxy-api-browser', () => {
    expect(customElements.get('foxy-api-browser')).to.equal(ApiBrowser);
  });

  it('has a reactive property "home" (String, null by default)', () => {
    expect(ApiBrowser).to.have.nested.property('properties.home.type', String);
    expect(new ApiBrowser()).to.have.property('home', null);
  });

  it('has a default i18n namespace "api-browser"', () => {
    expect(ApiBrowser).to.have.property('defaultNS', 'api-browser');
    expect(new ApiBrowser()).to.have.property('ns', 'api-browser');
  });

  it('renders Go Back button', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const button = element.renderRoot.querySelector('vaadin-button[title="go_back"]');
    expect(button).to.exist;
  });

  it("disables Go Back button when there's nothing in the history to go back to", async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const button = element.renderRoot.querySelector('vaadin-button[title="go_back"]');
    expect(button).to.have.property('disabled', true);
  });

  it('enables Go Back button when the history has entries', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    const pagination = element.renderRoot.querySelector('foxy-pagination')!;
    const page = pagination.querySelector<CollectionPage<any>>('foxy-collection-page')!;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const item = page.querySelector<InternalApiBrowserResourceForm>(
      'foxy-internal-api-browser-resource-form'
    )!;

    const data = item.data as Resource<Rels.Customer>;
    const newHref = data._links['fx:default_payment_method'].href;

    item.dispatchEvent(
      new CustomEvent('navigate:get', {
        bubbles: true,
        detail: newHref,
        cancelable: true,
      })
    );

    await element.updateComplete;

    const button = element.renderRoot.querySelector('vaadin-button[title="go_back"]');
    expect(button).to.have.property('disabled', false);
  });

  it('navigates back when Go Back button is clicked', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    const pagination = element.renderRoot.querySelector('foxy-pagination')!;
    const page = pagination.querySelector<CollectionPage<any>>('foxy-collection-page')!;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const item = page.querySelector<InternalApiBrowserResourceForm>(
      'foxy-internal-api-browser-resource-form'
    )!;

    const data = item.data as Resource<Rels.Customer>;
    const newHref = data._links['fx:default_payment_method'].href;

    item.dispatchEvent(
      new CustomEvent('navigate:get', {
        bubbles: true,
        detail: newHref,
        cancelable: true,
      })
    );

    await element.updateComplete;

    const button = element.renderRoot.querySelector(
      'vaadin-button[title="go_back"]'
    ) as HTMLButtonElement;

    button.click();

    expect(element).to.have.property('parent', '');
    expect(element).to.have.property('href', 'https://demo.api/hapi/customers');
  });

  it('renders Go Home button', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const button = element.renderRoot.querySelector('vaadin-button[title="go_home"]');
    expect(button).to.exist;
  });

  it('disables Go Home button on home page', async () => {
    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/stores/0"
          home="https://demo.api/hapi/stores/0"
        >
        </foxy-api-browser>
      `
    );

    const button = element.renderRoot.querySelector('vaadin-button[title="go_home"]');
    expect(button).to.have.attribute('disabled');
  });

  it('enables Go Home button when not on home page', async () => {
    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers/0"
          home="https://demo.api/hapi/stores/0"
        >
        </foxy-api-browser>
      `
    );

    const button = element.renderRoot.querySelector('vaadin-button[title="go_home"]');
    expect(button).to.not.have.attribute('disabled');
  });

  it('navigates home when Go Home button is clicked', async () => {
    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers/0"
          home="https://demo.api/hapi/stores/0"
        >
        </foxy-api-browser>
      `
    );

    const button = element.renderRoot.querySelector(
      'vaadin-button[title="go_home"]'
    ) as HTMLButtonElement;

    button.click();

    expect(element).to.have.property('href', 'https://demo.api/hapi/stores/0');
  });

  it('renders Current URL text field', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const field = element.renderRoot.querySelector('vaadin-text-field[aria-label="current_url"]');
    expect(field).to.exist;
  });

  it('changes .href when user types into Current URL field in GET mode', async () => {
    const element = await fixture<ApiBrowser>(
      html`<foxy-api-browser href="https://demo.api/hapi/stores/0"></foxy-api-browser>`
    );

    const field = element.renderRoot.querySelector(
      'vaadin-text-field[aria-label="current_url"]'
    ) as HTMLInputElement;

    field.value = 'https://demo.api/hapi/customers/0';
    field.dispatchEvent(new CustomEvent('input'));
    await new Promise(r => setTimeout(r, 500));

    expect(element).to.have.property('parent', '');
    expect(element).to.have.property('href', 'https://demo.api/hapi/customers/0');
  });

  it('changes .parent when user types into Current URL field in POST mode', async () => {
    const element = await fixture<ApiBrowser>(
      html`<foxy-api-browser parent="https://demo.api/hapi/stores"></foxy-api-browser>`
    );

    const field = element.renderRoot.querySelector(
      'vaadin-text-field[aria-label="current_url"]'
    ) as HTMLInputElement;

    field.value = 'https://demo.api/hapi/customers';
    field.dispatchEvent(new CustomEvent('input'));
    await new Promise(r => setTimeout(r, 500));

    expect(element).to.have.property('parent', 'https://demo.api/hapi/customers');
    expect(element).to.have.property('href', '');
  });

  it('renders Refresh button', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const button = element.renderRoot.querySelector('vaadin-button[title="refresh"]');
    expect(button).to.exist;
  });

  it('calls .refresh() when Refresh button is clicked', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const refreshMethod = stub(element, 'refresh');
    const button = element.renderRoot.querySelector(
      'vaadin-button[title="refresh"]'
    ) as HTMLButtonElement;

    button.click();
    expect(refreshMethod).to.have.been.calledOnce;
    refreshMethod.restore();
  });

  it('renders GET Mode button', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const button = element.renderRoot.querySelector('vaadin-button[title="get_mode"]');
    expect(button).to.exist;
  });

  it('renders POST Mode button', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const button = element.renderRoot.querySelector('vaadin-button[title="post_mode"]');
    expect(button).to.exist;
  });

  it('renders an expanded resource form targeting "parent" when "href" is null', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser></foxy-api-browser>`);
    const form = element.renderRoot.querySelector('foxy-internal-api-browser-resource-form');

    expect(form).to.exist;
    expect(form).to.have.property('open', true);
    expect(form).to.have.property('infer', '');
    expect(form).to.have.property('parent', '');

    element.parent = 'https://demo.api/hapi/customers';
    await element.updateComplete;

    expect(form).to.have.property('parent', 'https://demo.api/hapi/customers');
  });

  it('sets "href" when resource form POSTs to an endpoint', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          parent="https://demo.api/hapi/customers"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    const form = element.renderRoot.querySelector(
      'foxy-internal-api-browser-resource-form'
    ) as NucleonElement<any>;

    form.undo();
    form.edit({ email: 'test@test.com', first_name: 'test', last_name: 'test' });
    form.submit();

    await waitUntil(() => form.in({ idle: 'snapshot' }));
    await element.updateComplete;

    expect(element).to.have.property('href', form.data._links.self.href);
    expect(element).to.have.property('parent', '');
  });

  it('renders an expanded resource form targeting "href" when it\'s set', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    const form = element.renderRoot.querySelector('foxy-internal-api-browser-resource-form');

    expect(form).to.exist;
    expect(form).to.have.property('open', true);
    expect(form).to.have.property('href', 'https://demo.api/hapi/customers/0');
    expect(form).to.have.property('infer', '');
    expect(form).to.have.property('parent', '');
  });

  it('renders foxy-pagination with foxy-collection-page and collapsed resource forms for collections', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    const pagination = element.renderRoot.querySelector('foxy-pagination')!;
    const page = pagination.querySelector<CollectionPage<any>>('foxy-collection-page')!;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const items = page.querySelectorAll('foxy-internal-api-browser-resource-form');

    expect(pagination).to.exist;
    expect(pagination).to.have.property('first', 'https://demo.api/hapi/customers');
    expect(pagination).to.have.property('infer', '');

    expect(page).to.exist;
    expect(page).to.have.property('infer', '');

    const data = element.data as Resource<Rels.Customers>;
    expect(items).to.have.length(data.returned_items);

    for (let i = 0; i < data.returned_items; ++i) {
      const dataItem = data._embedded['fx:customers'][i];
      const domItem = items[i];

      expect(domItem).to.have.property('href', dataItem._links.self.href);
      expect(domItem).to.have.property('infer', '');
    }
  });

  it('can navigate to a related resource', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    const pagination = element.renderRoot.querySelector('foxy-pagination')!;
    const page = pagination.querySelector<CollectionPage<any>>('foxy-collection-page')!;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const item = page.querySelector<InternalApiBrowserResourceForm>(
      'foxy-internal-api-browser-resource-form'
    )!;

    const data = item.data as Resource<Rels.Customer>;
    const newHref = data._links['fx:default_payment_method'].href;

    item.dispatchEvent(
      new CustomEvent('navigate:get', {
        bubbles: true,
        detail: newHref,
        cancelable: true,
      })
    );

    expect(element).to.have.property('parent', '');
    expect(element).to.have.property('href', newHref);
  });

  it('can prepare a POST request to a related resource', async () => {
    const router = createRouter();

    const element = await fixture<ApiBrowser>(
      html`
        <foxy-api-browser
          href="https://demo.api/hapi/customers"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-api-browser>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    const pagination = element.renderRoot.querySelector('foxy-pagination')!;
    const page = pagination.querySelector<CollectionPage<any>>('foxy-collection-page')!;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const item = page.querySelector<InternalApiBrowserResourceForm>(
      'foxy-internal-api-browser-resource-form'
    )!;

    const data = item.data as Resource<Rels.Customer>;
    const newParent = data._links['fx:default_payment_method'].href;

    item.dispatchEvent(
      new CustomEvent('navigate:post', {
        bubbles: true,
        detail: newParent,
        cancelable: true,
      })
    );

    expect(element).to.have.property('parent', newParent);
    expect(element).to.have.property('href', '');
  });

  it('disables all buttons and fields when the element is disabled', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser disabled></foxy-api-browser>`);
    const controls = element.renderRoot.querySelectorAll('vaadin-button, vaadin-text-field');

    for (const control of controls) {
      expect(control).to.have.property('disabled', true);
    }
  });

  it('makes all fields readonly when when the element is readonly', async () => {
    const element = await fixture<ApiBrowser>(html`<foxy-api-browser readonly></foxy-api-browser>`);
    const controls = element.renderRoot.querySelectorAll('vaadin-text-field');

    for (const control of controls) {
      expect(control).to.have.property('readonly', true);
    }
  });
});
