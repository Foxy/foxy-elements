import type { InternalConfirmDialog } from '../../../../internal/InternalConfirmDialog/InternalConfirmDialog';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';
import type { FormDialog } from '../../../FormDialog/FormDialog';

import '../../../NucleonElement/index';
import './index';

import { InternalAdminSubscriptionFormStatusAction as Action } from './InternalAdminSubscriptionFormStatusAction';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { createRouter } from '../../../../../server';
import { stub } from 'sinon';

describe('AdminSubscriptionForm', () => {
  describe('InternalAdminSubscriptionFormStatusAction', () => {
    it('imports and defines the component', () => {
      const constructor = customElements.get('foxy-internal-admin-subscription-form-status-action');
      expect(constructor).to.equal(Action);
    });

    it('imports and defines dependencies', () => {
      expect(customElements.get('vaadin-button')).to.exist;
      expect(customElements.get('foxy-internal-confirm-dialog')).to.exist;
      expect(customElements.get('foxy-internal-control')).to.exist;
      expect(customElements.get('foxy-form-dialog')).to.exist;
      expect(customElements.get('foxy-i18n')).to.exist;

      const form = customElements.get('foxy-internal-admin-subscription-form-status-action-form');
      expect(form).to.exist;
    });

    it('extends InternalControl', () => {
      const instance = new Action();
      expect(instance).to.be.instanceOf(Action);
      expect(instance).to.be.instanceOf(InternalControl);
    });

    it('always hides the save button in the form dialog', () => {
      const instance = new Action();
      const selector = instance.hiddenSelector.toString();
      expect(selector).to.include('form:save-button');
    });

    it('renders "Cancel this subscription" button when the subscription is active with no end date', async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/subscriptions/0', {
          method: 'PATCH',
          body: JSON.stringify({ is_active: true, end_date: '0000-00-00' }),
        })
      )?.handlerPromise;

      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-admin-subscription-form-status-action infer="">
          </foxy-internal-admin-subscription-form-status-action>
        </foxy-nucleon>
      `);

      await waitUntil(() => !!nucleon.data, undefined, { timeout: 5000 });
      const action = nucleon.firstElementChild as Action;
      await action.requestUpdate();

      const button = action.renderRoot.querySelector('vaadin-button');
      expect(button).to.exist;
      expect(button).to.have.attribute('theme', 'tertiary-inline error');

      const buttonCaption = button?.querySelector('foxy-i18n');
      expect(buttonCaption).to.exist;
      expect(buttonCaption).to.have.attribute('key', 'caption_cancel');
      expect(buttonCaption).to.have.attribute('infer', '');

      const dialog = action.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('href', 'https://demo.api/hapi/subscriptions/0');
      expect(dialog).to.have.attribute('no-confirm-when-dirty');
      expect(dialog).to.have.attribute('close-on-patch');
      expect(dialog).to.have.attribute('infer', 'form');
      expect(dialog).to.have.attribute('alert');
      expect(dialog).to.have.attribute(
        'form',
        'foxy-internal-admin-subscription-form-status-action-form'
      );

      const showMethod = stub(dialog, 'show');
      button?.dispatchEvent(new Event('click'));
      expect(showMethod).to.have.been.calledOnceWith(button);
    });

    it('renders "Reactivate this subscription" button when the subscription is inactive', async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/subscriptions/0', {
          method: 'PATCH',
          body: JSON.stringify({ is_active: false }),
        })
      )?.handlerPromise;

      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-admin-subscription-form-status-action infer="">
          </foxy-internal-admin-subscription-form-status-action>
        </foxy-nucleon>
      `);

      await waitUntil(() => !!nucleon.data, undefined, { timeout: 5000 });
      const action = nucleon.firstElementChild as Action;
      await action.requestUpdate();

      const button = action.renderRoot.querySelector('vaadin-button');
      expect(button).to.exist;
      expect(button).to.have.attribute('theme', 'tertiary-inline success');

      const buttonCaption = button?.querySelector('foxy-i18n');
      expect(buttonCaption).to.exist;
      expect(buttonCaption).to.have.attribute('key', 'caption_reactivate');
      expect(buttonCaption).to.have.attribute('infer', '');

      const dialog = action.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('href', 'https://demo.api/hapi/subscriptions/0');
      expect(dialog).to.have.attribute('no-confirm-when-dirty');
      expect(dialog).to.have.attribute('close-on-patch');
      expect(dialog).to.have.attribute('infer', 'form');
      expect(dialog).to.have.attribute('alert');
      expect(dialog).to.have.attribute(
        'form',
        'foxy-internal-admin-subscription-form-status-action-form'
      );

      const showMethod = stub(dialog, 'show');
      button?.dispatchEvent(new Event('click'));
      expect(showMethod).to.have.been.calledOnceWith(button);
    });

    it('renders "Clear pending cancellation" button when the subscription is inactive', async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/subscriptions/0', {
          method: 'PATCH',
          body: JSON.stringify({
            is_active: true,
            end_date: new Date(Date.now() + 86400000).toISOString(),
          }),
        })
      )?.handlerPromise;

      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-admin-subscription-form-status-action infer="">
          </foxy-internal-admin-subscription-form-status-action>
        </foxy-nucleon>
      `);

      await waitUntil(() => !!nucleon.data, undefined, { timeout: 5000 });
      const action = nucleon.firstElementChild as Action;
      await action.requestUpdate();

      const button = action.renderRoot.querySelector('vaadin-button');
      expect(button).to.exist;
      expect(button).to.have.attribute('theme', 'tertiary-inline');

      const buttonCaption = button?.querySelector('foxy-i18n');
      expect(buttonCaption).to.exist;
      expect(buttonCaption).to.have.attribute('key', 'caption_uncancel');
      expect(buttonCaption).to.have.attribute('infer', '');

      const dialog = action.renderRoot.querySelector(
        'foxy-internal-confirm-dialog'
      ) as InternalConfirmDialog;
      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('message', 'uncancel_message');
      expect(dialog).to.have.attribute('confirm', 'uncancel_confirm');
      expect(dialog).to.have.attribute('cancel', 'uncancel_cancel');
      expect(dialog).to.have.attribute('header', 'uncancel_header');
      expect(dialog).to.have.attribute('infer', '');

      const showMethod = stub(dialog, 'show');
      button?.dispatchEvent(new Event('click'));
      expect(showMethod).to.have.been.calledOnceWith(button);

      const editMethod = stub(nucleon, 'edit');
      const submitMethod = stub(nucleon, 'submit');
      dialog.dispatchEvent(new CustomEvent('hide', { detail: { cancelled: false } }));
      expect(editMethod).to.have.been.calledOnceWith({ end_date: '0000-00-00' });
      expect(submitMethod).to.have.been.calledOnce;
    });
  });
});
