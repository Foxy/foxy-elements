import type { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import type { ItemRenderer } from '../CollectionPage/types';
import type { Data } from './types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { CouponCodeForm } from './CouponCodeForm';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';
import { createRouter } from '../../../server/index';
import { spread } from '@open-wc/lit-helpers';
import { render } from 'lit-html';
import { stub } from 'sinon';

describe('foxy-coupon-code-form', () => {
  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-admin-transaction-card', () => {
    expect(customElements.get('foxy-admin-transaction-card')).to.exist;
  });

  it('defines itself as foxy-coupon-code-form', () => {
    expect(customElements.get('foxy-coupon-code-form')).to.exist;
  });

  it('extends InternalForm', () => {
    expect(new CouponCodeForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of "coupon-code-form"', () => {
    expect(CouponCodeForm).to.have.property('defaultNS', 'coupon-code-form');
    expect(new CouponCodeForm()).to.have.property('ns', 'coupon-code-form');
  });

  it('has a reactive property getTransactionPageHref', () => {
    expect(new CouponCodeForm()).to.have.property('getTransactionPageHref', null);
    expect(CouponCodeForm).to.have.deep.nested.property('properties.getTransactionPageHref', {
      attribute: false,
    });
  });

  it('produces "code:v8n_required" v8n error when code is empty', () => {
    const element = new CouponCodeForm();
    expect(element.errors).to.include('code:v8n_required');
    element.edit({ code: 'foo' });
    expect(element.errors).not.to.include('code:v8n_required');
  });

  it('produces "code:v8n_too_long" v8n error when code is too long', () => {
    const element = new CouponCodeForm();
    expect(element.errors).to.not.include('code:v8n_too_long');
    element.edit({ code: 'foo' });
    expect(element.errors).not.to.include('code:v8n_too_long');
    element.edit({ code: 'a'.repeat(51) });
    expect(element.errors).to.include('code:v8n_too_long');
  });

  it('produces "code:v8n_has_spaces" v8n error when code contains spaces', () => {
    const element = new CouponCodeForm();
    expect(element.errors).to.not.include('code:v8n_has_spaces');
    element.edit({ code: 'foo' });
    expect(element.errors).not.to.include('code:v8n_has_spaces');
    element.edit({ code: 'foo bar' });
    expect(element.errors).to.include('code:v8n_has_spaces');
  });

  it('hides transactions when href is not set', () => {
    const element = new CouponCodeForm();
    expect(element.hiddenSelector.matches('transactions', true)).to.be.true;

    element.href = 'https://demo.api/hapi/coupon_codes/0';
    expect(element.hiddenSelector.matches('transactions', true)).to.be.false;
  });

  it('renders a form header', () => {
    const form = new CouponCodeForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a general summary control', async () => {
    const element = await fixture<CouponCodeForm>(
      html`<foxy-coupon-code-form></foxy-coupon-code-form>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="general"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for code in the general summary', async () => {
    const element = await fixture<CouponCodeForm>(
      html`<foxy-coupon-code-form></foxy-coupon-code-form>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="code"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a list of transactions', async () => {
    const element = await fixture<CouponCodeForm>(
      html`<foxy-coupon-code-form></foxy-coupon-code-form>`
    );

    const control = element.renderRoot.querySelector<InternalAsyncListControl>(
      'foxy-internal-async-list-control[infer=transactions]'
    );

    expect(control).to.exist;
    expect(control).to.not.have.attribute('first');
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('hide-delete-button');
    expect(control).to.have.property('getPageHref', null);

    const itemRoot = document.createElement('div');
    render(
      (control!.item as ItemRenderer<Data>)({
        simplifyNsLoading: false,
        readonlyControls: BooleanSelector.False,
        disabledControls: BooleanSelector.False,
        hiddenControls: BooleanSelector.False,
        templates: {},
        readonly: false,
        disabled: false,
        previous: null,
        related: [],
        hidden: false,
        parent: 'https://demo.api/hapi/coupon_code_transactions',
        spread,
        props: {},
        group: '',
        html,
        lang: 'en',
        href: 'https://demo.api/hapi/coupon_code_transactions/0',
        data: await getTestData('./hapi/coupon_code_transactions/0'),
        next: null,
        ns: '',
      }),
      itemRoot
    );

    const item = itemRoot.querySelector('foxy-admin-transaction-card');
    expect(item).to.exist;
    expect(item).to.have.attribute('infer', '');
    expect(item).to.have.attribute(
      'href',
      'https://demo.api/hapi/transactions/0?zoom=folder%2Citems'
    );

    element.getTransactionPageHref = () => 'https://demo.api/hapi/transactions';
    await element.requestUpdate();
    expect(control).to.have.property('getPageHref', element.getTransactionPageHref);

    element.data = await getTestData('./hapi/coupon_codes/0');
    const url = new URL(element.data!._links['fx:coupon_code_transactions'].href);
    url.searchParams.set('zoom', 'items');
    await element.requestUpdate();
    expect(control).to.have.attribute('first', url.toString());
  });

  describe('current user scope', () => {
    const create = async (scope = '') => {
      const router = createRouter();
      const form = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form
          current-user-scope=${scope}
          href="https://demo.api/hapi/coupon_codes/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-code-form>
      `);

      await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
      await form.requestUpdate();
      return form;
    };

    const getControl = async (form: CouponCodeForm, selector: string) => {
      const control = form.renderRoot.querySelector<any>(selector)!;
      await control.requestUpdate();
      return control;
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const form = await create();

      [null, 'store_full_access'].forEach(scope => {
        form.currentUserScope = scope;
        expect(form.hiddenSelector.toString()).to.equal('undo submit create');
        expect(form.readonlySelector.toString()).to.equal('');
      });
    });

    it('is read-only and hides transactions with coupons_read item_categories_read', async () => {
      const form = await create('coupons_read item_categories_read');
      expect(form.readonlySelector.matches('any-control', true)).to.be.true;
      expect(form.hiddenSelector.matches('delete', true)).to.be.true;
      expect((await getControl(form, '[infer="general"]')).readonly).to.be.true;
      expect((await getControl(form, '[infer="transactions"]')).hidden).to.be.true;

      form.currentUserScope = 'coupons_write transactions_read';
      await form.requestUpdate();
      expect(form.hiddenSelector.matches('delete', true)).to.be.false;
      expect((await getControl(form, '[infer="general"]')).readonly).to.be.false;
      expect((await getControl(form, '[infer="transactions"]')).hidden).to.be.false;
    });
  });
});
