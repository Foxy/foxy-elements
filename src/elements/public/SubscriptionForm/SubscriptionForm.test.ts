import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { CellContext } from '../Table/types';
import { Choice } from '../../private';
import { CollectionPages } from '../CollectionPages';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog';
import { InternalCalendar } from '../../internal/InternalCalendar';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { SubscriptionForm } from './index';
import { Table } from '../Table';
import { TransactionsTable } from '../TransactionsTable';
import { Data as TransactionsTableData } from '../TransactionsTable/types';
import { createRouter } from '../../../server/index';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { parseFrequency } from '../../../utils/parse-frequency';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('SubscriptionForm', () => {
  it('registers as foxy-subscription-form', () => {
    expect(customElements.get('foxy-subscription-form')).to.equal(SubscriptionForm);
  });

  it('extends NucleonElement', () => {
    expect(document.createElement('foxy-subscription-form')).to.be.instanceOf(NucleonElement);
  });

  describe('header', () => {
    it('once loaded, renders price and frequency in title', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);

      data.frequency = '3w';
      data._embedded['fx:last_transaction'].total_order = 25;
      data._embedded['fx:last_transaction'].currency_code = 'eur';

      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-title');
      const options = { count: 3, units: 'weekly', amount: '25 eur' };

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify(options));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'price_recurring');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('once loaded, renders price and frequency for .5m subscriptions in title', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);

      data.frequency = '.5m';
      data._embedded['fx:last_transaction'].total_order = 25;
      data._embedded['fx:last_transaction'].currency_code = 'eur';

      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-title');
      const options = { count: 0.5, units: 'monthly', amount: '25 eur' };

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify(options));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'price_twice_a_month');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('once loaded, renders a special status for failed subscriptions in subtitle', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const date = new Date().toISOString();
      const data = { ...(await getTestData<Data>(href)), first_failed_transaction_date: date };
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-subtitle');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify({ date }));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'subscription_failed');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('once loaded, renders a special status for subscriptions that are about to end in subtitle', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);

      data.first_failed_transaction_date = null;
      data.end_date = new Date(Date.now() + 86400000).toISOString();

      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-subtitle');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify({ date: data.end_date }));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'subscription_will_be_cancelled');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('once loaded, renders a special status for subscriptions that have ended in subtitle', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);

      data.first_failed_transaction_date = null;
      data.end_date = new Date(2020, 0, 1).toISOString();

      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-subtitle');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify({ date: data.end_date }));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'subscription_cancelled');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('once loaded, renders a special status for active subscriptions in subtitle', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);

      data.first_failed_transaction_date = null;
      data.end_date = null;

      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-subtitle');
      const options = { date: data.next_transaction_date };

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify(options));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'subscription_active');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('once loaded, renders a special status for inactive subscriptions in subtitle', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);

      data.first_failed_transaction_date = null;
      data.is_active = false;
      data.end_date = null;

      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'header-subtitle');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'subscription_inactive');
      expect(control).to.have.attribute('ns', 'subscription-form');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'header')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'header')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "header"', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form hiddencontrols="header"></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'header')).not.to.exist;
    });

    it('renders "header:before" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'header:before')).to.have.property('localName', 'slot');
    });

    it('replaces "header:before" slot with template "header:before" if available', async () => {
      const name = 'header:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "header:after" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'header:after')).to.have.property('localName', 'slot');
    });

    it('replaces "header:after" slot with template "header:after" if available', async () => {
      const name = 'header:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('items', () => {
    it('once loaded, renders subscription items', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data} lang="es"></foxy-subscription-form>
      `);

      const items = data._embedded['fx:transaction_template']._embedded['fx:items'];
      const itemElements = await getByTestClass(element, 'item');

      for (let i = 0; i < items.length; ++i) {
        const name = itemElements[i].querySelector('[data-testclass="item-name"]')!;
        const price = itemElements[i].querySelector('[data-testclass="item-price"]')!;
        const preview = itemElements[i].querySelector('[data-testclass="item-preview"]')!;
        const quantity = itemElements[i].querySelector('[data-testclass="item-quantity"]')!;
        const priceText = items[i].price.toLocaleString('es', {
          style: 'currency',
          currency: data!._embedded['fx:last_transaction'].currency_code,
        });

        expect(name).to.include.text(items[i].name);
        expect(price).to.include.text(priceText);
        expect(preview).to.have.property('image', items[i].image);
        expect(preview).to.have.property('quantity', items[i].quantity);

        if (items[i].quantity > 1) expect(quantity).to.include.text(items[i].quantity.toString());
      }
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'items')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'items')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "items"', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form hiddencontrols="items"></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'items')).not.to.exist;
    });

    it('renders "items:before" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'items:before')).to.have.property('localName', 'slot');
    });

    it('replaces "items:before" slot with template "items:before" if available', async () => {
      const name = 'items:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "items:after" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'items:after')).to.have.property('localName', 'slot');
    });

    it('replaces "items:after" slot with template "items:after" if available', async () => {
      const name = 'items:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    describe('actions', () => {
      it('renders foxy-i18n label with key "item_plural"', async () => {
        const layout = html`<foxy-subscription-form lang="es"></foxy-subscription-form>`;
        const element = await fixture<SubscriptionForm>(layout);
        const control = await getByTestId(element, 'items:actions-label');

        expect(control).to.have.property('localName', 'foxy-i18n');
        expect(control).to.have.attribute('lang', 'es');
        expect(control).to.have.attribute('key', 'item_plural');
        expect(control).to.have.attribute('ns', 'subscription-form');
      });

      it('is visible by default', async () => {
        const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
        const element = await fixture<SubscriptionForm>(layout);
        expect(await getByTestId(element, 'items:actions')).to.exist;
      });

      it('is hidden when form is hidden', async () => {
        const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
        const element = await fixture<SubscriptionForm>(layout);
        expect(await getByTestId(element, 'items:actions')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "items:actions"', async () => {
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form hiddencontrols="items:actions"></foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'items:actions')).not.to.exist;
      });

      it('renders "items:actions:before" slot by default', async () => {
        const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
        const element = await fixture<SubscriptionForm>(layout);
        const slot = await getByName(element, 'items:actions:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "items:actions:before" slot with template "items:actions:before" if available', async () => {
        const name = 'items:actions:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-subscription-form>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "items:actions:after" slot by default', async () => {
        const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
        const element = await fixture<SubscriptionForm>(layout);
        const slot = await getByName(element, 'items:actions:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "items:actions:after" slot with template "items:actions:after" if available', async () => {
        const name = 'items:actions:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-subscription-form>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });
    });
  });

  describe('end-date', () => {
    it('has foxy-i18n with key "end_subscription" for caption', async () => {
      const layout = html`<foxy-subscription-form lang="es"></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const control = await getByTestId(element, 'end-date');
      const caption = control!.querySelector('foxy-i18n');

      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'end_subscription');
      expect(caption).to.have.attribute('ns', 'subscription-form');
    });

    it('renders disabled by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('renders disabled if form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} disabled></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "end-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)} disabledcontrols="end-date">
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "end-date"', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form hiddencontrols="end-date"></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('renders "end-date:before" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'end-date:before')).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:before" slot with template "end-date:before" if available', async () => {
      const name = 'end-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "end-date:after" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'end-date:after')).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:after" slot with template "end-date:after" if available', async () => {
      const name = 'end-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('opens cancellation dialog on click', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const control = await getByTestId(element, 'end-date');
      const dialog = await getByTestId<FormDialog>(element, 'cancellation-form');
      const showMethod = stub(dialog!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(dialog).to.have.attribute('header', 'end_subscription');
      expect(dialog).to.have.attribute('parent', element.parent);
      expect(dialog).to.have.attribute('lang', element.lang);
      expect(dialog).to.have.attribute('href', element.href);
      expect(dialog).to.have.attribute('ns', element.ns);

      expect(showMethod).to.have.been.called;
    });

    it('passes disabled selector to the cancellation dialog', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const control = await getByTestId(element, 'cancellation-form');

      expect(control).to.have.attribute('disabledcontrols', '');

      element.setAttribute('disabled', '');
      await element.updateComplete;

      expect(control).to.have.attribute('disabledcontrols', 'not=*');

      element.removeAttribute('disabled');
      element.setAttribute('disabledcontrols', 'end-date:form:submit');
      await element.updateComplete;

      expect(control).to.have.attribute('disabledcontrols', 'submit:not=*');
    });

    it('passes readonly selector to the cancellation dialog', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const control = await getByTestId(element, 'cancellation-form');

      expect(control).to.have.attribute('readonlycontrols', '');

      element.setAttribute('readonly', '');
      await element.updateComplete;

      expect(control).to.have.attribute('readonlycontrols', 'not=*');

      element.removeAttribute('readonly');
      element.setAttribute('readonlycontrols', 'end-date:form:end-date');
      await element.updateComplete;

      expect(control).to.have.attribute('readonlycontrols', 'end-date:not=*');
    });

    it('passes hidden selector to the cancellation dialog', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form hiddencontrols="end-date:form:submit"></foxy-subscription-form>
      `);

      const control = await getByTestId(element, 'cancellation-form');
      expect(control).to.have.attribute('hiddencontrols', 'save-button submit:not=*');
    });

    it('passes templates to the cancellation dialog', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const content = '<div>Test content of submit:before</div>';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data}>
          <template slot="end-date:form:submit:before">${unsafeHTML(content)}</template>
        </foxy-subscription-form>
      `);

      const control = await getByTestId<FormDialog>(element, 'cancellation-form');
      expect(control!.templates).to.have.key('submit:before');
    });
  });

  describe('next-transaction-date', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "next-transaction-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="next-transaction-date">
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when settings are present but the form is still loading data', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form href="/" .settings=${{}}></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden if settings prohibit next date modification', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: false,
            },
          }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when subscription is inactive', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${{ ...(await getTestData<Data>(href)), is_active: false }}>
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when subscription has ended', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), end_date: '2012-08-10T11:58:54-0700' }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('renders "next-transaction-date:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const slot = await getByName(element, 'next-transaction-date:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "next-transaction-date:before" slot with template "next-transaction-date:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'next-transaction-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "next-transaction-date:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const slot = await getByName(element, 'next-transaction-date:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "next-transaction-date:after" slot with template "next-transaction-date:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'next-transaction-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders foxy-i18n label with key "next_transaction_date" when visible', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}> </foxy-subscription-form>
      `);

      const label = await getByKey(element, 'next_transaction_date');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'subscription-form');
    });

    it('when visible, renders foxy-internal-calendar bound to form.next_transaction_date', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      data.next_transaction_date = new Date(Date.now() + 84600000).toISOString();
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = await getByTag<InternalCalendar>(element, 'foxy-internal-calendar');

      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('value', data.next_transaction_date);
      expect(control).to.have.attribute('start', data.next_transaction_date.substr(0, 10));

      const newValue = new Date(Date.now() + 172800000).toISOString();
      control!.value = newValue;
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element.form).to.have.property('next_transaction_date', newValue);
    });

    it('is disabled when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data} disabled></foxy-subscription-form>
      `);

      expect(await getByTag(element, 'foxy-internal-calendar')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes "next-transaction-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          disabledcontrols="next-transaction-date"
        >
        </foxy-subscription-form>
      `);

      expect(await getByTag(element, 'foxy-internal-calendar')).to.have.attribute('disabled');
    });

    it('is readonly when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data} readonly></foxy-subscription-form>
      `);

      expect(await getByTag(element, 'foxy-internal-calendar')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes "next-transaction-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          readonlycontrols="next-transaction-date"
        >
        </foxy-subscription-form>
      `);

      expect(await getByTag(element, 'foxy-internal-calendar')).to.have.attribute('readonly');
    });

    it('disables dates matching rules in the settings, if provided', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: [{ jsonata_query: '*', min: '1y' }],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const control = await getByTag<InternalCalendar>(element, 'foxy-internal-calendar');
      expect(control!.checkAvailability(new Date(Date.now() + 84600000))).to.be.false;
    });

    it('disables past dates if no settings were provided', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)}></foxy-subscription-form>
      `);

      const control = await getByTag<InternalCalendar>(element, 'foxy-internal-calendar');
      expect(control!.checkAvailability(new Date(Date.now() - 84600000))).to.be.false;
    });
  });

  describe('frequency', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "frequency"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="frequency"> </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when settings are present but the form is still loading data', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form href="/" .settings=${{}}></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden if settings prohibit frequency modification', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: false,
            },
          }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when subscription is inactive', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${{ ...(await getTestData<Data>(href)), is_active: false }}>
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when subscription has ended', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), end_date: '2012-08-10T11:58:54-0700' }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('renders "frequency:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const slot = await getByName(element, 'frequency:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "frequency:before" slot with template "frequency:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'frequency:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "frequency:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const slot = await getByName(element, 'frequency:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "frequency:after" slot with template "frequency:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'frequency:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('when visible, renders radio list with common options by default', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const label = await getByKey(element, 'frequency_label');
      const list = await getByTestId(element, 'frequency');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'subscription-form');

      expect(list).to.be.instanceOf(Choice);
      expect(list).to.have.attribute('type', 'frequency');
      expect(list).to.have.attribute('custom');
      expect(list).to.have.deep.property('items', ['.5m', '1m', '1y']);

      ['.5m', '1m', '1y'].forEach((frequency, index) => {
        const item = list!.children[index];

        expect(item).to.have.property('localName', 'foxy-i18n');
        expect(item).to.have.attribute('options', JSON.stringify(parseFrequency(frequency)));
        expect(item).to.have.attribute('slot', `${frequency}-label`);
        expect(item).to.have.attribute('lang', 'es');
        expect(item).to.have.attribute('key', frequency === '.5m' ? 'twice_a_month' : 'frequency');
      });
    });

    it('when visible, renders radio list if settings have up to 4 frequency options', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const values = ['1y', '1m', '.5m', '1w'];
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [{ jsonata_query: '*', values }],
              allow_next_date_modification: [],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const list = await getByTestId(element, 'frequency');

      expect(list).to.be.instanceOf(Choice);
      expect(list).to.have.attribute('type', 'frequency');
      expect(list).not.to.have.attribute('custom');
      expect(list).to.have.deep.property('items', values);

      values.forEach((frequency, index) => {
        const item = list!.children[index];

        expect(item).to.have.property('localName', 'foxy-i18n');
        expect(item).to.have.attribute('options', JSON.stringify(parseFrequency(frequency)));
        expect(item).to.have.attribute('slot', `${frequency}-label`);
        expect(item).to.have.attribute('key', frequency === '.5m' ? 'twice_a_month' : 'frequency');
      });
    });

    it('when visible, renders dropdown if settings have 5+ frequency options', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const values = ['2y', '1y', '4m', '2w', '5d'];
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [{ jsonata_query: '*', values }],
              allow_next_date_modification: [],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const dropdown = await getByTestId(element, 'frequency');
      const items = values.map(value => ({ label: 'frequency', value }));

      expect(dropdown).to.be.instanceOf(ComboBoxElement);
      expect(dropdown).to.have.attribute('label', 'frequency_label');
      expect(dropdown).to.have.attribute('item-value-path', 'value');
      expect(dropdown).to.have.attribute('item-label-path', 'label');
      expect(dropdown).to.have.deep.property('items', items);
    });

    it('binds radio list value to form.frequency', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = { ...(await getTestData<Data>(href)), frequency: '3y' };
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const list = await getByTestId<Choice>(element, 'frequency');

      expect(list).to.have.property('value', '3y');

      list!.value = '.5m';
      list!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.frequency', '.5m');
    });

    it('binds dropdown value to form.frequency', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const values = ['2y', '1y', '4m', '2w', '5d'];
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [{ jsonata_query: '*', values }],
              allow_next_date_modification: [],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const dropdown = await getByTestId<ComboBoxElement>(element, 'frequency');

      expect(dropdown).to.have.property('value', '4m');

      dropdown!.value = '1y';
      dropdown!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.frequency', '1y');
    });

    [
      ['1y', '1m', '1w', '1d'],
      ['1y', '1m', '.5m', '1w', '1d'],
    ].forEach(values => {
      const target = values.length > 4 ? 'dropdown' : 'radio list';
      const settings = {
        subscriptions: {
          allow_frequency_modification: [{ jsonata_query: '*', values }],
          allow_next_date_modification: [],
        },
      };

      it(`${target} is disabled if form is disabled`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form
            disabled
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('disabled');
      });

      it(`${target} is disabled if disabledcontrols includes "frequency"`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form
            disabledcontrols="frequency"
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('disabled');
      });

      it(`${target} is readonly if form is readonly`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form
            readonly
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('readonly');
      });

      it(`${target} is readonly if readonlycontrols includes "frequency"`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<SubscriptionForm>(html`
          <foxy-subscription-form
            readonlycontrols="frequency"
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('readonly');
      });
    });
  });

  describe('transactions', () => {
    it('has foxy-i18n with key "transaction_plural" for caption', async () => {
      const layout = html`<foxy-subscription-form lang="es"></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const control = await getByTestId(element, 'transactions');
      const caption = control!.querySelector('foxy-i18n');

      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'transaction_plural');
      expect(caption).to.have.attribute('ns', 'subscription-form');
    });

    it('renders a foxy-table with transactions in foxy-collection-pages', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<SubscriptionForm>(
        html`<foxy-subscription-form .data=${data} lang="es" group="foo"></foxy-subscription-form>`
      );

      const control = await getByTestId(element, 'transactions');
      const pages = control!.querySelector('foxy-collection-pages') as CollectionPages<any>;

      expect(pages).to.exist;
      expect(pages).to.have.attribute('first', data._links['fx:transactions'].href);
      expect(pages).to.have.attribute('group', 'foo');
      expect(pages).to.have.attribute('lang', 'es');

      const table = pages.querySelector<Table<TransactionsTableData>>('foxy-table')!;

      expect(table).to.have.attribute('group', pages.group);
      expect(table).to.have.attribute('lang', pages.lang);
      expect(table).to.have.attribute('href', pages.pages[0]);

      type TableCellData = TransactionsTableData['_embedded']['fx:transactions'][number];
      type TableCellContext = CellContext<TransactionsTableData>;

      const transaction = await getTestData<TableCellData>('./hapi/transactions/0');
      const ctx: TableCellContext = { html, data: transaction, lang: pages.lang, ns: 'foo' };
      const extraFixtures = await fixture(
        html`
          <div>
            <div>${TransactionsTable.statusColumn.cell!(ctx)}</div>
            <div>${TransactionsTable.priceColumn.cell!(ctx)}</div>
            <div>${table.columns[0].cell!(ctx)}</div>
          </div>
        `
      );

      const statusHTML = extraFixtures.children[0].innerHTML;
      const priceHTML = extraFixtures.children[1].innerHTML;
      const firstColumnHTML = extraFixtures.children[2].innerHTML;

      expect(firstColumnHTML).to.contain(statusHTML);
      expect(firstColumnHTML).to.contain(priceHTML);

      expect(table.columns[1]).to.deep.equal({
        cell: TransactionsTable.idColumn.cell,
        hideBelow: 'sm',
      });

      expect(table.columns[2]).to.deep.equal({ cell: TransactionsTable.dateColumn.cell });
      expect(table.columns[3]).to.deep.equal({ cell: TransactionsTable.receiptColumn.cell });
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'transactions')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);

      expect(await getByTestId(element, 'transactions')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "transactions"', async () => {
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form hiddencontrols="transactions"></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'transactions')).not.to.exist;
    });

    it('renders "transactions:before" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'transactions:before')).to.have.property('localName', 'slot');
    });

    it('replaces "transactions:before" slot with template "transactions:before" if available', async () => {
      const name = 'transactions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "transactions:after" slot by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      expect(await getByName(element, 'transactions:after')).to.have.property('localName', 'slot');
    });

    it('replaces "transactions:after" slot with template "transactions:after" if available', async () => {
      const name = 'transactions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SubscriptionForm>(html`
        <foxy-subscription-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-subscription-form href=${href} lang="es"></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'subscription-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-subscription-form
          href="https://demo.api/virtual/empty?status=404"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `;

      const element = await fixture<SubscriptionForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'subscription-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<SubscriptionForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
