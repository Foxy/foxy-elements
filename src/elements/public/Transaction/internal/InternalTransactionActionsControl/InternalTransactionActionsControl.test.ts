import type { NucleonElement } from '../../../NucleonElement/NucleonElement';

import '../../../NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalTransactionActionsControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';
import { html } from 'lit-html';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { spy, stub } from 'sinon';

import unset from 'lodash-es/unset';
import set from 'lodash-es/set';
import { BooleanSelector } from '@foxy.io/sdk/core';

async function waitForIdle(element: InternalTransactionActionsControl) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('Transaction', () => {
  describe('InternalTransactionActionsControl', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-internal-post-action-control', () => {
      expect(customElements.get('foxy-internal-post-action-control')).to.exist;
    });

    it('imports and defines itself as foxy-internal-transaction-actions-control', () => {
      expect(customElements.get('foxy-internal-transaction-actions-control')).to.equal(
        InternalTransactionActionsControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalTransactionActionsControl()).to.be.instanceOf(InternalControl);
    });

    it('renders Capture action if transaction has fx:capture link', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      unset(wrapper, 'data._links["fx:capture"]');
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      expect(control.renderRoot.querySelector('[infer="capture"]')).to.not.exist;

      set(wrapper, 'data._links["fx:capture"]', { href: 'test' });
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const action = control.renderRoot.querySelector('[infer="capture"]');

      expect(action).to.exist;
      expect(action).to.have.property('localName', 'foxy-internal-post-action-control');
      expect(action).to.have.property('theme', 'tertiary-inline success');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('success'));

      expect(refreshMethod).to.have.been.calledOnce;
      refreshMethod.restore();
    });

    it('renders Void action if transaction has fx:void link', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      unset(wrapper, 'data._links["fx:void"]');
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      expect(control.renderRoot.querySelector('[infer="void"]')).to.not.exist;

      set(wrapper, 'data._links["fx:void"]', { href: 'test' });
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const action = control.renderRoot.querySelector('[infer="void"]');

      expect(action).to.exist;
      expect(action).to.have.property('localName', 'foxy-internal-post-action-control');
      expect(action).to.have.property('theme', 'tertiary-inline error');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('success'));

      expect(refreshMethod).to.have.been.calledOnce;
      refreshMethod.restore();
    });

    it('renders Refund action if transaction has fx:refund link', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      unset(wrapper, 'data._links["fx:refund"]');
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      expect(control.renderRoot.querySelector('[infer="refund"]')).to.not.exist;

      set(wrapper, 'data._links["fx:refund"]', { href: 'test' });
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const action = control.renderRoot.querySelector('[infer="refund"]');

      expect(action).to.exist;
      expect(action).to.have.property('localName', 'foxy-internal-post-action-control');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('success'));

      expect(refreshMethod).to.have.been.calledOnce;
      refreshMethod.restore();
    });

    it('renders Send Emails action if transaction has fx:send_emails link', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      unset(wrapper, 'data._links["fx:send_emails"]');
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      expect(control.renderRoot.querySelector('[infer="send-emails"]')).to.not.exist;

      set(wrapper, 'data._links["fx:send_emails"]', { href: 'test' });
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const action = control.renderRoot.querySelector('[infer="send-emails"]');

      expect(action).to.exist;
      expect(action).to.have.property('localName', 'foxy-internal-post-action-control');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('success'));

      expect(refreshMethod).to.have.been.calledOnce;
      refreshMethod.restore();
    });

    it('renders See Subscription action if transaction has fx:subscription link', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          .getSubscriptionPageHref=${() => 'https://example.com/test'}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      unset(wrapper, 'data._links["fx:subscription"]');
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      expect(control.renderRoot.querySelector('[infer="subscription"]')).to.not.exist;

      set(wrapper, 'data._links["fx:subscription"]', { href: 'test' });
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const action = control.renderRoot.querySelector('[infer="subscription"]');

      expect(action).to.exist;
      expect(action).to.have.property('localName', 'foxy-i18n');
      expect(action).to.have.property('key', 'caption');

      const link = action?.closest('a');
      expect(link).to.exist;
      expect(link).to.have.property('href', 'https://example.com/test');
    });

    it('renders View Receipt action if transaction has fx:receipt link', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      unset(wrapper, 'data._links["fx:receipt"]');
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      expect(control.renderRoot.querySelector('[infer="receipt"]')).to.not.exist;

      set(wrapper, 'data._links["fx:receipt"]', { href: 'https://example.com/receipt' });
      wrapper.data = { ...wrapper.data! };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const action = control.renderRoot.querySelector('[infer="receipt"]');

      expect(action).to.exist;
      expect(action).to.have.property('localName', 'foxy-i18n');
      expect(action).to.have.property('key', 'caption');

      const link = action?.closest('a');
      expect(link).to.exist;
      expect(link).to.have.attribute('href', 'https://example.com/receipt');
      expect(link).to.have.attribute('target', '_blank');
    });

    it('renders Archive button if transaction is not hidden', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      wrapper.data = { ...wrapper.data!, hide_transaction: false };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const label = control.renderRoot.querySelector('foxy-i18n[infer="archive"]');
      expect(label).to.exist;
      expect(label).to.have.attribute('key', 'caption_archive');

      const editMethod = stub(wrapper, 'edit');
      const submitMethod = stub(wrapper, 'submit');
      const button = label?.closest('vaadin-button');
      button?.dispatchEvent(new CustomEvent('click'));
      expect(editMethod).to.have.been.calledOnceWith({ hide_transaction: true });
      expect(submitMethod).to.have.been.calledOnce;
    });

    it('renders Unarchive button if transaction is hidden', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      wrapper.data = { ...wrapper.data!, hide_transaction: true };
      await wrapper.requestUpdate();
      await control.requestUpdate();

      const label = control.renderRoot.querySelector('foxy-i18n[infer="archive"]');
      expect(label).to.exist;
      expect(label).to.have.attribute('key', 'caption_unarchive');

      const editMethod = stub(wrapper, 'edit');
      const submitMethod = stub(wrapper, 'submit');
      const button = label?.closest('vaadin-button');
      button?.dispatchEvent(new CustomEvent('click'));
      expect(editMethod).to.have.been.calledOnceWith({ hide_transaction: false });
      expect(submitMethod).to.have.been.calledOnce;
    });

    it('conditionally disables Archive button', async () => {
      const control = (await fixture(html`
        <foxy-internal-transaction-actions-control></foxy-internal-transaction-actions-control>
      `)) as InternalTransactionActionsControl;

      const label = control.renderRoot.querySelector('foxy-i18n[infer="archive"]');
      const button = label?.closest('vaadin-button');
      expect(button).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');

      control.disabled = false;
      control.disabledControls = new BooleanSelector('archive');
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });

    it('renders folder selector', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control
            infer="actions"
            folders="https://demo.api/hapi/transaction_folders"
          >
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;
      await waitForIdle(control);

      const labelText = control.renderRoot.querySelector(
        'foxy-i18n[infer="folder"][key="caption"]'
      );

      const label = labelText?.closest('label');
      const select = label?.querySelector('select');

      expect(labelText).to.exist;
      expect(label).to.exist;
      expect(select).to.exist;

      expect(select?.options).to.have.lengthOf(3);
      expect(select?.options[0].value).to.equal('');
      expect(select?.options[0]).to.include.text('folder.option_none');
      expect(select?.options[0]).to.not.have.attribute('selected');

      expect(select?.options[1].value).to.equal('https://demo.api/hapi/transaction_folders/0');
      expect(select?.options[1]).to.include.text('Pending');
      expect(select?.options[1]).to.have.attribute('selected');

      expect(select?.options[2].value).to.equal('https://demo.api/hapi/transaction_folders/1');
      expect(select?.options[2]).to.include.text('Shipped');
      expect(select?.options[2]).to.not.have.attribute('selected');

      const editMethod = spy(wrapper, 'edit');
      const submitMethod = spy(wrapper, 'submit');

      select!.options[2].selected = true;
      select!.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true }));
      expect(editMethod).to.have.been.calledOnceWith({ folder_uri: select!.options[2].value });
      expect(submitMethod).to.have.been.calledOnceWith(false);
    });

    it('disables folder selector when control is disabled', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control
            infer="actions"
            folders="https://demo.api/hapi/transaction_folders"
          >
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      await waitForIdle(control);
      const select = control.renderRoot
        .querySelector('foxy-i18n[infer="folder"][key="caption"]')
        ?.closest('label')
        ?.querySelector('select');

      expect(select).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(select).to.have.attribute('disabled');
    });

    it('makes folder selector readonly when control is readonly', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-actions-control
            infer="actions"
            folders="https://demo.api/hapi/transaction_folders"
          >
          </foxy-internal-transaction-actions-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionActionsControl;

      await waitForIdle(control);
      const select = control.renderRoot
        .querySelector('foxy-i18n[infer="folder"][key="caption"]')
        ?.closest('label')
        ?.querySelector('select');

      expect(select).to.not.have.attribute('readonly');

      control.readonly = true;
      await control.requestUpdate();
      expect(select).to.have.attribute('readonly');
    });
  });
});
