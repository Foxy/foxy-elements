import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { FormDialog } from '../FormDialog';

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
import { createRouter } from '../../../server/index';

describe('PaymentMethodCard', () => {
  it('extends NucleonElement', () => {
    expect(new PaymentMethodCard()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-payment-method-card', () => {
    expect(customElements.get('foxy-payment-method-card')).to.equal(PaymentMethodCard);
  });

  it('renders expiry date and last 4 digits once loaded', async () => {
    const data = await getTestData<Data>('./hapi/payment_methods/0');

    data.cc_exp_month = '01';
    data.cc_exp_year = '2021';
    data.cc_number_masked = '************1234';

    const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
    const element = await fixture<PaymentMethodCard>(layout);

    expect(await getByTestId(element, 'expiry')).to.include.text('01 / 2021');
    expect(await getByTestId(element, 'number')).to.include.text('1234');
  });

  it("doesn't render expiry date if it's null", async () => {
    const data = await getTestData<Data>('./hapi/payment_methods/0');

    data.cc_exp_month = null;
    data.cc_exp_year = null;

    const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
    const element = await fixture<PaymentMethodCard>(layout);

    expect(await getByTestId(element, 'expiry')).to.have.trimmed.text('');
  });

  it("doesn't render last 4 digits if it's null", async () => {
    const data = await getTestData<Data>('./hapi/payment_methods/0');

    data.cc_number_masked = null;

    const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
    const element = await fixture<PaymentMethodCard>(layout);

    expect(await getByTestId(element, 'number')).to.have.trimmed.text('');
  });

  describe('actions', () => {
    it('renders actions when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions')).to.exist;
    });

    it('renders "actions:before" slot when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:before')).to.have.property('localName', 'slot');
    });

    it('replaces "actions:before" slot with template "actions:before" if available and loaded', async () => {
      const name = 'actions:before';
      const data = await getTestData<Data>('./hapi/payment_methods/0');
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
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:after')).to.have.property('localName', 'slot');
    });

    it('replaces "actions:after" slot with template "actions:after" if available and loaded', async () => {
      const name = 'actions:after';
      const data = await getTestData<Data>('./hapi/payment_methods/0');
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
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      expect(await getByTestId(element, 'actions')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          hidden
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes actions', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          hiddencontrols="actions"
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions')).to.not.exist;
    });
  });

  describe('actions:update', () => {
    it('does not render actions:update by default', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions:update')).to.not.exist;
    });

    it('renders actions:update when configured with embed url', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`
        <foxy-payment-method-card embed-url="https://embed.foxy.io/v1?demo=default" .data=${data}>
        </foxy-payment-method-card>
      `;

      const element = await fixture<PaymentMethodCard>(layout);
      expect(await getByTestId(element, 'actions:update')).to.exist;
    });

    it('renders "actions:update:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`
        <foxy-payment-method-card embed-url="https://embed.foxy.io/v1?demo=default" .data=${data}>
        </foxy-payment-method-card>
      `;

      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:update:before')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "actions:update:before" slot with template "actions:update:before" if available', async () => {
      const name = 'actions:update:before';
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const actions = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card embed-url="https://embed.foxy.io/v1?demo=default" .data=${data}>
          <template slot=${name}>${unsafeHTML(actions)}</template>
        </foxy-payment-method-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(actions);
    });

    it('renders "actions:update:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`
        <foxy-payment-method-card embed-url="https://embed.foxy.io/v1?demo=default" .data=${data}>
        </foxy-payment-method-card>
      `;

      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:update:after')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "actions:update:after" slot with template "actions:update:after" if available', async () => {
      const name = 'actions:update:after';
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const actions = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card embed-url="https://embed.foxy.io/v1?demo=default" .data=${data}>
          <template slot=${name}>${unsafeHTML(actions)}</template>
        </foxy-payment-method-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(actions);
    });

    it('shows update dialog on click', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`
        <foxy-payment-method-card
          readonlycontrols="actions:update:form:foo"
          disabledcontrols="actions:update:form:bar"
          hiddencontrols="actions:update:form:baz"
          embed-url="https://embed.foxy.io/v1?demo=default"
          group="test"
          lang="es"
          ns="foo bar baz"
          .data=${data}
        >
        </foxy-payment-method-card>
      `;

      const element = await fixture<PaymentMethodCard>(layout);
      const control = await getByTestId<ButtonElement>(element, 'actions:update');
      const confirm = await getByTestId<FormDialog>(element, 'update-dialog');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));
      expect(showMethod).to.have.been.called;

      expect(confirm).to.have.attribute('readonlycontrols', 'foo');
      expect(confirm).to.have.attribute('disabledcontrols', 'bar');
      expect(confirm).to.have.attribute('hiddencontrols', 'status baz');
      expect(confirm).to.have.attribute('header', 'dialog_header_update');
      expect(confirm).to.have.attribute('group', 'test');
      expect(confirm).to.have.attribute('lang', 'es');
      expect(confirm).to.have.attribute('href', element.href);
      expect(confirm).to.have.attribute('form', 'foxy-update-payment-method-form');
      expect(confirm).to.have.attribute('ns', 'foo bar baz dialog');
      expect(confirm).to.have.attribute('close-on-patch');
      expect(confirm).to.have.attribute('alert');
      expect(confirm).to.have.deep.property('props', {
        '.embedUrl': 'https://embed.foxy.io/v1?demo=default',
      });
    });

    it('is hidden when card is hidden', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          embed-url="https://embed.foxy.io/v1?demo=default"
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          hidden
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:update')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes actions:update', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          hiddencontrols="actions:update"
          embed-url="https://embed.foxy.io/v1?demo=default"
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:update')).to.not.exist;
    });

    it('is enabled when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`
        <foxy-payment-method-card embed-url="https://embed.foxy.io/v1?demo=default" .data=${data}>
        </foxy-payment-method-card>
      `;

      const element = await fixture<PaymentMethodCard>(layout);
      expect(await getByTestId(element, 'actions:update')).not.to.have.attribute('disabled');
    });

    it('is disabled when card is disabled', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          embed-url="https://embed.foxy.io/v1?demo=default"
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          disabled
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:update')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes actions:update', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          disabledcontrols="actions:update"
          embed-url="https://embed.foxy.io/v1?demo=default"
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:update')).to.have.attribute('disabled');
    });
  });

  describe('actions:delete', () => {
    it('renders actions:delete when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions:delete')).to.exist;
    });

    it('renders "actions:delete:before" slot when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:delete:before')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "actions:delete:before" slot with template "actions:delete:before" if available and loaded', async () => {
      const name = 'actions:delete:before';
      const data = await getTestData<Data>('./hapi/payment_methods/0');
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
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByName(element, 'actions:delete:after')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "actions:delete:after" slot with template "actions:delete:after" if available and loaded', async () => {
      const name = 'actions:delete:after';
      const data = await getTestData<Data>('./hapi/payment_methods/0');
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
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const control = await getByTestId<ButtonElement>(element, 'actions:delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it('is visible when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);
      expect(await getByTestId(element, 'actions:delete')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          hidden
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes actions:delete', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          hiddencontrols="actions:delete"
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.not.exist;
    });

    it('is enabled when loaded', async () => {
      const data = await getTestData<Data>('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'actions:delete')).not.to.have.attribute('disabled');
    });

    it('is disabled when card is disabled', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
          disabled
        >
        </foxy-payment-method-card>
      `);

      expect(await getByTestId(element, 'actions:delete')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes actions:delete', async () => {
      const element = await fixture<PaymentMethodCard>(html`
        <foxy-payment-method-card
          .data=${await getTestData<Data>('./hapi/payment_methods/0')}
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
      const router = createRouter();
      const layout = html`
        <foxy-payment-method-card
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-payment-method-card>
      `;

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

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-method-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData('./hapi/payment_methods/0');
      const layout = html`<foxy-payment-method-card .data=${data}></foxy-payment-method-card>`;
      const element = await fixture<PaymentMethodCard>(layout);

      expect(await getByTestId(element, 'spinner')).to.not.exist;
    });
  });
});
