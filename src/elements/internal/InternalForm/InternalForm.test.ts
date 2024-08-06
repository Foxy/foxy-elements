import { ButtonElement } from '@vaadin/vaadin-button';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html, render } from 'lit-html';
import { spy, stub } from 'sinon';
import { createRouter } from '../../../server/index';
import { getByKey } from '../../../testgen/getByKey';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { InternalForm } from './index';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';

describe('InternalForm', () => {
  it('imports and registers foxy-internal-timestamps-control', () => {
    expect(customElements.get('foxy-internal-timestamps-control')).to.exist;
  });

  it('imports and registers foxy-internal-submit-control', () => {
    expect(customElements.get('foxy-internal-submit-control')).to.exist;
  });

  it('imports and registers foxy-internal-undo-control', () => {
    expect(customElements.get('foxy-internal-undo-control')).to.exist;
  });

  it('imports and registers foxy-internal-delete-control', () => {
    expect(customElements.get('foxy-internal-delete-control')).to.exist;
  });

  it('imports and registers foxy-copy-to-clipboard', () => {
    expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
  });

  it('imports and registers foxy-spinner', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and registers foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and registers itself as foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.equal(InternalForm);
  });

  it('has a static property "generalErrorPrefix" set to "error:"', () => {
    expect(InternalForm.generalErrorPrefix).to.equal('error:');
  });

  it('extends NucleonElement', () => {
    expect(new InternalForm()).to.be.instanceOf(NucleonElement);
  });

  it('has a reactive property "status" that defaults to null', async () => {
    expect(InternalForm).to.have.deep.nested.property('properties.status', { type: Object });
    expect(new InternalForm()).to.have.property('status', null);
  });

  it('has a placeholder .renderHeaderActions() method that renders nothing', async () => {
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    const data = await getTestData<any>('./hapi/customers/0');
    expect(element.renderHeaderActions(data)).to.equal(null);
  });

  it('renders a configurable title in the optional header', async () => {
    const root = document.createElement('div');
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    render(element.renderHeader(), root);
    let title = root.querySelector(`foxy-i18n[infer="header"][key="${element.headerTitleKey}"]`);

    expect(title).to.exist;
    expect(title).to.have.deep.property('options', element.headerTitleOptions);

    element.data = await getTestData<any>('./hapi/customers/0');
    render(element.renderHeader(), root);

    title = root.querySelector(`foxy-i18n[infer="header"][key="${element.headerTitleKey}"]`);
    expect(title).to.exist;
    expect(title).to.have.deep.property('options', element.headerTitleOptions);
  });

  it('when loaded, renders a configurable subtitle in the optional header', async () => {
    const root = document.createElement('div');
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    render(element.renderHeader(), root);

    let subtitle = root.querySelector(
      `foxy-i18n[infer="header"][key="${element.headerSubtitleKey}"]`
    );

    expect(subtitle).to.not.exist;

    element.data = await getTestData<any>('./hapi/customers/0');
    render(element.renderHeader(), root);

    subtitle = root.querySelector(`foxy-i18n[infer="header"][key="${element.headerSubtitleKey}"]`);
    expect(subtitle).to.exist;
    expect(subtitle).to.have.deep.property('options', element.headerSubtitleOptions);
  });

  it('when loaded, renders a Copy ID button in the optional header', async () => {
    const root = document.createElement('div');
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    render(element.renderHeader(), root);
    let copyButton = root.querySelector('foxy-copy-to-clipboard[infer="header copy-id"]');
    expect(copyButton).to.not.exist;

    element.data = await getTestData<any>('./hapi/customers/0');
    render(element.renderHeader(), root);
    copyButton = root.querySelector('foxy-copy-to-clipboard[infer="header copy-id"]');
    expect(copyButton).to.exist;
    expect(copyButton).to.have.attribute('text', String(element.headerCopyIdValue));
  });

  it('when loaded, renders a Copy JSON button in the optional header', async () => {
    const root = document.createElement('div');
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    render(element.renderHeader(), root);
    let copyButton = root.querySelector('foxy-copy-to-clipboard[infer="header copy-json"]');
    expect(copyButton).to.not.exist;

    element.data = await getTestData<any>('./hapi/customers/0');
    render(element.renderHeader(), root);
    copyButton = root.querySelector('foxy-copy-to-clipboard[infer="header copy-json"]');
    expect(copyButton).to.exist;
    expect(copyButton).to.have.attribute('text', JSON.stringify(element.data, null, 2));
  });

  it('has a .renderBody() method rendering timestamps and an appropriate action control', async () => {
    const root = document.createElement('div');
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    render(element.renderBody(), root);

    expect(root.querySelector('foxy-internal-submit-control[infer="submit"]')).to.exist;
    expect(root.querySelector('foxy-internal-submit-control[infer="create"]')).to.exist;
    expect(root.querySelector('foxy-internal-delete-control[infer="delete"]')).to.exist;
    expect(root.querySelector('foxy-internal-undo-control[infer="undo"]')).to.exist;
    expect(root.querySelector('foxy-internal-timestamps-control[infer="timestamps"]')).to.exist;
  });

  it('calls .renderBody() while rendering the rest of the form', async () => {
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form></foxy-internal-form>`
    );

    const root = element.renderRoot;
    const renderBodyMethod = spy(element, 'renderBody');

    await element.requestUpdate();

    expect(renderBodyMethod).to.have.been.called;
    expect(root.querySelector('foxy-internal-submit-control[infer="create"]')).to.exist;
    expect(root.querySelector('foxy-internal-delete-control[infer="delete"]')).to.exist;
    expect(root.querySelector('foxy-internal-timestamps-control[infer="timestamps"]')).to.exist;
    expect(root.querySelector('foxy-internal-undo-control[infer="undo"]')).to.exist;
    expect(root.querySelector('foxy-internal-submit-control[infer="submit"]')).to.exist;
  });

  it('renders foxy-spinner in "busy" state while loading data', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-internal-form
        href="https://demo.api/virtual/stall"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-form>
    `;

    const element = await fixture(layout);
    const spinnerWrapper = await getByTestId(element, 'spinner');
    const spinner = spinnerWrapper!.firstElementChild;

    expect(spinnerWrapper).not.to.have.class('opacity-0');
    expect(spinner).to.have.attribute('state', 'busy');
    expect(spinner).to.have.attribute('infer', 'spinner');
  });

  it('renders foxy-spinner in "error" state if loading data fails', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-internal-form
        href="https://demo.api/virtual/empty?status=404"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-form>
    `;

    const element = await fixture<InternalForm<any>>(layout);
    const spinnerWrapper = await getByTestId(element, 'spinner');
    const spinner = spinnerWrapper!.firstElementChild;

    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

    expect(spinnerWrapper).not.to.have.class('opacity-0');
    expect(spinner).to.have.attribute('state', 'error');
    expect(spinner).to.have.attribute('infer', 'spinner');
  });

  it('renders Refresh button if loading data fails', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-internal-form
        href="https://demo.api/virtual/empty?status=404"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-form>
    `;

    const element = await fixture<InternalForm<any>>(layout);
    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

    const caption = await getByKey(element, 'refresh');
    expect(caption).to.exist;
    expect(caption).to.have.attribute('infer', 'spinner');

    const button = caption!.closest('vaadin-button') as ButtonElement;
    const refreshStub = stub(element, 'refresh');
    button.click();
    expect(refreshStub).to.have.been.called;
  });

  it('hides spinner once loaded', async () => {
    const data = await getTestData<any>('./hapi/customer_addresses/0');
    const layout = html`<foxy-internal-form .data=${data}></foxy-internal-form>`;
    const element = await fixture(layout);
    const spinnerWrapper = await getByTestId(element, 'spinner');

    expect(spinnerWrapper).to.have.class('opacity-0');
  });

  it('renders closable status message is "status" property is set', async () => {
    const options = { foo: 'bar' };
    const element = await fixture<InternalForm<any>>(
      html`<foxy-internal-form .status=${{ key: 'test', options }}></foxy-internal-form>`
    );

    const wrapper = element.renderRoot.querySelector('[data-testid="status"]')!;
    const button = wrapper.querySelector('vaadin-button')!;
    const buttonText = button.querySelector('foxy-i18n')!;
    const text = wrapper.querySelector('foxy-i18n')!;

    expect(text).to.have.deep.property('options', options);
    expect(text).to.have.attribute('infer', 'status');
    expect(text).to.have.attribute('key', 'test');

    expect(buttonText).to.have.attribute('infer', 'status');
    expect(buttonText).to.have.attribute('key', 'close');

    button.dispatchEvent(new CustomEvent('click'));
    expect(element).to.have.property('status', null);
  });

  it('hides closable status message if hiddencontrols matches "status"', async () => {
    const element = await fixture<InternalForm<any>>(
      html`
        <foxy-internal-form .status=${{ key: 'test' }} hiddencontrols="status">
        </foxy-internal-form>
      `
    );

    const wrapper = element.renderRoot.querySelector('[data-testid="status"]')!;
    expect(wrapper).to.not.exist;
  });

  it('hides Create button when href is set', () => {
    const element = new InternalForm();
    expect(element.hiddenSelector.matches('create', true)).to.be.false;

    element.href = 'https://demo.api/hapi/customer_addresses/0';
    expect(element.hiddenSelector.matches('create', true)).to.be.true;
  });

  it('hides Delete button, Submit button and timestamps when href is not set', () => {
    const element = new InternalForm();
    expect(element.hiddenSelector.matches('delete', true)).to.be.true;
    expect(element.hiddenSelector.matches('submit', true)).to.be.true;
    expect(element.hiddenSelector.matches('timestamps', true)).to.be.true;

    element.href = 'https://demo.api/hapi/customer_addresses/0';
    expect(element.hiddenSelector.matches('delete', true)).to.be.false;
    expect(element.hiddenSelector.matches('submit', true)).to.be.true; // remains hidden because of another condition
    expect(element.hiddenSelector.matches('timestamps', true)).to.be.false;
  });

  it('hides Undo button when there are no edits to undo', async () => {
    const element = new InternalForm<Resource<Rels.CustomerAddress>>();
    expect(element.hiddenSelector.matches('undo', true)).to.be.true;

    element.data = await getTestData('./hapi/customer_addresses/0');
    element.edit({ first_name: 'John' });
    expect(element.hiddenSelector.matches('undo', true)).to.be.false;
  });

  it('renders general errors if present', async () => {
    const layout = html`<foxy-internal-form></foxy-internal-form>`;
    const element = await fixture<InternalForm<any>>(layout);
    const errorsBefore = element.renderRoot.querySelectorAll('foxy-i18n[infer="error"]');
    expect(errorsBefore).to.have.lengthOf(0);

    Object.defineProperty(element, 'errors', { get: () => ['error:foo', 'error:bar'] });
    await element.requestUpdate();
    const errorsAfter = element.renderRoot.querySelectorAll('foxy-i18n[infer="error"]');
    expect(errorsAfter).to.have.lengthOf(2);
    expect(errorsAfter[0]).to.have.attribute('key', 'foo');
    expect(errorsAfter[1]).to.have.attribute('key', 'bar');
  });
});
