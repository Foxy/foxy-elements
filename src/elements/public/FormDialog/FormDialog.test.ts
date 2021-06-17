import './index';
import '../AttributeForm/index';

import { expect, fixture, oneEvent } from '@open-wc/testing';

import { API } from '@foxy.io/sdk/core';
import { Dialog } from '../../private';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from './FormDialog';
import { NucleonElement } from '../NucleonElement';
import { UpdateEvent } from '../NucleonElement/UpdateEvent';
import { html } from 'lit-html';
import isEqual from 'lodash-es/isEqual';
import sinon from 'sinon';

describe('FormDialog', () => {
  it('extends Dialog', () => {
    const dialog = new FormDialog();

    expect(dialog).to.be.instanceOf(Dialog);
    expect(dialog).to.have.property('parent', '');
    expect(dialog).to.have.property('href', '');
    expect(dialog).to.have.property('form', null);
  });

  it('renders form element when supplied with its local name', async () => {
    const parent = 'https://demo.foxycart.com/s/admin/customers/0/attributes';
    const href = 'https://demo.foxycart.com/s/admin/customer_attributes/0';
    const form = 'foxy-attribute-form';
    const lang = 'ru';

    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog parent=${parent} href=${href} form=${form} lang=${lang}> </foxy-form-dialog>
    `);

    expect(dialog).to.have.property('parent', parent);
    expect(dialog).to.have.property('href', href);
    expect(dialog).to.have.property('form', form);

    await dialog.show();
    const formElement = dialog.renderRoot.querySelector('#form');

    expect(formElement).to.have.attribute('parent', parent);
    expect(formElement).to.have.attribute('href', href);
    expect(formElement).to.have.attribute('lang', lang);
    expect(formElement).to.have.property('localName', form);
  });

  it('closes itself on successful DELETE request from form', async () => {
    const href = 'https://demo.foxycart.com/s/admin/customer_attributes/0';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form');
    const whenGotFetchEvent = oneEvent(dialog, 'fetch') as unknown as Promise<FetchEvent>;
    const whenGotHideEvent = oneEvent(dialog, 'hide');

    formElement?.dispatchEvent(
      new FetchEvent('fetch', {
        cancelable: true,
        composed: true,
        bubbles: true,
        request: new API.WHATWGRequest(href, { method: 'DELETE' }),
        resolve: r => void r,
        reject: e => void e,
      })
    );

    const fetchEvent = await whenGotFetchEvent;
    fetchEvent.respondWith(Promise.resolve(new Response()));

    await whenGotHideEvent;
    expect(dialog).to.have.property('open', false);
  });

  it('closes itself on successful POST request from form', async () => {
    const form = 'foxy-attribute-form';
    const parent = 'https://demo.foxycart.com/s/admin/customers/0/attributes';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog parent=${parent} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form');
    const whenGotFetchEvent = oneEvent(dialog, 'fetch') as unknown as Promise<FetchEvent>;
    const whenGotHideEvent = oneEvent(dialog, 'hide');

    formElement?.dispatchEvent(
      new FetchEvent('fetch', {
        cancelable: true,
        composed: true,
        bubbles: true,
        request: new API.WHATWGRequest(parent, { method: 'POST' }),
        resolve: r => void r,
        reject: e => void e,
      })
    );

    const fetchEvent = await whenGotFetchEvent;
    fetchEvent.respondWith(Promise.resolve(new Response()));

    await whenGotHideEvent;
    expect(dialog).to.have.property('open', false);
  });

  it('becomes unclosable when form is busy', async () => {
    const href = 'https://demo.foxycart.com/s/admin/customer_attributes/0';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<never>;
    sinon.stub(formElement, 'in').callsFake(stateValue => stateValue === 'busy');
    formElement.dispatchEvent(new UpdateEvent());

    await dialog.updateComplete;
    expect(dialog).to.have.property('closable', false);
  });

  [
    { idle: { template: { clean: 'valid' } } },
    { idle: { template: { dirty: 'valid' } } },
    { idle: { snapshot: { dirty: 'valid' } } },
  ].forEach(stateValue => {
    it(`becomes editable when form is in ${JSON.stringify(stateValue)} state`, async () => {
      const href = 'https://demo.foxycart.com/s/admin/customer_attributes/0';
      const form = 'foxy-attribute-form';
      const dialog = await fixture<FormDialog>(html`
        <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
      `);

      await dialog.show();

      const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<never>;
      sinon.stub(formElement, 'in').callsFake(v => isEqual(v, stateValue));
      formElement.dispatchEvent(new UpdateEvent());

      await dialog.updateComplete;
      expect(dialog).to.have.property('editable', true);
    });
  });
});
