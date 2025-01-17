import '../../../NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalTransactionActionsControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';
import { html } from 'lit-html';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { stub } from 'sinon';

import unset from 'lodash-es/unset';
import set from 'lodash-es/set';

describe('Transaction', () => {
  describe('InternalTransactionActionsControl', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-internal-transaction-post-action-control', () => {
      expect(customElements.get('foxy-internal-transaction-post-action-control')).to.exist;
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
      expect(action).to.have.property('localName', 'foxy-internal-transaction-post-action-control');
      expect(action).to.have.property('theme', 'success');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('done'));

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
      expect(action).to.have.property('localName', 'foxy-internal-transaction-post-action-control');
      expect(action).to.have.property('theme', 'error');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('done'));

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
      expect(action).to.have.property('localName', 'foxy-internal-transaction-post-action-control');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('done'));

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
      expect(action).to.have.property('localName', 'foxy-internal-transaction-post-action-control');
      expect(action).to.have.property('href', 'test');

      const refreshMethod = stub(wrapper, 'refresh');
      action?.dispatchEvent(new CustomEvent('done'));

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
  });
});
