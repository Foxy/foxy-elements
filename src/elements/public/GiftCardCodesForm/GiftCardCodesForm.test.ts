import type { FetchEvent } from '../NucleonElement/FetchEvent';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { EditableList } from '../../private/EditableList/EditableList';
import { GiftCardCodesForm } from './index';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { InternalGiftCardCodesFormListItem } from './internal/InternalGiftCardCodesFormListItem';
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

describe('GiftCardCodesForm', () => {
  it('extends NucleonElement', () => {
    expect(new GiftCardCodesForm()).to.be.instanceOf(NucleonElement);
  });

  it('has i18n namespace "gift-card-codes-form"', () => {
    expect(new GiftCardCodesForm()).to.have.property('ns', 'gift-card-codes-form');
  });

  it('is defined as foxy-gift-card-codes-form', () => {
    const classInRegistry = customElements.get('foxy-gift-card-codes-form');
    expect(classInRegistry).to.equal(GiftCardCodesForm);
  });

  describe('codes', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      expect(await getByTestId(element, 'codes')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-codes-form hidden></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes codes', async () => {
      const layout = html`<foxy-gift-card-codes-form
        hiddencontrols="codes"
      ></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('renders "codes:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const slot = await getByName(element, 'codes:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "codes:before" slot with template "codes:before" if available', async () => {
      const name = 'codes:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "codes:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const slot = await getByName(element, 'codes:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "codes:after" slot with template "codes:after" if available', async () => {
      const name = 'codes:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders i18n label "code_plural"', async () => {
      const layout = html`<foxy-gift-card-codes-form
        lang="es"
        ns="foo"
      ></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const label = await getByKey(control, 'code_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-codes-form readonly></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes codes', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form readonlycontrols="codes"></foxy-gift-card-codes-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-codes-form href=${href}></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-codes-form href=${href}></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-codes-form disabled></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes codes', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form disabledcontrols="codes"></foxy-gift-card-codes-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.attribute('disabled');
    });

    it('renders empty EditableList by default', async () => {
      const layout = html`<foxy-gift-card-codes-form
        lang="es"
        ns="foo"
      ></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.be.instanceOf(EditableList);
      expect(list).to.have.attribute('lang', 'es');
      expect(list).to.have.attribute('ns', 'foo');
      expect(list).to.have.deep.property('items', []);
    });

    it('renders items from form.gift_card_codes in EditableList', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form
          parent="https://demo.api/hapi/gift_card_codes"
          group="test"
          lang="es"
          ns="foo"
        >
        </foxy-gift-card-codes-form>
      `);

      element.edit({ gift_card_codes: ['foo', 'bar'] });

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      expect(list).to.have.nested.property('items[0].value', 'foo');
      expect(list).to.have.nested.property('items[1].value', 'bar');

      const item0Fixture = await fixture(list.items[0].label as TemplateResult);
      const item1Fixture = await fixture(list.items[1].label as TemplateResult);

      expect(item0Fixture).to.be.instanceOf(InternalGiftCardCodesFormListItem);
      expect(item0Fixture).to.have.attribute('group', 'test');
      expect(item0Fixture).to.have.attribute(
        'href',
        'https://demo.api/hapi/gift_card_codes?code=foo'
      );
      expect(item0Fixture).to.have.attribute('lang', 'es');
      expect(item0Fixture).to.have.attribute('ns', 'foo');

      expect(item1Fixture).to.be.instanceOf(InternalGiftCardCodesFormListItem);
      expect(item1Fixture).to.have.attribute('group', 'test');
      expect(item1Fixture).to.have.attribute(
        'href',
        'https://demo.api/hapi/gift_card_codes?code=bar'
      );
      expect(item1Fixture).to.have.attribute('lang', 'es');
      expect(item1Fixture).to.have.attribute('ns', 'foo');
    });

    it('adds unique items to form.gift_card_codes on change', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      list.items = ['foo', 'foo', 'baz'].map(value => ({ value }));
      list.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.deep.nested.property('form.gift_card_codes', ['foo', 'baz']);
    });

    it('adds unique space- or newline-separated items to form.gift_card_codes on paste', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;
      const clipboardData = new DataTransfer();

      clipboardData.setData('text', 'foo  \n bar    baz baz  ');
      list.dispatchEvent(new ClipboardEvent('paste', { clipboardData }));

      expect(element).to.have.deep.nested.property('form.gift_card_codes', ['foo', 'bar', 'baz']);
    });

    it('in large datasets, renders only the last 16 codes', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const allCodes = new Array(256).fill(0).map((_, i) => `TEST-${i}`);

      element.edit({ gift_card_codes: allCodes });

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const list = (await getByTestId(control, 'codes:list')) as EditableList;

      allCodes.slice(allCodes.length - 16).forEach((code, index) => {
        expect(list).to.have.nested.property(`items[${index}].value`, code);
      });
    });

    it('in large datasets, displays a warning about hidden codes', async () => {
      const layout = html`<foxy-gift-card-codes-form
        lang="es"
        ns="foo"
      ></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const allCodes = new Array(256).fill(0).map((_, i) => `TEST-${i}`);

      element.edit({ gift_card_codes: allCodes });

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

  describe('current-balance', () => {
    it('has i18n label key "balance"', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'current-balance');

      expect(control).to.have.property('label', 'balance');
    });

    it('has value of form.current_balance', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      element.edit({ current_balance: 10 });

      const control = await getByTestId<IntegerFieldElement>(element, 'current-balance');
      expect(control).to.have.property('value', '10');
    });

    it('writes to form.current_balance on change', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'current-balance');

      control!.value = '10';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.current_balance', 10);
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'current-balance');
      const submit = stub(element, 'submit');

      element.edit({ gift_card_codes: ['foo', 'bar'], current_balance: 10 });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "current-balance:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'current-balance:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "current-balance:before" slot with template "current-balance:before" if available', async () => {
      const name = 'current-balance:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "current-balance:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'current-balance:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "current-balance:after" slot with template "current-balance:after" if available', async () => {
      const name = 'current-balance:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-codes-form readonly></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes current-balance', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form readonlycontrols="current-balance"></foxy-gift-card-codes-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-codes-form href=${href}></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-codes-form href=${href}></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-codes-form disabled></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes current-balance', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form disabledcontrols="current-balance"></foxy-gift-card-codes-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-codes-form hidden></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes current-balance', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form hiddencontrols="current-balance"></foxy-gift-card-codes-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.not.exist;
    });
  });

  describe('import', () => {
    it('if data is empty, renders import button', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'import')).to.exist;
    });

    it('renders with i18n key "import" for caption', async () => {
      const layout = html`<foxy-gift-card-codes-form lang="es"></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = await getByTestId(element, 'import');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'import');
      expect(caption).to.have.attribute('ns', 'gift-card-codes-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-gift-card-codes-form disabled></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      element.edit({ gift_card_codes: [] });

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      element.edit({ gift_card_codes: ['foo', 'bar'] });
      element.submit();

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "import"', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form disabledcontrols="import"></foxy-gift-card-codes-form>
      `);

      element.edit({ gift_card_codes: ['foo', 'bar'] });
      await element.updateComplete;

      expect(await getByTestId(element, 'import')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'import');
      const submit = stub(element, 'submit');

      element.edit({ gift_card_codes: ['foo', 'bar'] });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-gift-card-codes-form hidden></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);

      expect(await getByTestId(element, 'import')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "import"', async () => {
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form hiddencontrols="import"></foxy-gift-card-codes-form>
      `);

      expect(await getByTestId(element, 'import')).to.not.exist;
    });

    it('renders with "import:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'import:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "import:before" slot with template "import:before" if available and rendered', async () => {
      const name = 'import:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "import:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'import:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "import:after" slot with template "import:after" if available and rendered', async () => {
      const name = 'import:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-codes-form>
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
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-codes-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-codes-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const element = await fixture<GiftCardCodesForm>(html`
        <foxy-gift-card-codes-form href=${href} lang="es"></foxy-gift-card-codes-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-codes-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/generate_codes/0');
      const layout = html`<foxy-gift-card-codes-form .data=${data}></foxy-gift-card-codes-form>`;
      const element = await fixture<GiftCardCodesForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
