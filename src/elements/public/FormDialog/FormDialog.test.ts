import type { AttributeForm } from '../AttributeForm/AttributeForm';

import './index';
import '../AttributeForm/index';

import { expect, fixture, oneEvent, waitUntil } from '@open-wc/testing';

import { Dialog } from '../../private';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from './FormDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { UpdateEvent } from '../NucleonElement/UpdateEvent';
import { html } from 'lit-html';
import isEqual from 'lodash-es/isEqual';
import { stub } from 'sinon';
import { createRouter } from '../../../server';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';

describe('FormDialog', () => {
  it('extends Dialog', () => {
    const dialog = new FormDialog();

    expect(dialog).to.be.instanceOf(Dialog);
    expect(dialog).to.have.property('parent', '');
    expect(dialog).to.have.property('href', '');
    expect(dialog).to.have.property('form', null);
  });

  it('renders form element when supplied with its local name', async () => {
    const parent = 'https://demo.api/hapi/customers/0/attributes';
    const href = 'https://demo.api/hapi/attributes/0';
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
    const href = 'https://demo.api/hapi/customer_attributes/0';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    dialog.addEventListener(
      'fetch',
      evt => (evt as FetchEvent).respondWith(Promise.resolve(new Response())),
      { once: true }
    );

    const formElement = dialog.renderRoot.querySelector('#form');
    const whenGotHideEvent = oneEvent(dialog, 'hide');

    formElement?.dispatchEvent(
      new UpdateEvent('update', {
        detail: {
          result: UpdateEvent.UpdateResult.ResourceDeleted,
        },
      })
    );

    await whenGotHideEvent;
    expect(dialog).to.have.property('open', false);
  });

  it('keeps itself open on successful DELETE request from form if keepOpenOnDelete is true', async () => {
    const href = 'https://demo.api/hapi/customer_attributes/0';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog href=${href} form=${form} keep-open-on-delete></foxy-form-dialog>
    `);

    await dialog.show();

    dialog.addEventListener(
      'fetch',
      evt => (evt as FetchEvent).respondWith(Promise.resolve(new Response())),
      { once: true }
    );

    const formElement = dialog.renderRoot.querySelector('#form');

    formElement?.dispatchEvent(
      new UpdateEvent('update', {
        detail: {
          result: UpdateEvent.UpdateResult.ResourceDeleted,
        },
      })
    );

    await new Promise(r => setTimeout(r, 5000));
    expect(dialog).to.have.property('open', true);
  });

  it('closes itself on successful POST request from form', async () => {
    const form = 'foxy-attribute-form';
    const parent = 'https://demo.api/hapi/customer_attributes';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog parent=${parent} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    dialog.addEventListener(
      'fetch',
      evt => (evt as FetchEvent).respondWith(Promise.resolve(new Response())),
      { once: true }
    );

    const formElement = dialog.renderRoot.querySelector('#form');
    const whenGotHideEvent = oneEvent(dialog, 'hide');

    formElement?.dispatchEvent(
      new UpdateEvent('update', {
        detail: {
          result: UpdateEvent.UpdateResult.ResourceCreated,
        },
      })
    );

    await whenGotHideEvent;
    expect(dialog).to.have.property('open', false);
  });

  it('keeps itself open on successful POST request from form if keepOpenOnPost is true', async () => {
    const href = 'https://demo.api/hapi/customer_attributes';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog parent=${href} form=${form} keep-open-on-post></foxy-form-dialog>
    `);

    await dialog.show();

    dialog.addEventListener(
      'fetch',
      evt => (evt as FetchEvent).respondWith(Promise.resolve(new Response())),
      { once: true }
    );

    const formElement = dialog.renderRoot.querySelector('#form');

    formElement?.dispatchEvent(
      new UpdateEvent('update', {
        detail: {
          result: UpdateEvent.UpdateResult.ResourceCreated,
        },
      })
    );

    await new Promise(r => setTimeout(r, 5000));
    expect(dialog).to.have.property('open', true);
  });

  it('closes itself on successful PATCH request from form if closeOnPatch is true', async () => {
    const router = createRouter();

    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog
        href="https://demo.api/hapi/customer_attributes/0"
        form="foxy-attribute-form"
        close-on-patch
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-form-dialog>
    `);

    await dialog.show();

    const whenGotHideEvent = oneEvent(dialog, 'hide');
    const formElement = dialog.renderRoot.querySelector<AttributeForm>('#form');

    await waitUntil(() => !!formElement?.data);
    formElement?.edit({ name: 'new name' });
    formElement?.submit();

    await whenGotHideEvent;
    expect(dialog).to.have.property('open', false);
  });

  it('becomes unclosable when form is busy', async () => {
    const href = 'https://demo.api/hapi/attributes/0';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<never>;
    stub(formElement, 'in').callsFake(stateValue => stateValue === 'busy');
    formElement.dispatchEvent(new UpdateEvent());

    await dialog.requestUpdate();
    expect(dialog).to.have.property('closable', false);
  });

  [{ idle: { template: { dirty: 'valid' } } }, { idle: { snapshot: { dirty: 'valid' } } }].forEach(
    stateValue => {
      it(`becomes editable when form is in ${JSON.stringify(stateValue)} state`, async () => {
        const href = 'https://demo.api/hapi/attributes/0';
        const form = 'foxy-attribute-form';
        const dialog = await fixture<FormDialog>(html`
          <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
        `);

        await dialog.show();

        const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<never>;
        stub(formElement, 'in').callsFake(v => isEqual(v, stateValue));
        formElement.dispatchEvent(new UpdateEvent());

        await dialog.requestUpdate();
        expect(dialog).to.have.property('editable', true);
      });
    }
  );

  it('hides built-in Undo and Submit buttons in forms because it provides its own', () => {
    const dialog = new FormDialog();
    expect(dialog.hiddenSelector.matches('undo', true)).to.be.true;
    expect(dialog.hiddenSelector.matches('submit', true)).to.be.true;
  });

  it('displays confirmation dialog when form is dirty and user tries to close it', async () => {
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<any>;
    formElement.edit({ name: 'foo', value: 'bar' });
    await dialog.requestUpdate();
    const confirmDialog = dialog.renderRoot.querySelector(
      'foxy-internal-confirm-dialog'
    ) as InternalConfirmDialog;

    expect(confirmDialog).to.exist;
    expect(confirmDialog).to.have.attribute('message', 'undo_message');
    expect(confirmDialog).to.have.attribute('confirm', 'undo_confirm');
    expect(confirmDialog).to.have.attribute('cancel', 'undo_cancel');
    expect(confirmDialog).to.have.attribute('header', 'undo_header');
    expect(confirmDialog).to.have.attribute('theme', 'error');
    expect(confirmDialog).to.have.attribute('lang', dialog.lang);
    expect(confirmDialog).to.have.attribute('ns', dialog.ns);

    const showStub = stub(confirmDialog, 'show');
    await dialog.hide(true);
    expect(showStub).to.have.been.calledOnce;
  });

  it('does not display confirmation dialog when noConfirmWhenDirty is true', async () => {
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog form=${form} no-confirm-when-dirty></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<any>;
    formElement.edit({ name: 'foo', value: 'bar' });
    await dialog.requestUpdate();
    const confirmDialog = dialog.renderRoot.querySelector(
      'foxy-internal-confirm-dialog'
    ) as InternalConfirmDialog;

    expect(confirmDialog).to.exist;
    expect(confirmDialog).to.have.attribute('message', 'undo_message');
    expect(confirmDialog).to.have.attribute('confirm', 'undo_confirm');
    expect(confirmDialog).to.have.attribute('cancel', 'undo_cancel');
    expect(confirmDialog).to.have.attribute('header', 'undo_header');
    expect(confirmDialog).to.have.attribute('theme', 'error');
    expect(confirmDialog).to.have.attribute('lang', dialog.lang);
    expect(confirmDialog).to.have.attribute('ns', dialog.ns);

    const showStub = stub(confirmDialog, 'show');
    await dialog.hide(true);
    expect(showStub).to.not.have.been.calledOnce;
  });

  it('propagates update events from the form', async () => {
    const href = 'https://demo.api/hapi/attributes/0';
    const form = 'foxy-attribute-form';
    const dialog = await fixture<FormDialog>(html`
      <foxy-form-dialog href=${href} form=${form}></foxy-form-dialog>
    `);

    await dialog.show();

    const formElement = dialog.renderRoot.querySelector('#form') as NucleonElement<never>;
    const updateEvent = oneEvent(dialog, 'update');
    formElement.dispatchEvent(new UpdateEvent());
    expect(await updateEvent).to.be.instanceOf(UpdateEvent);
  });
});
