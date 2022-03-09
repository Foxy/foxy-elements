import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CouponCodeForm } from './index';
import { Data } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('CouponCodeForm', () => {
  it('extends NucleonElement', () => {
    expect(new CouponCodeForm()).to.be.instanceOf(NucleonElement);
  });

  it('defines a custom element named foxy-coupon-code-form', () => {
    expect(customElements.get('foxy-coupon-code-form')).to.equal(CouponCodeForm);
  });

  it('has a default i18next namespace "coupon-code-form"', () => {
    expect(new CouponCodeForm()).to.have.property('ns', 'coupon-code-form');
  });

  describe('code', () => {
    it('has i18n label key "code"', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'code');

      expect(control).to.have.property('label', 'code');
    });

    it('has value of form.code', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      element.edit({ code: 'TEST_123' });

      const control = await getByTestId<TextFieldElement>(element, 'code');
      expect(control).to.have.property('value', 'TEST_123');
    });

    it('writes to form.code on input', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'code');

      control!.value = 'TEST_123';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.code', 'TEST_123');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/coupon_codes/0');
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'code');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ code: 'TEST_123' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "code:before" slot by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'code:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "code:before" slot with template "code:before" if available', async () => {
      const name = 'code:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "code:after" slot by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'code:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "code:after" slot with template "code:after" if available', async () => {
      const name = 'code:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-coupon-code-form readonly></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes code', async () => {
      const layout = html`<foxy-coupon-code-form readonlycontrols="code"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-coupon-code-form href=${href}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-coupon-code-form href=${href}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-coupon-code-form disabled></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes code', async () => {
      const layout = html`<foxy-coupon-code-form disabledcontrols="code"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-coupon-code-form hidden></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes code', async () => {
      const layout = html`<foxy-coupon-code-form hiddencontrols="code"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.not.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/coupon_codes/0');
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/coupon_codes/0');
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/coupon_codes/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/coupon_codes/0');
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/coupon_codes/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-coupon-code-form lang="es"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'coupon-code-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-coupon-code-form disabled></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      element.edit({ code: 'TEST_123' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form disabledcontrols="create"></foxy-coupon-code-form>
      `);

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'create');
      const submit = stub(element, 'submit');

      element.edit({ code: 'TEST_123' });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-coupon-code-form hidden></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-coupon-code-form hiddencontrols="create"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data} disabled></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const layout = html`<foxy-coupon-code-form></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      element.data = await getTestData<Data>('https://demo.api/hapi/coupon_codes/0');
      element.lang = 'es';
      element.ns = 'foo';

      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'foo');
    });

    it('renders disabled if form is disabled', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data} disabled></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      element.edit({ code: 'TEST_123' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form
          .data=${await getTestData<Data>('./hapi/coupon_codes/0')}
          disabledcontrols="delete"
        >
        </foxy-coupon-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data} hidden></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form
          .data=${await getTestData<Data>('./hapi/coupon_codes/0')}
          hiddencontrols="delete"
        >
        </foxy-coupon-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/coupon_codes/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodeForm>(html`
        <foxy-coupon-code-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-code-form>
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
      const layout = html`<foxy-coupon-code-form href=${href} lang="es"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-code-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-coupon-code-form href=${href} lang="es"></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-code-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/coupon_codes/0');
      const layout = html`<foxy-coupon-code-form .data=${data}></foxy-coupon-code-form>`;
      const element = await fixture<CouponCodeForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
