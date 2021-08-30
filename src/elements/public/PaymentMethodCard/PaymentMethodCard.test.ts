import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Data } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { PaymentMethodCard } from './PaymentMethodCard';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('PaymentMethodCard', () => {
  it('extends NucleonElement', () => {
    expect(new PaymentMethodCard()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-payment-method-card', () => {
    expect(customElements.get('foxy-payment-method-card')).to.equal(PaymentMethodCard);
  });

  it('renders expiry date and last 4 digits once loaded', async () => {
    const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');

    data.cc_exp_month = '01';
    data.cc_exp_year = '2021';
    data.cc_number_masked = '************1234';

    const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
    const element = await fixture<PaymentMethodCard>(layout);

    expect(await getByTestId(element, 'expiry')).to.include.text('01 / 2021');
    expect(await getByTestId(element, 'number')).to.include.text('1234');
  });

  it("doesn't render expiry date if it's null", async () => {
    const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');

    data.cc_exp_month = null;
    data.cc_exp_year = null;

    const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
    const element = await fixture<PaymentMethodCard>(layout);

    expect(await getByTestId(element, 'expiry')).to.have.trimmed.text('');
  });

  it("doesn't render last 4 digits if it's null", async () => {
    const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');

    data.cc_number_masked = null;

    const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
    const element = await fixture<PaymentMethodCard>(layout);

    expect(await getByTestId(element, 'number')).to.have.trimmed.text('');
  });

  describe('actions', () => {
    it('renders actions when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions')).to.exist;
    });

    it('renders "actions:before" slot when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:before')).to.have.property('localName', 'slot');
    });

    it('replaces "actions:before" slot with template "actions:before" if available and loaded', async () => {
      const name = 'actions:before';
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const actions = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card .data=${data}>
          <template slot=${name}>${unsafeHTML(actions)}</template>
        </foxy-payment-method-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(actions);
    });

    it('renders "actions:after" slot when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:after')).to.have.property('localName', 'slot');
    });

    it('replaces "actions:after" slot with template "actions:after" if available and loaded', async () => {
      const name = 'actions:after';
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const actions = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card .data=${data}>
          <template slot=${name}>${unsafeHTML(actions)}</template>
        </foxy-payment-method-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(actions);
    });

    it('is visible when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      expect(await getByTestId(element, 'actions')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./s/admin/customers/0/default_payment_method')}
          hidden
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes actions', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./s/admin/customers/0/default_payment_method')}
          hiddencontrols="actions"
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions')).to.not.exist;
    });
  });

  describe('actions:delete', () => {
    it('renders actions:delete when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions:delete')).to.exist;
    });

    it('renders "actions:delete:before" slot when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:delete:before')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "actions:delete:before" slot with template "actions:delete:before" if available and loaded', async () => {
      const name = 'actions:delete:before';
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const actions = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card .data=${data}>
          <template slot=${name}>${unsafeHTML(actions)}</template>
        </foxy-payment-method-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(actions);
    });

    it('renders "actions:delete:after" slot when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:delete:after')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "actions:delete:after" slot with template "actions:delete:after" if available and loaded', async () => {
      const name = 'actions:delete:after';
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const actions = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card .data=${data}>
          <template slot=${name}>${unsafeHTML(actions)}</template>
        </foxy-payment-method-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(actions);
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const control = await getByTestId<ButtonElement>(element, 'actions:delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it('is visible when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      expect(await getByTestId(element, 'actions:delete')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./s/admin/customers/0/default_payment_method')}
          hidden
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes actions:delete', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./s/admin/customers/0/default_payment_method')}
          hiddencontrols="actions:delete"
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.not.exist;
    });

    it('is enabled when loaded', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions:delete')).not.to.have.attribute('disabled');
    });

    it('is disabled when card is disabled', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./s/admin/customers/0/default_payment_method')}
          disabled
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes actions:delete', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./s/admin/customers/0/default_payment_method')}
          disabledcontrols="actions:delete"
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.have.attribute('disabled');
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-payment-method-card lang="es"></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-method-card spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const layout = html`<foxy-payment-method-card href="/" lang="es"></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-method-card spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-payment-method-card href="/" lang="es"></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      await waitUntil(() => element.in('fail'));

      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-method-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData('./s/admin/customers/0/default_payment_method');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'spinner')).to.not.exist;
    });
  });
});
