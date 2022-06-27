import '../../index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { InternalItemFormSubscriptionControl } from './index';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { ItemForm } from '../../ItemForm';
import { stub } from 'sinon';
import { FormDialog } from '../../../FormDialog/FormDialog';

describe('ItemForm', () => {
  describe('InternalItemFormSubscriptionControl', () => {
    it('imports and defines foxy-internal-frequency-control', () => {
      expect(customElements.get('foxy-internal-frequency-control')).to.exist;
    });

    it('imports and defines foxy-internal-date-control', () => {
      expect(customElements.get('foxy-internal-date-control')).to.exist;
    });

    it('imports and defines foxy-internal-details', () => {
      expect(customElements.get('foxy-internal-details')).to.exist;
    });

    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-subscription-card', () => {
      expect(customElements.get('foxy-subscription-card')).to.exist;
    });

    it('imports and defines foxy-subscription-form', () => {
      expect(customElements.get('foxy-subscription-form')).to.exist;
    });

    it('imports and defines foxy-form-dialog', () => {
      expect(customElements.get('foxy-form-dialog')).to.exist;
    });

    it('imports and defines itself as foxy-internal-item-form-subscription-control', () => {
      expect(customElements.get('foxy-internal-item-form-subscription-control')).to.equal(
        InternalItemFormSubscriptionControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalItemFormSubscriptionControl()).to.be.instanceOf(InternalControl);
    });

    it('has an empty i18n namespace by default', () => {
      expect(InternalItemFormSubscriptionControl).to.have.property('defaultNS', '');
      expect(new InternalItemFormSubscriptionControl()).to.have.property('ns', '');
    });

    it('has a default inference target named "subscription"', () => {
      expect(new InternalItemFormSubscriptionControl()).to.have.property('infer', 'subscription');
    });

    it('renders details with summary', async () => {
      const element = await fixture<InternalItemFormSubscriptionControl>(html`
        <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>
      `);

      const details = element.renderRoot.querySelector('foxy-internal-details');

      expect(details).to.exist;
      expect(details).to.have.property('infer', '');
      expect(details).to.have.property('summary', 'title');
    });

    it('renders frequency as a control if no subscription is associated with the item', async () => {
      const element = await fixture<InternalItemFormSubscriptionControl>(html`
        <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>
      `);

      const control = element.renderRoot.querySelector(
        'foxy-internal-frequency-control[infer="frequency"]'
      );

      expect(control).to.exist;
      expect(control).to.have.property('property', 'subscription_frequency');
    });

    it('renders start date as a control if no subscription is associated with the item', async () => {
      const element = await fixture<InternalItemFormSubscriptionControl>(html`
        <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>
      `);

      const control = element.renderRoot.querySelector('foxy-internal-date-control[infer="start"]');

      expect(control).to.exist;
      expect(control).to.have.property('property', 'subscription_start_date');
    });

    it('renders end date as a control if no subscription is associated with the item', async () => {
      const element = await fixture<InternalItemFormSubscriptionControl>(html`
        <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>
      `);

      const control = element.renderRoot.querySelector('foxy-internal-date-control[infer="end"]');

      expect(control).to.exist;
      expect(control).to.have.property('property', 'subscription_end_date');
    });

    it('renders next transaction date as a control if no subscription is associated with the item', async () => {
      const element = await fixture<InternalItemFormSubscriptionControl>(html`
        <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>
      `);

      const control = element.renderRoot.querySelector('foxy-internal-date-control[infer="next"]');

      expect(control).to.exist;
      expect(control).to.have.property('property', 'subscription_next_transaction_date');
    });

    it('renders clickable subscription card if a subscription is associated with the item', async () => {
      const router = createRouter();
      const element = await fixture<ItemForm>(html`
        <foxy-item-form
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>
        </foxy-item-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = element.firstElementChild as InternalItemFormSubscriptionControl;
      const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
      const card = control.renderRoot.querySelector('foxy-subscription-card')!;
      const button = card.closest('button')!;

      expect(dialog).to.exist;
      expect(dialog).to.have.deep.property('related', ['https://demo.api/hapi/items/0']);
      expect(dialog).to.have.property('header', 'update');
      expect(dialog).to.have.property('infer', 'form');
      expect(dialog).to.have.property('form', 'foxy-subscription-form');
      expect(dialog).to.have.property(
        'href',
        'https://demo.api/hapi/subscriptions/0?zoom=last_transaction%2Ctransaction_template%3Aitems'
      );

      expect(button).to.exist;
      expect(button).to.have.property('disabled', false);

      expect(card).to.exist;
      expect(card).to.have.property('infer', 'card');
      expect(card).to.have.property(
        'href',
        'https://demo.api/hapi/subscriptions/0?zoom=last_transaction%2Ctransaction_template%3Aitems'
      );

      control.disabled = true;
      await control.updateComplete;

      expect(button).to.have.property('disabled', true);

      control.disabled = false;
      await control.updateComplete;

      const showMethod = stub(dialog, 'show');
      button.click();

      expect(showMethod).to.have.been.calledOnce;
      showMethod.restore();
    });
  });
});
