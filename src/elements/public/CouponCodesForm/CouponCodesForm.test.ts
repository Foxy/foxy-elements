import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { CouponCodesForm } from './CouponCodesForm';
import { EditableList } from '../../private/EditableList/EditableList';
import { InternalCouponCodesFormListItem } from './internal/InternalCouponCodesFormListItem';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TemplateResult } from 'lit-html';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { createRouter } from '../../../server/index';

describe('CouponCodesForm', () => {
  it('extends NucleonElement', () => {
    expect(new CouponCodesForm()).to.be.instanceOf(NucleonElement);
  });

  it('has i18n namespace "coupon-codes-form"', () => {
    expect(new CouponCodesForm()).to.have.property('ns', 'coupon-codes-form');
  });

  it('is defined as foxy-coupon-codes-form', () => {
    const classInRegistry = customElements.get('foxy-coupon-codes-form');
    expect(classInRegistry).to.equal(CouponCodesForm);
  });

  describe('codes', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      expect(await getByTestId(element, 'codes')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-coupon-codes-form hidden></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes codes', async () => {
      const layout = html`<foxy-coupon-codes-form hiddencontrols="codes"></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('renders "codes:before" slot by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const slot = await getByName(element, 'codes:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "codes:before" slot with template "codes:before" if available', async () => {
      const name = 'codes:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "codes:after" slot by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const slot = await getByName(element, 'codes:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "codes:after" slot with template "codes:after" if available', async () => {
      const name = 'codes:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders i18n label "code_plural"', async () => {
      const layout = html`<foxy-coupon-codes-form lang="es" ns="foo"></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const label = await getByKey(control, 'code_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-coupon-codes-form readonly></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes codes', async () => {
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form readonlycontrols="codes"></foxy-coupon-codes-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-coupon-codes-form href=${href}></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-coupon-codes-form href=${href}></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-coupon-codes-form disabled></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes codes', async () => {
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form disabledcontrols="codes"></foxy-coupon-codes-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('renders empty EditableList by default', async () => {
      const layout = html`<foxy-coupon-codes-form lang="es" ns="foo"></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.be.instanceOf(EditableList);
      expect(list).to.have.attribute('lang', 'es');
      expect(list).to.have.attribute('ns', 'foo');
      expect(list).to.have.deep.property('items', []);
    });

    it('renders items from form.coupon_codes in EditableList', async () => {
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form
          parent="https://demo.api/hapi/coupon_codes"
          group="test"
          lang="es"
          ns="foo"
        >
        </foxy-coupon-codes-form>
      `);

      element.edit({ coupon_codes: ['foo', 'bar'] });

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.nested.property('items[0].value', 'foo');
      expect(list).to.have.nested.property('items[1].value', 'bar');

      const item0Fixture = await fixture(list.items[0].label as TemplateResult);
      const item1Fixture = await fixture(list.items[1].label as TemplateResult);

      expect(item0Fixture).to.be.instanceOf(InternalCouponCodesFormListItem);
      expect(item0Fixture).to.have.attribute('group', 'test');
      expect(item0Fixture).to.have.attribute('href', 'https://demo.api/hapi/coupon_codes?code=foo');
      expect(item0Fixture).to.have.attribute('lang', 'es');
      expect(item0Fixture).to.have.attribute('ns', 'foo');

      expect(item1Fixture).to.be.instanceOf(InternalCouponCodesFormListItem);
      expect(item1Fixture).to.have.attribute('group', 'test');
      expect(item1Fixture).to.have.attribute('href', 'https://demo.api/hapi/coupon_codes?code=bar');
      expect(item1Fixture).to.have.attribute('lang', 'es');
      expect(item1Fixture).to.have.attribute('ns', 'foo');
    });

    it('adds unique items to form.coupon_codes on change', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      list.items = ['foo', 'foo', 'baz'].map(value => ({ value }));
      list.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.deep.nested.property('form.coupon_codes', ['foo', 'baz']);
    });

    it('adds unique space- or newline-separated items to form.coupon_codes on change', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      list.items = ['foo', 'foo', 'b az'].map(value => ({ value }));
      list.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.deep.nested.property('form.coupon_codes', ['foo', 'b', 'az']);
    });

    it('adds unique space- or newline-separated items to form.coupon_codes on paste', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;
      const clipboardData = new DataTransfer();

      clipboardData.setData('text', 'foo  \n bar    baz baz  ');
      list.dispatchEvent(new ClipboardEvent('paste', { clipboardData }));

      expect(element).to.have.deep.nested.property('form.coupon_codes', ['foo', 'bar', 'baz']);
    });

    it('in large datasets, renders only the last 16 codes', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const allCodes = new Array(256).fill(0).map((_, i) => `TEST-${i}`);

      element.edit({ coupon_codes: allCodes });

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      allCodes.slice(allCodes.length - 16).forEach((code, index) => {
        expect(list).to.have.nested.property(`items[${index}].value`, code);
      });
    });

    it('in large datasets, displays a warning about hidden codes', async () => {
      const layout = html`<foxy-coupon-codes-form lang="es" ns="foo"></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const allCodes = new Array(256).fill(0).map((_, i) => `TEST-${i}`);

      element.edit({ coupon_codes: allCodes });

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const header = await getByKey(control, 'hidden_codes_header');
      const explainer = await getByKey(control, 'hidden_codes_explainer');

      expect(header).to.exist;
      expect(header).to.have.attribute('options', JSON.stringify({ count: 256 - 16 }));
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });
  });

  describe('import', () => {
    it('if data is empty, renders import button', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);

      expect(await getByTestId(element, 'import')).to.exist;
    });

    it('renders with i18n key "import" for caption', async () => {
      const layout = html`<foxy-coupon-codes-form lang="es"></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = await getByTestId(element, 'import');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'import');
      expect(caption).to.have.attribute('ns', 'coupon-codes-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-coupon-codes-form disabled></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      element.edit({ coupon_codes: [] });

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);

      element.edit({ coupon_codes: ['foo', 'bar'] });
      element.submit();

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "import"', async () => {
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form disabledcontrols="import"></foxy-coupon-codes-form>
      `);

      element.edit({ coupon_codes: ['foo', 'bar'] });
      await element.updateComplete;

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'import');
      const submit = stub(element, 'submit');

      element.edit({ coupon_codes: ['foo', 'bar'] });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-coupon-codes-form hidden></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);

      expect(await getByTestId(element, 'import')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "import"', async () => {
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form hiddencontrols="import"></foxy-coupon-codes-form>
      `);

      expect(await getByTestId(element, 'import')).to.not.exist;
    });

    it('renders with "import:before" slot by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'import:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "import:before" slot with template "import:before" if available and rendered', async () => {
      const name = 'import:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "import:after" slot by default', async () => {
      const layout = html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'import:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "import:after" slot with template "import:after" if available and rendered', async () => {
      const name = 'import:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-codes-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-codes-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const element = await fixture<CouponCodesForm>(html`
        <foxy-coupon-codes-form href=${href} lang="es"></foxy-coupon-codes-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-codes-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/generate_codes/0');
      const layout = html`<foxy-coupon-codes-form .data=${data}></foxy-coupon-codes-form>`;
      const element = await fixture<CouponCodesForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
