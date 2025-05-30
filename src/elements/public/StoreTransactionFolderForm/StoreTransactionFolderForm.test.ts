import type { InternalStoreTransactionFolderFormColorControl as ColorControl } from './internal/InternalStoreTransactionFolderFormColorControl/InternalStoreTransactionFolderFormColorControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { StoreTransactionFolderForm as Form } from './StoreTransactionFolderForm';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { spy } from 'sinon';

describe('StoreTransactionFolderForm', () => {
  it('imports and defines dependencies', () => {
    expect(customElements.get('foxy-internal-store-transaction-folder-color-control')).to.exist;
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
    expect(customElements.get('foxy-internal-text-control')).to.exist;
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-store-transaction-folder-form', () => {
    const localName = 'foxy-store-transaction-folder-form';
    expect(customElements.get(localName)).to.exist;
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "store-transaction-folder-form"', () => {
    expect(Form).to.have.property('defaultNS', 'store-transaction-folder-form');
    expect(new Form()).to.have.property('ns', 'store-transaction-folder-form');
  });

  it('renders folder name in plaintext', async () => {
    const layout = html`<foxy-store-transaction-folder-form></foxy-store-transaction-folder-form>`;
    const element = await fixture<Form>(layout);
    expect(element.renderRoot).to.include.text('group-one.name.placeholder');

    element.edit({ name: 'Test Folder' });
    await element.requestUpdate();
    expect(element.renderRoot).to.include.text('Test Folder');
  });

  it('renders text control for folder name', async () => {
    const layout = html`<foxy-store-transaction-folder-form></foxy-store-transaction-folder-form>`;
    const element = await fixture<Form>(layout);
    const selector = '[infer="group-one"] foxy-internal-text-control[infer="name"]';

    expect(element.renderRoot.querySelector(selector)).to.exist;
  });

  it('renders color control for folder color', async () => {
    const layout = html`<foxy-store-transaction-folder-form></foxy-store-transaction-folder-form>`;
    const element = await fixture<Form>(layout);
    const selector =
      '[infer="group-one"] foxy-internal-store-transaction-folder-color-control[infer="color"]';

    const control = element.renderRoot.querySelector<ColorControl>(selector);
    expect(control).to.exist;
    expect(Object.keys(control?.colors ?? {})).to.deep.equal([
      'red',
      'red_pale',
      'green',
      'green_pale',
      'blue',
      'blue_pale',
      'orange',
      'orange_pale',
      'violet',
      'violet_pale',
      '',
    ]);
  });

  it('renders switch control for default folder flag', async () => {
    const layout = html`<foxy-store-transaction-folder-form></foxy-store-transaction-folder-form>`;
    const element = await fixture<Form>(layout);
    const selector = '[infer="group-two"] foxy-internal-switch-control[infer="is-default"]';
    const control = element.renderRoot.querySelector(selector);

    expect(control).to.exist;
    expect(control).to.have.property('trueAlias', 1);
    expect(control).to.have.property('falseAlias', 0);
  });

  it('uses name placeholder from i18n on submit when name is empty', async () => {
    const form1 = new Form();
    const form1EditMethod = spy(form1, 'edit');
    form1.submit();
    expect(form1EditMethod).to.have.been.calledWith({ name: 'group-one.name.placeholder' });

    const form2 = new Form();
    form2.edit({ name: 'Test Folder' });
    const form2EditMethod = spy(form2, 'edit');
    form2.submit();
    expect(form2EditMethod).to.not.have.been.called;
  });

  it('renders "folder_not_empty" general error when attempting to delete a folder with transactions in it', async () => {
    const form = await fixture<Form>(
      html`<foxy-store-transaction-folder-form></foxy-store-transaction-folder-form>`
    );

    form.data = await getTestData<Data>('./hapi/transaction_folders/0');
    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: {
          'fx:errors': [
            {
              message:
                'This transaction folder can not be deleted because it has transactions in it',
            },
          ],
        },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.delete();
    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:folder_not_empty');
  });
});
