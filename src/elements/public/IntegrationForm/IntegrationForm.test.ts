import type { Data, PostResponseData } from './types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { IntegrationForm as Form } from './IntegrationForm';
import { InternalTextAreaControl } from '../../internal/InternalTextAreaControl/InternalTextAreaControl';
import { InternalDeleteControl } from '../../internal/InternalDeleteControl/InternalDeleteControl';
import { InternalCreateControl } from '../../internal/InternalCreateControl/InternalCreateControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { getByTestId } from '../../../testgen/getByTestId';
import { stub } from 'sinon';

describe('IntegrationForm', () => {
  it('imports and registers vaadin-button element', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and registers foxy-internal-text-area-control element', () => {
    const constructor = customElements.get('foxy-internal-text-area-control');
    expect(constructor).to.equal(InternalTextAreaControl);
  });

  it('imports and registers foxy-internal-delete-control element', () => {
    const constructor = customElements.get('foxy-internal-delete-control');
    expect(constructor).to.equal(InternalDeleteControl);
  });

  it('imports and registers foxy-internal-create-control element', () => {
    const constructor = customElements.get('foxy-internal-create-control');
    expect(constructor).to.equal(InternalCreateControl);
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

  it('imports and registers itself as foxy-integration-form', () => {
    expect(customElements.get('foxy-integration-form')).to.equal(Form);
  });

  it('has a default i18n namespace "integration-form"', () => {
    expect(Form.defaultNS).to.equal('integration-form');
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('renders a textbox for project name in template state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    const control = element.renderRoot.querySelector('[infer="project-name"]');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a textarea for project description in template state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    const control = element.renderRoot.querySelector('[infer="project-description"]');
    expect(control).to.be.instanceOf(InternalTextAreaControl);
  });

  it('renders Create button in template state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    const control = element.renderRoot.querySelector('[infer="create"]');
    expect(control).to.be.instanceOf(InternalCreateControl);
  });

  it('renders project name and description in snapshot state', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<Form>(html`
      <foxy-integration-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    data.project_name = 'Test project name';
    data.project_description = 'Test project description';
    element.data = data;
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Test project name');
    expect(element.renderRoot).to.include.text('Test project description');
  });

  it('hides project name and description in snapshot state if header is hidden', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<Form>(html`
      <foxy-integration-form
        hiddencontrols="header"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    data.project_name = 'Test project name';
    data.project_description = 'Test project description';
    element.data = data;
    await element.requestUpdate();

    expect(element.renderRoot).to.not.include.text('Test project name');
    expect(element.renderRoot).to.not.include.text('Test project description');
  });

  it('renders project description in snapshot state', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<Form>(html`
      <foxy-integration-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    data.project_description = 'Test project description';
    element.data = data;
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Test project description');
  });

  it('renders slots or templates before and after header in snapshot state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    stub(element, 'renderTemplateOrSlot').callsFake(
      (name?: string) => html`<div data-testid="template-or-slot-${name}"></div>`
    );

    element.href = 'https://demo.api/hapi/integrations/0';
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(await getByTestId(element, 'template-or-slot-header:before')).to.exist;
    expect(await getByTestId(element, 'template-or-slot-header:after')).to.exist;
  });

  it('renders a message with an action button on POST success', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const message = element.renderRoot.querySelector('foxy-i18n[infer="message"][key="text"]');
    const messageAction = await getByTestId(element, 'message-action');
    const messageActionLabel = messageAction?.querySelector(
      'foxy-i18n[infer="message"][key="action"]'
    );

    expect(message).to.exist;
    expect(messageAction).to.exist;
    expect(messageAction).to.be.instanceOf(customElements.get('vaadin-button'));
    expect(messageAction).to.not.have.attribute('disabled');
    expect(messageActionLabel).to.exist;
  });

  it('renders slots or templates before and after the POST message', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    stub(element, 'renderTemplateOrSlot').callsFake(
      (name?: string) => html`<div data-testid="template-or-slot-${name}"></div>`
    );

    element.edit({ project_name: 'Test project' });
    element.submit();
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(await getByTestId(element, 'template-or-slot-message:before')).to.exist;
    expect(await getByTestId(element, 'template-or-slot-message:after')).to.exist;
  });

  it('disables the action in the POST message when targeted with disabledSelector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        disabledcontrols="message"
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const messageAction = await getByTestId(element, 'message-action');
    expect(messageAction).to.have.attribute('disabled');
  });

  it('hides the POST message when targeted with hiddenSelector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        hiddencontrols="message"
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const message = element.renderRoot.querySelector('foxy-i18n[infer="message"][key="text"]');
    const messageAction = await getByTestId(element, 'message-action');

    expect(message).to.not.exist;
    expect(messageAction).to.not.exist;
  });

  it('hides the POST message on action button click', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    let messageAction = await getByTestId(element, 'message-action');
    messageAction?.click();
    await element.requestUpdate();

    const message = element.renderRoot.querySelector('foxy-i18n[infer="message"][key="text"]');
    messageAction = await getByTestId(element, 'message-action');

    expect(message).to.not.exist;
    expect(messageAction).to.not.exist;
  });

  it('renders integration summary in a table', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<Form>(html`
      <foxy-integration-form href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const table = element.renderRoot.querySelector('table')!;

    const addedByLabel = table.rows[0].cells[0].querySelector('foxy-i18n[infer="table"]');
    const addedByValue = table.rows[0].cells[1];

    expect(addedByLabel).to.have.attribute('key', 'added_by');
    expect(addedByValue).to.include.text(data.added_by_name);

    const contactLabel = table.rows[1].cells[0].querySelector('foxy-i18n[infer="table"]');
    const contactValue = table.rows[1].cells[1];

    expect(contactValue).to.include.text(data.contact_name);
    expect(contactLabel).to.have.attribute('key', 'contact');

    const companyLabel = table.rows[2].cells[0].querySelector('foxy-i18n[infer="table"]');
    const companyValue = table.rows[2].cells[1];

    expect(companyLabel).to.have.attribute('key', 'company');
    expect(companyValue).to.include.text(data.company_name);

    const expiresLabel = table.rows[3].cells[0].querySelector('foxy-i18n[infer="table"]');
    const expiresValue = table.rows[3].cells[1].querySelector('foxy-i18n[infer="table"]');

    expect(expiresLabel).to.have.attribute('key', 'expires');
    expect(expiresValue).to.have.attribute('key', 'expires_date');
    expect(expiresValue).to.have.deep.property('options', { date: new Date(data.expires * 1000) });

    const clientIdLabel = table.rows[4].cells[0];
    const clientIdValue = table.rows[4].cells[1];

    expect(clientIdLabel).to.include.text('Client ID');
    expect(clientIdValue).to.include.text(data.client_id);

    const scopeLabel = table.rows[5].cells[0];
    const scopeValue = table.rows[5].cells[1];

    expect(scopeLabel).to.include.text('Scope');
    expect(scopeValue).to.include.text(data.scope);
  });

  it('renders emails and urls in integration summary as links if possible', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<Form>(html`
      <foxy-integration-form href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-form>
    `);

    data.added_by_email = 'test@test.com';
    data.contact_email = 'foo@bar.test';
    data.company_url = 'https://example.com';

    element.data = data;
    await element.requestUpdate();
    const table = element.renderRoot.querySelector('table')!;

    const addedByValue = table.rows[0].cells[1].querySelector('a');
    expect(addedByValue).to.have.attribute('href', `mailto:${data.added_by_email}`);

    const contactValue = table.rows[1].cells[1].querySelector('a');
    expect(contactValue).to.have.attribute('href', `mailto:${data.contact_email}`);

    const companyValue = table.rows[2].cells[1].querySelector('a');
    expect(companyValue).to.have.attribute('href', data.company_url);
  });

  it('renders client credentials from POST result in the table', async () => {
    const router = createRouter();

    const handlePostRequest = async (evt: FetchEvent) => {
      const demoApiResponse = (await router.handleRequest(evt.request)!.handlerPromise) as Response;
      const newIntegration = (await demoApiResponse.json()) as Data;
      const postResponseData: PostResponseData = {
        _links: newIntegration._links,
        client_id: newIntegration.client_id,
        client_secret: 'test_client_secret',
        refresh_token: 'test_refresh_token',
        access_token: 'test_access_token',
        message: 'Integration created successfully.',
      };

      return new Response(JSON.stringify(postResponseData));
    };

    const element = await fixture<Form>(html`
      <foxy-integration-form
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => {
          if (
            evt.request.method === 'POST' &&
            evt.request.url === 'https://demo.api/hapi/integrations'
          ) {
            evt.respondWith(handlePostRequest(evt));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const table = element.renderRoot.querySelector('table')!;

    const clientSecretLabel = table.rows[5].cells[0];
    const clientSecretValue = table.rows[5].cells[1];

    expect(clientSecretLabel).to.include.text('Client secret');
    expect(clientSecretValue).to.include.text('test_client_secret');

    const refreshTokenLabel = table.rows[6].cells[0];
    const refreshTokenValue = table.rows[6].cells[1];

    expect(refreshTokenLabel).to.include.text('Refresh token');
    expect(refreshTokenValue).to.include.text('test_refresh_token');

    const accessTokenLabel = table.rows[7].cells[0];
    const accessTokenValue = table.rows[7].cells[1];

    expect(accessTokenLabel).to.include.text('Access token');
    expect(accessTokenValue).to.include.text('test_access_token');
  });

  it('renders copy-to-clipboard buttons next to client credentials in the table', async () => {
    const router = createRouter();

    const handlePostRequest = async (evt: FetchEvent) => {
      const demoApiResponse = (await router.handleRequest(evt.request)!.handlerPromise) as Response;
      const newIntegration = (await demoApiResponse.json()) as Data;
      const postResponseData: PostResponseData = {
        _links: newIntegration._links,
        client_id: newIntegration.client_id,
        client_secret: 'test_client_secret',
        refresh_token: 'test_refresh_token',
        access_token: 'test_access_token',
        message: 'Integration created successfully.',
      };

      return new Response(JSON.stringify(postResponseData));
    };

    const element = await fixture<Form>(html`
      <foxy-integration-form
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => {
          if (
            evt.request.method === 'POST' &&
            evt.request.url === 'https://demo.api/hapi/integrations'
          ) {
            evt.respondWith(handlePostRequest(evt));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const table = element.renderRoot.querySelector('table')!;

    const clientSecretCopyButton = table.rows[5].cells[1].querySelector('foxy-copy-to-clipboard');
    const refreshTokenCopyButton = table.rows[6].cells[1].querySelector('foxy-copy-to-clipboard');
    const accessTokenCopyButton = table.rows[7].cells[1].querySelector('foxy-copy-to-clipboard');

    expect(clientSecretCopyButton).to.have.attribute('infer', 'copy-to-clipboard');
    expect(clientSecretCopyButton).to.have.attribute('text', 'test_client_secret');

    expect(refreshTokenCopyButton).to.have.attribute('infer', 'copy-to-clipboard');
    expect(refreshTokenCopyButton).to.have.attribute('text', 'test_refresh_token');

    expect(accessTokenCopyButton).to.have.attribute('infer', 'copy-to-clipboard');
    expect(accessTokenCopyButton).to.have.attribute('text', 'test_access_token');
  });

  it('removes client credentials from the table once message action button is clicked', async () => {
    const router = createRouter();

    const handlePostRequest = async (evt: FetchEvent) => {
      const demoApiResponse = (await router.handleRequest(evt.request)!.handlerPromise) as Response;
      const newIntegration = (await demoApiResponse.json()) as Data;
      const postResponseData: PostResponseData = {
        _links: newIntegration._links,
        client_id: newIntegration.client_id,
        client_secret: 'test_client_secret',
        refresh_token: 'test_refresh_token',
        access_token: 'test_access_token',
        message: 'Integration created successfully.',
      };

      return new Response(JSON.stringify(postResponseData));
    };

    const element = await fixture<Form>(html`
      <foxy-integration-form
        parent="https://demo.api/hapi/integrations"
        @fetch=${(evt: FetchEvent) => {
          if (
            evt.request.method === 'POST' &&
            evt.request.url === 'https://demo.api/hapi/integrations'
          ) {
            evt.respondWith(handlePostRequest(evt));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-integration-form>
    `);

    element.edit({ project_name: 'Test project' });
    element.submit();

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const messageAction = (await getByTestId(element, 'message-action'))!;

    messageAction.click();
    await element.requestUpdate();
    const table = element.renderRoot.querySelector('table')!;

    expect(table.rows[5]?.cells[0]).to.not.include.text('Client secret');
    expect(table.rows[6]?.cells[0]).to.not.exist;
    expect(table.rows[7]?.cells[0]).to.not.exist;
  });

  it('renders slots or templates before and after the summary table', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        href="https://demo.api/hapi/integrations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    stub(element, 'renderTemplateOrSlot').callsFake(
      (name?: string) => html`<div data-testid="template-or-slot-${name}"></div>`
    );

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(await getByTestId(element, 'template-or-slot-table:before')).to.exist;
    expect(await getByTestId(element, 'template-or-slot-table:after')).to.exist;
  });

  it('hides the summary table when targeted with hiddenSelector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        hiddencontrols="table"
        href="https://demo.api/hapi/integrations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(element.renderRoot.querySelector('table')).to.be.null;
  });

  it('renders Delete button in snapshot state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-integration-form
        href="https://demo.api/hapi/integrations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-integration-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="delete"]');
    expect(control).to.be.instanceOf(InternalDeleteControl);
  });
});
