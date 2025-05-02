import type { InternalSelectControl } from '../../../../internal/InternalSelectControl/InternalSelectControl';
import type { InternalDateControl } from '../../../../internal/InternalDateControl/InternalDateControl';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';
import type { Data } from '../../types';

import './index';

import { InternalAdminSubscriptionFormStatusActionForm as Form } from './InternalAdminSubscriptionFormStatusActionForm';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { serializeDate } from '../../../../../utils/serialize-date';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../../../server/index';
import { getTestData } from '../../../../../testgen/getTestData';
import { html } from 'lit-html';
import { stub } from 'sinon';

describe('AdminSubscriptionForm', () => {
  describe('InternalAdminSubscriptionFormStatusActionForm', () => {
    it('imports and defines the component', () => {
      const cls = customElements.get('foxy-internal-admin-subscription-form-status-action-form');
      expect(cls).to.equal(Form);
    });

    it('imports and defines the dependencies', () => {
      expect(customElements.get('vaadin-button')).to.exist;
      expect(customElements.get('foxy-internal-form')).to.exist;
      expect(customElements.get('foxy-internal-summary-control')).to.exist;
      expect(customElements.get('foxy-internal-select-control')).to.exist;
      expect(customElements.get('foxy-internal-date-control')).to.exist;
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('extends InternalForm', () => {
      expect(new Form()).to.be.instanceOf(InternalForm);
    });

    it('produces "end-date:v8n_required" v8n error when end date is required and not set', async () => {
      const form = new Form();
      const data = await getTestData<Data>('./hapi/subscriptions/0');

      data.is_active = true;
      data.end_date = null;
      form.data = data;

      expect(form.errors).to.include('end-date:v8n_required');
      form.edit({ end_date: '2100-01-01' });
      expect(form.errors).not.to.include('end-date:v8n_required');
    });

    it('produces "next-transaction-date:v8n_required" v8n error when next transaction date is required and not set', async () => {
      const form = new Form();
      const data = await getTestData<Data>('./hapi/subscriptions/0');

      data.is_active = false;
      data.next_transaction_date = '';
      form.data = data;

      expect(form.errors).to.include('next-transaction-date:v8n_required');
      form.edit({ next_transaction_date: '2100-01-01' });
      expect(form.errors).not.to.include('next-transaction-date:v8n_required');
    });

    it('makes end date picker readonly when a preset is selected', async () => {
      const form = new Form();
      const data = await getTestData<Data>('./hapi/subscriptions/0');
      form.data = data;
      expect(form.readonlySelector.toString()).to.include('end-date');

      form.edit({ end_date_preset: 'tomorrow' });
      expect(form.readonlySelector.toString()).to.include('end-date');

      form.edit({ end_date_preset: 'next_transaction_date' });
      expect(form.readonlySelector.toString()).to.include('end-date');

      form.edit({ end_date_preset: 'custom_date' });
      expect(form.readonlySelector.toString()).to.not.include('end-date');
    });

    it('renders text content for the Cancel state', async () => {
      const $ = (selector: string) => form.renderRoot.querySelector(selector);
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: true };
      await form.requestUpdate();

      expect($('foxy-i18n[infer=""][key="cancel_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_subtitle"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_why_not_today_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_why_not_today_text"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_whats_next_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_whats_next_text"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_how_to_reactivate_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="cancel_how_to_reactivate_text"]')).to.exist;
    });

    it('renders text content for the Reactivate state', async () => {
      const $ = (selector: string) => form.renderRoot.querySelector(selector);
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: false };
      await form.requestUpdate();

      expect($('foxy-i18n[infer=""][key="reactivate_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="reactivate_subtitle"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="reactivate_why_not_today_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="reactivate_why_not_today_text"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="reactivate_whats_next_title"]')).to.exist;
      expect($('foxy-i18n[infer=""][key="reactivate_whats_next_text"]')).to.exist;
    });

    it('renders end date presets in the Cancel state', async () => {
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: true };
      await form.requestUpdate();

      const select = form.renderRoot.querySelector<InternalSelectControl>(
        'foxy-internal-select-control[infer="end-date-preset"]'
      );

      expect(select).to.exist;
      expect(select).to.have.attribute(
        'options',
        JSON.stringify([
          { value: 'tomorrow', label: 'option_tomorrow' },
          { value: 'next_transaction_date', label: 'option_next_transaction_date' },
          { value: 'custom_date', label: 'option_custom_date' },
        ])
      );

      expect(select?.getValue()).to.equal('next_transaction_date');
      form.edit({ end_date_preset: 'tomorrow' });
      expect(select?.getValue()).to.equal('tomorrow');

      select?.setValue('next_transaction_date');
      expect(form.form.end_date).to.equal(form.form.next_transaction_date);

      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);
      select?.setValue('tomorrow');
      expect(form.form.end_date).to.equal(serializeDate(tomorrowDate));

      select?.setValue('custom_date');
      expect(form.form.end_date).to.equal('');
    });

    it('renders end date field in the Cancel state', async () => {
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: true, end_date: '' };
      await form.requestUpdate();

      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);

      const dateControl = form.renderRoot.querySelector<InternalDateControl>(
        'foxy-internal-date-control[infer="end-date"]'
      );

      expect(dateControl).to.exist;
      expect(dateControl).to.have.attribute('hide-clear-button');
      expect(dateControl).to.have.attribute('min', serializeDate(tomorrowDate));
      expect(dateControl?.getValue()).to.equal(form.form.next_transaction_date);

      dateControl?.setValue('2100-01-01');
      expect(form.form.end_date).to.equal('2100-01-01');
    });

    it('renders Cancel button in the Cancel state', async () => {
      const $ = (selector: string) => form.renderRoot.querySelector(selector);
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: true };
      await form.requestUpdate();

      const caption = $('foxy-i18n[infer=""][key="cancel_submit"');
      const button = caption?.closest('vaadin-button');

      expect(button).to.exist;
      expect(button).to.not.have.attribute('disabled');

      form.disabled = true;
      await form.requestUpdate();
      expect(button).to.have.attribute('disabled');

      form.disabled = false;
      await form.requestUpdate();
      const submitMethod = stub(form, 'submit');
      button?.dispatchEvent(new Event('click'));
      expect(submitMethod).to.have.been.calledOnce;
    });

    it('cancels correctly with defaults', async () => {
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: true };
      await form.requestUpdate();

      form.submit();
      expect(form.form.end_date).to.equal(form.form.next_transaction_date);
    });

    it('renders next transaction date field in the Reactivate state', async () => {
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: false, next_transaction_date: '' };
      await form.requestUpdate();

      const dateControl = form.renderRoot.querySelector<InternalDateControl>(
        'foxy-internal-date-control[infer="next-transaction-date"]'
      );

      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);

      expect(dateControl).to.exist;
      expect(dateControl).to.have.attribute('min', serializeDate(tomorrowDate));
      expect(dateControl?.getValue()).to.equal(serializeDate(tomorrowDate));
    });

    it('renders Reactivate button in the Reactivate state', async () => {
      const $ = (selector: string) => form.renderRoot.querySelector(selector);
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: false };
      await form.requestUpdate();

      const caption = $('foxy-i18n[infer=""][key="reactivate_submit"]');
      const button = caption?.closest('vaadin-button');

      expect(button).to.exist;
      expect(button).to.not.have.attribute('disabled');

      form.disabled = true;
      await form.requestUpdate();
      expect(button).to.have.attribute('disabled');

      form.disabled = false;
      await form.requestUpdate();
      const submitMethod = stub(form, 'submit');
      button?.dispatchEvent(new Event('click'));
      expect(submitMethod).to.have.been.calledOnce;
    });

    it('reactivates correctly with defaults', async () => {
      const router = createRouter();
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      form.data = { ...form.data!, is_active: false };
      await form.requestUpdate();

      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);

      form.submit();
      expect(form.form.next_transaction_date).to.equal(serializeDate(tomorrowDate));
      expect(form.form.end_date).to.equal('0000-00-00');
      expect(form.form.is_active).to.equal(true);
    });

    it('removes "end_date_preset" from the PATCH payload', async () => {
      let lastFetchEvent: FetchEvent | null = null;
      const form = await fixture<Form>(html`
        <foxy-internal-admin-subscription-form-status-action-form
          @fetch=${(evt: FetchEvent) => (lastFetchEvent = evt)}
        >
        </foxy-internal-admin-subscription-form-status-action-form>
      `);

      const data = await getTestData<Data>('./hapi/subscriptions/0');
      form.data = { ...data, is_active: true };
      form.edit({ end_date_preset: 'custom_date', end_date: '2100-01-01' });
      await form.requestUpdate();

      lastFetchEvent = null;
      form.submit();
      expect(form.errors).to.be.empty;
      await waitUntil(() => !!lastFetchEvent, undefined, { timeout: 5000 });
      expect(await lastFetchEvent!.request.clone().json()).to.not.have.property('end_date_preset');
    });
  });
});
