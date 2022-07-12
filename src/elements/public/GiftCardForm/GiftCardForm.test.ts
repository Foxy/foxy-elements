import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CategoryRestrictionsPage } from './private/CategoryRestrictionsPage';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { Data } from './types';
import { EditableList } from '../../private/EditableList/EditableList';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { FrequencyInput } from '../../private/FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../../private/FrequencyInput/FrequencyInputChangeEvent';
import { GiftCardForm } from './index';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Pagination } from '../Pagination';
import { QueryBuilder } from '../QueryBuilder';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { Table } from '../Table/Table';
import { TemplateResult } from 'lit-html';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { createRouter } from '../../../server/index';
import { currencies } from './currencies';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('GiftCardForm', () => {
  it('extends NucleonElement', () => {
    expect(new GiftCardForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-gift-card-form', () => {
    expect(customElements.get('foxy-gift-card-form')).to.equal(GiftCardForm);
  });

  it('has a default i18n namespace "gift-card-form"', () => {
    expect(new GiftCardForm()).to.have.property('ns', 'gift-card-form');
  });

  describe('name', () => {
    it('is an instance of Vaadin.TextFieldElement', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      expect(control).to.be.instanceOf(TextFieldElement);
    });

    it('has i18n label key "name"', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      expect(control).to.have.property('label', 'name');
    });

    it('has value of form.name', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.edit({ name: 'Test Gift Card' });

      const control = await getByTestId<TextFieldElement>(element, 'name');
      expect(control).to.have.property('value', 'Test Gift Card');
    });

    it('writes to form.name on input', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      control!.value = 'Test Gift Card';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.name', 'Test Gift Card');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ name: 'Test Gift Card' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByName(element, 'name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const name = 'name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const element = await fixture<GiftCardForm>(
        html`<foxy-gift-card-form></foxy-gift-card-form>`
      );
      const slot = await getByName<HTMLSlotElement>(element, 'name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const name = 'name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-form readonly></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes name', async () => {
      const layout = html`<foxy-gift-card-form readonlycontrols="name"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-form href=${href}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-form href=${href}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-form disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes name', async () => {
      const layout = html`<foxy-gift-card-form disabledcontrols="name"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-form hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes name', async () => {
      const layout = html`<foxy-gift-card-form hiddencontrols="name"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });
  });

  describe('currency', () => {
    it('is an instance of Vaadin.ComboBoxElement', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<ComboBoxElement>(element, 'currency');

      expect(control).to.be.instanceOf(ComboBoxElement);
    });

    it('has i18n label key "currency"', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<ComboBoxElement>(element, 'currency');

      expect(control).to.have.property('label', 'currency');
    });

    it('offers a list of currency code suggestions', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<ComboBoxElement>(element, 'currency');
      const expectedItems = currencies.map(code => ({
        label: `currency_${code} (${code.toUpperCase()})`,
        value: code,
      }));

      expect(control).to.have.deep.property('items', expectedItems);
    });

    it('has value of form.currency', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.edit({ currency_code: 'cad' });

      const control = await getByTestId<ComboBoxElement>(element, 'currency');
      expect(control).to.have.property('value', 'cad');
    });

    it('writes to form.currency on change', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<ComboBoxElement>(element, 'currency');

      control!.value = 'cad';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.currency_code', 'cad');
    });

    it('renders "currency:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByName(element, 'currency:before')).to.have.property('localName', 'slot');
    });

    it('replaces "currency:before" slot with template "currency:before" if available', async () => {
      const name = 'currency:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "currency:after" slot by default', async () => {
      const element = await fixture<GiftCardForm>(
        html`<foxy-gift-card-form></foxy-gift-card-form>`
      );
      const slot = await getByName<HTMLSlotElement>(element, 'currency:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "currency:after" slot with template "currency:after" if available', async () => {
      const name = 'currency:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-form readonly></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes currency', async () => {
      const layout = html`<foxy-gift-card-form readonlycontrols="currency"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-form href=${href}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-form href=${href}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-form disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes currency', async () => {
      const layout = html`<foxy-gift-card-form disabledcontrols="currency"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-form hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes currency', async () => {
      const layout = html`<foxy-gift-card-form hiddencontrols="currency"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'currency')).to.not.exist;
    });
  });

  describe('expires', () => {
    it('is an instance of FrequencyInput', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<FrequencyInput>(element, 'expires');

      expect(control).to.be.instanceOf(FrequencyInput);
    });

    it('has i18n label key "expires_after"', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<FrequencyInput>(element, 'expires');

      expect(control).to.have.property('label', 'expires_after');
    });

    it('has value of form.expires_after', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.edit({ expires_after: '2m' });

      const control = await getByTestId<FrequencyInput>(element, 'expires');
      expect(control).to.have.property('value', '2m');
    });

    it('writes to form.expires_after on change', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<FrequencyInput>(element, 'expires');

      control!.value = '5y';
      control!.dispatchEvent(new FrequencyInputChangeEvent('5y'));

      expect(element).to.have.nested.property('form.expires_after', '5y');
    });

    it('renders "expires:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByName(element, 'expires:before')).to.have.property('localName', 'slot');
    });

    it('replaces "expires:before" slot with template "expires:before" if available', async () => {
      const name = 'expires:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "expires:after" slot by default', async () => {
      const element = await fixture<GiftCardForm>(
        html`<foxy-gift-card-form></foxy-gift-card-form>`
      );
      const slot = await getByName<HTMLSlotElement>(element, 'expires:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "expires:after" slot with template "expires:after" if available', async () => {
      const name = 'expires:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-form readonly></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes expires', async () => {
      const layout = html`<foxy-gift-card-form readonlycontrols="expires"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-form href=${href}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-form href=${href}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-form disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes expires', async () => {
      const layout = html`<foxy-gift-card-form disabledcontrols="expires"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-form hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes expires', async () => {
      const layout = html`<foxy-gift-card-form hiddencontrols="expires"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'expires')).to.not.exist;
    });
  });

  describe('codes', () => {
    it('renders "codes:before" slot when visible', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      expect(await getByName(element, 'codes:before')).to.have.property('localName', 'slot');
    });

    it('replaces "codes:before" slot with template "codes:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const name = 'codes:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "codes:after" slot when visible', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'codes:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "codes:after" slot with template "codes:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const name = 'codes:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is enabled by default when visible', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).not.to.have.attribute('disabled');
      });
    });

    it('is disabled when form is sending changes', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const stall = new Promise<Response>(() => void 0);

      element.addEventListener('fetch', evt => (evt as FetchEvent).respondWith(stall));
      element.edit({ name: 'Foo' });
      element.submit();
      await waitUntil(() => element.in('busy'));

      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is disabled when form has failed to send changes', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const error = () => Promise.resolve(new Response(null, { status: 500 }));

      element.addEventListener('fetch', evt => (evt as FetchEvent).respondWith(error()));
      element.edit({ name: 'Foo' });
      element.submit();
      await waitUntil(() => element.in('fail'));

      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is disabled when element is disabled', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data} disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is disabled when disabledcontrols includes codes', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${data} disabledcontrols="codes"></foxy-gift-card-form>
      `);

      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('is visible when loaded', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      expect(await getByTestId(element, 'codes')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data} hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes codes', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${data} hiddencontrols="codes"></foxy-gift-card-form>
      `);

      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('renders Generate dialog', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          disabledcontrols="codes:generate:form:foo"
          readonlycontrols="codes:generate:form:bar"
          hiddencontrols="codes:generate:form:baz"
          group="test"
          lang="es"
          ns="foo"
          .data=${data}
        >
        </foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#generate-codes-dialog') as HTMLElement;
      const relatedUrl = `${data._links['fx:gift_card_codes'].href}&limit=5`;

      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('disabledcontrols', 'foo');
      expect(dialog).to.have.attribute('readonlycontrols', 'bar');
      expect(dialog).to.have.attribute('hiddencontrols', 'save-button baz');
      expect(dialog).to.have.attribute('header', 'generate');
      expect(dialog).to.have.attribute('parent', data._links['fx:generate_codes'].href);
      expect(dialog).to.have.attribute('group', 'test');
      expect(dialog).to.have.attribute('lang', 'es');
      expect(dialog).to.have.attribute('ns', 'foo');
      expect(dialog).to.have.attribute('form', 'foxy-generate-codes-form');
      expect(dialog).to.have.deep.property('related', [relatedUrl]);
    });

    it('renders Edit dialog', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          disabledcontrols="codes:form:foo"
          readonlycontrols="codes:form:bar"
          hiddencontrols="codes:form:baz"
          group="test"
          lang="es"
          ns="foo"
          .data=${data}
        >
        </foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#code-dialog') as HTMLElement;
      const parent = `${data._links['fx:gift_card_codes'].href}&limit=5`;

      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('disabledcontrols', 'foo');
      expect(dialog).to.have.attribute('readonlycontrols', 'bar');
      expect(dialog).to.have.attribute('hiddencontrols', 'baz');
      expect(dialog).to.have.attribute('header', 'code');
      expect(dialog).to.have.attribute('parent', parent);
      expect(dialog).to.have.attribute('group', 'test');
      expect(dialog).to.have.attribute('lang', 'es');
      expect(dialog).to.have.attribute('ns', 'foo');
      expect(dialog).to.have.attribute('form', 'foxy-gift-card-code-form');
    });

    it('renders Import dialog', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          disabledcontrols="codes:import:form:foo"
          readonlycontrols="codes:import:form:bar"
          hiddencontrols="codes:import:form:baz"
          group="test"
          lang="es"
          ns="foo"
          .data=${data}
        >
        </foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#import-dialog') as HTMLElement;

      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('disabledcontrols', 'foo');
      expect(dialog).to.have.attribute('readonlycontrols', 'bar');
      expect(dialog).to.have.attribute('hiddencontrols', 'save-button baz');
      expect(dialog).to.have.attribute('header', 'import');
      expect(dialog).to.have.attribute('parent', data._links['fx:gift_card_codes'].href);
      expect(dialog).to.have.attribute('group', 'test');
      expect(dialog).to.have.attribute('lang', 'es');
      expect(dialog).to.have.attribute('ns', 'foo');
      expect(dialog).to.have.attribute('form', 'foxy-gift-card-codes-form');
    });

    it('renders translatable group label "code_plural"', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const label = await getByKey(control, 'code_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders Generate button', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:generate-button')) as HTMLElement;
      const label = button.querySelector('foxy-i18n[key="generate"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('opens Generate dialog when Generate button is clicked', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#generate-codes-dialog') as FormDialog;
      const showMethod = stub(dialog, 'show');
      const button = (await getByTestId(control, 'codes:generate-button')) as HTMLElement;

      button.click();
      expect(showMethod).to.have.been.calledOnceWith(button);
      showMethod.restore();
    });

    it('renders Import button', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:import-button')) as HTMLElement;
      const label = button.querySelector('foxy-i18n[key="import"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('opens Import dialog when Import button is clicked', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#import-dialog') as FormDialog;
      const showMethod = stub(dialog, 'show');
      const button = (await getByTestId(control, 'codes:import-button')) as HTMLElement;

      button.click();
      expect(showMethod).to.have.been.calledOnceWith(button);
      showMethod.restore();
    });

    it('renders Filter button', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:filter-button')) as HTMLElement;
      const label = button.querySelector('foxy-i18n[key="filter"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('toggles query builder when Filter button is clicked', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:filter-button')) as HTMLElement;

      button.click();
      await element.updateComplete;

      expect(button.querySelector('foxy-i18n')).to.have.attribute('key', 'clear_filters');
      expect(control.querySelector('foxy-query-builder')).not.to.have.attribute('hidden');

      button.click();
      await element.updateComplete;

      expect(button.querySelector('foxy-i18n')).to.have.attribute('key', 'filter');
      expect(control.querySelector('foxy-query-builder')).to.have.attribute('hidden');
    });

    it('renders query builder for codes table', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const builder = control.querySelector('foxy-query-builder') as QueryBuilder;

      expect(builder).to.have.attribute('lang', 'es');
      expect(builder).to.have.attribute('ns', 'foo query-builder');

      builder.value = 'foo=bar&baz:in=1,2';
      builder.dispatchEvent(new CustomEvent('change'));
      await element.updateComplete;

      const pagination = control.querySelector('foxy-pagination') as Pagination;
      const paginationParams = new URL(pagination.first).searchParams;

      expect(paginationParams.get('foo')).to.equal('bar');
      expect(paginationParams.get('baz:in')).to.equal('1,2');
    });

    it('renders pagination for codes table', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const pagination = control.querySelector('foxy-pagination') as Pagination;
      const paginationURL = new URL(data._links['fx:gift_card_codes'].href);

      paginationURL.searchParams.set('limit', '5');

      expect(pagination).to.have.attribute('first', paginationURL.toString());
      expect(pagination).to.have.attribute('lang', 'es');
      expect(pagination).to.have.attribute('ns', 'foo pagination');
    });

    it('renders codes table inside of foxy-pagination', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form group="test" lang="es" ns="foo" .data=${data}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      expect(table).to.have.attribute('group', 'test');
      expect(table).to.have.attribute('lang', 'es');
      expect(table).to.have.attribute('ns', 'foo');
    });

    it('renders Code column in the codes table', async () => {
      type Codes = Resource<Rels.GiftCardCodes>;

      const card = await getTestData<Data>('./hapi/gift_cards/0');
      const codes = await getTestData<Codes>('./hapi/gift_card_codes?gift_card_id=0');
      const code = codes._embedded['fx:gift_card_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang=${lang} ns=${ns} .data=${card}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      const column = table.columns[0];
      const headerTemplate = column.header?.({ html, data: codes, lang, ns }) as TemplateResult;
      const cellTemplate = column.cell?.({ html, data: code, lang, ns }) as TemplateResult;

      const header = await fixture(headerTemplate);
      const cell = await fixture(cellTemplate);

      expect(header).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('key', 'code');
      expect(header).to.have.attribute('ns', 'foo');

      expect(cell).to.include.text(code.code);
    });

    it('opens Code dialog when a gift card code in the Code column is clicked', async () => {
      type Codes = Resource<Rels.GiftCardCodes>;

      const card = await getTestData<Data>('./hapi/gift_cards/0');
      const codes = await getTestData<Codes>('./hapi/gift_card_codes?gift_card_id=0');
      const code = codes._embedded['fx:gift_card_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang=${lang} ns=${ns} .data=${card}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;
      const dialog = control.querySelector('#code-dialog') as FormDialog;
      const showMethod = stub(dialog, 'show');

      const column = table.columns[0];
      const cellTemplate = column.cell?.({ html, data: code, lang, ns }) as TemplateResult;
      const cell = await fixture(cellTemplate);
      const button = cell.querySelector('vaadin-button')!;

      button.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.calledWith(button);
      expect(dialog).to.have.property('href', code._links.self.href);

      showMethod.restore();
    });

    it('renders Created On column in the codes table', async () => {
      type Codes = Resource<Rels.GiftCardCodes>;

      const card = await getTestData<Data>('./hapi/gift_cards/0');
      const codes = await getTestData<Codes>('./hapi/gift_card_codes?gift_card_id=0');
      const code = codes._embedded['fx:gift_card_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang=${lang} ns=${ns} .data=${card}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      const column = table.columns[1];
      const headerTemplate = column.header?.({ html, data: codes, lang, ns }) as TemplateResult;
      const cellTemplate = column.cell?.({ html, data: code, lang, ns }) as TemplateResult;

      const header = await fixture(headerTemplate);
      const cell = await fixture(cellTemplate);

      expect(header).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('key', 'date_created');
      expect(header).to.have.attribute('ns', 'foo');

      expect(cell).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(cell).to.have.attribute('options', JSON.stringify({ value: code.date_created }));
      expect(cell).to.have.attribute('lang', 'es');
      expect(cell).to.have.attribute('key', 'date');
      expect(cell).to.have.attribute('ns', 'foo');
    });

    it('renders End Date column in the codes table', async () => {
      type Codes = Resource<Rels.GiftCardCodes>;

      const card = await getTestData<Data>('./hapi/gift_cards/0');
      const codes = await getTestData<Codes>('./hapi/gift_card_codes?gift_card_id=0');
      const code = codes._embedded['fx:gift_card_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form lang=${lang} ns=${ns} .data=${card}></foxy-gift-card-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      const column = table.columns[2];
      const headerTemplate = column.header?.({ html, data: codes, lang, ns }) as TemplateResult;
      const cellTemplate = column.cell?.({ html, data: code, lang, ns }) as TemplateResult;

      const header = await fixture(headerTemplate);
      const cell = await fixture(cellTemplate);

      expect(header).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('key', 'end_date');
      expect(header).to.have.attribute('ns', 'foo');

      expect(cell).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(cell).to.have.attribute('options', JSON.stringify({ value: code.end_date }));
      expect(cell).to.have.attribute('lang', 'es');
      expect(cell).to.have.attribute('key', 'date');
      expect(cell).to.have.attribute('ns', 'foo');
    });

    it('renders Current Balance column in the codes table', async () => {
      type Codes = Resource<Rels.GiftCardCodes>;
      type Store = Resource<Rels.Store>;

      const codes = await getTestData<Codes>('./hapi/gift_card_codes?gift_card_id=0');
      const code = codes._embedded['fx:gift_card_codes'][0];
      const lang = 'es';
      const ns = 'foo';
      const router = createRouter();

      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          lang=${lang}
          ns=${ns}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const store = await getTestData<Store>(element.data!._links['fx:store'].href);
      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      const column = table.columns[3];
      const headerTemplate = column.header?.({ html, data: codes, lang, ns }) as TemplateResult;
      const cellTemplate = column.cell?.({ html, data: code, lang, ns }) as TemplateResult;

      const header = await fixture(headerTemplate);
      const cell = await fixture(cellTemplate);

      expect(header).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('key', 'current_balance');
      expect(header).to.have.attribute('ns', 'foo');

      const cellOptions = JSON.stringify({
        amount: `${code.current_balance} ${element.data?.currency_code}`,
        currencyDisplay: store.use_international_currency_symbol ? 'code' : 'symbol',
      });

      expect(cell).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(cell).to.have.attribute('options', cellOptions);
      expect(cell).to.have.attribute('lang', 'es');
      expect(cell).to.have.attribute('key', 'price');
      expect(cell).to.have.attribute('ns', 'foo');
    });
  });

  describe('product-restrictions', () => {
    it('has i18n label "product_restrictions"', async () => {
      const layout = html`<foxy-gift-card-form lang="es" ns="foo"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'product_restrictions');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n explainer "gift_card_product_restrictions_explainer"', async () => {
      const layout = html`<foxy-gift-card-form lang="es" ns="foo"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'gift_card_product_restrictions_explainer');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n group label "allow"', async () => {
      const layout = html`<foxy-gift-card-form lang="es" ns="foo"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'allow');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n group label "block"', async () => {
      const layout = html`<foxy-gift-card-form lang="es" ns="foo"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'block');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('renders "product-restrictions:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName(element, 'product-restrictions:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "product-restrictions:before" slot with template "product-restrictions:before" if available', async () => {
      const name = 'product-restrictions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "product-restrictions:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName(element, 'product-restrictions:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "product-restrictions:after" slot with template "product-restrictions:after" if available', async () => {
      const name = 'product-restrictions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'product-restrictions')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-form hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'product-restrictions')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes product-restrictions', async () => {
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form hiddencontrols="product-restrictions"></foxy-gift-card-form>
      `);

      expect(await getByTestId(element, 'product-restrictions')).to.not.exist;
    });

    it('renders translatable allow and block lists', async () => {
      const layout = html`<foxy-gift-card-form lang="es" ns="foo"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.be.instanceOf(EditableList);
      expect(allow).to.have.attribute('lang', 'es');
      expect(allow).to.have.attribute('ns', 'foo');

      expect(block).to.be.instanceOf(EditableList);
      expect(block).to.have.attribute('lang', 'es');
      expect(block).to.have.attribute('ns', 'foo');
    });

    it('reflects the value of form.product_code_restrictions to allow and block lists', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.edit({ product_code_restrictions: 'foo,-bar-*,b*z,-qux' });

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.deep.property('items', [
        { label: 'foo', value: 'foo' },
        { label: 'b*z', value: 'b*z' },
      ]);

      expect(block).to.have.deep.property('items', [
        { label: 'bar-*', value: '-bar-*' },
        { label: 'qux', value: '-qux' },
      ]);
    });

    it('writes to form.product_code_restrictions on change', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      allow.items = [{ value: 'foo' }, { value: 'b*z' }];
      allow.dispatchEvent(new CustomEvent('change'));

      await element.updateComplete;

      block.items = [{ value: 'bar-*' }, { value: 'qux' }];
      block.dispatchEvent(new CustomEvent('change'));

      await element.updateComplete;

      expect(element).to.have.nested.property(
        'form.product_code_restrictions',
        'foo,b*z,-bar-*,-qux'
      );
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.not.have.attribute('disabled');
      expect(block).to.not.have.attribute('disabled');
    });

    it('is disabled when form is busy', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.href = 'https://demo.api/virtual/stall';

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('disabled');
      expect(block).to.have.attribute('disabled');
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.setAttribute('disabled', 'disabled');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('disabled');
      expect(block).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes product-restrictions', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.setAttribute('disabledcontrols', 'product-restrictions');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('disabled');
      expect(block).to.have.attribute('disabled');
    });

    it('is writable by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.not.have.attribute('readonly');
      expect(block).to.not.have.attribute('readonly');
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.setAttribute('readonly', 'readonly');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('readonly');
      expect(block).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes product-restrictions', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.setAttribute('readonlycontrols', 'product-restrictions');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('readonly');
      expect(block).to.have.attribute('readonly');
    });
  });

  describe('category-restrictions', () => {
    it('has i18n label "category_restrictions"', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'category_restrictions');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n helper text "gift_card_category_restrictions_helper_text"', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'gift_card_category_restrictions_helper_text');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('renders "category-restrictions:before" slot by default', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName(element, 'category-restrictions:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "category-restrictions:before" slot with template "category-restrictions:before" if available', async () => {
      const router = createRouter();
      const name = 'category-restrictions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "category-restrictions:after" slot by default', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName(element, 'category-restrictions:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "category-restrictions:after" slot with template "category-restrictions:after" if available', async () => {
      const router = createRouter();
      const name = 'category-restrictions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible when loaded', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      expect(await getByTestId(element, 'category-restrictions')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          hidden
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      expect(await getByTestId(element, 'category-restrictions')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes category-restrictions', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          hiddencontrols="category-restrictions"
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      expect(await getByTestId(element, 'category-restrictions')).to.not.exist;
    });

    it('is enabled by default', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;

      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when form is busy', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const router = createRouter();
      const handleAsUsual = (evt: FetchEvent) => router.handleEvent(evt);
      const stall = (evt: FetchEvent) => evt.respondWith(new Promise(() => void 0));

      element.addEventListener('fetch', handleAsUsual as (evt: Event) => unknown);
      element.href = 'https://demo.api/hapi/gift_cards/0';

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      element.removeEventListener('fetch', handleAsUsual as (evt: Event) => unknown);
      element.addEventListener('fetch', stall as (evt: Event) => unknown);
      element.edit({ name: 'Foo' });
      element.submit();

      await waitUntil(() => element.in({ busy: 'updating' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.have.attribute('disabled');
      });
    });

    it('is disabled when the form is disabled', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          disabled
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;

      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.have.attribute('disabled');
      });
    });

    it('is disabled when disabledcontrols includes category-restrictions', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          disabledcontrols="category-restrictions"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;

      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.have.attribute('disabled');
      });
    });

    it('is editable by default', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const page = control.querySelector('[data-testid="category-restrictions:page"]');

      expect(page).to.not.have.attribute('readonly');
    });

    it('is readonly when form is readonly', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          readonly
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const page = control.querySelector('[data-testid="category-restrictions:page"]');

      expect(page).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes category-restrictions', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          readonlycontrols="category-restrictions"
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const page = control.querySelector('[data-testid="category-restrictions:page"]');

      expect(page).to.have.attribute('readonly');
    });

    it('renders translatable pagination for category restrictions', async () => {
      type Store = Resource<Rels.Store>;

      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const store = await getTestData<Store>(element.data!._links['fx:store'].href);
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const pagination = control.querySelector('foxy-pagination') as Pagination;
      const paginationURL = new URL(store._links['fx:item_categories'].href);

      paginationURL.searchParams.set('limit', '5');

      expect(pagination).to.have.attribute('first', paginationURL.toString());
      expect(pagination).to.have.attribute('lang', 'es');
      expect(pagination).to.have.attribute('ns', 'foo pagination');
    });

    it('renders private CategoryRestrictionsPage element inside pagination', async () => {
      const router = createRouter();
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          group="test"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const pagination = control.querySelector('foxy-pagination') as Pagination;
      const page = pagination.querySelector('[data-testid="category-restrictions:page"]');
      const giftCardItemCategories = element.data!._links['fx:gift_card_item_categories'].href;

      expect(page).to.be.instanceOf(CategoryRestrictionsPage);
      expect(page).to.have.attribute('gift-card-item-categories', giftCardItemCategories);
      expect(page).to.have.attribute('gift-card', 'https://demo.api/hapi/gift_cards/0');
      expect(page).to.have.attribute('group', 'test');
      expect(page).to.have.attribute('lang', 'es');
      expect(page).to.have.attribute('ns', 'foo');
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-gift-card-form lang="es"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'gift-card-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-gift-card-form disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-gift-card-form disabledcontrols="create"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<GiftCardForm>(
        html`<foxy-gift-card-form></foxy-gift-card-form>`
      );
      const submit = stub(element, 'submit');
      element.edit({ name: 'Foo' });

      const control = await getByTestId<ButtonElement>(element, 'create');
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-gift-card-form hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-gift-card-form hiddencontrols="create"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-form></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<GiftCardForm>(
        html`<foxy-gift-card-form></foxy-gift-card-form>`
      );
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = './hapi/gift_cards/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-form .data=${data} disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data} lang="es"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'gift-card-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data} disabled></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          .data=${await getTestData<Data>('./hapi/gift_cards/0')}
          disabledcontrols="delete"
        >
        </foxy-gift-card-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data} hidden></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form
          .data=${await getTestData<Data>('./hapi/gift_cards/0')}
          hiddencontrols="delete"
        >
        </foxy-gift-card-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = './hapi/gift_cards/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = './hapi/gift_cards/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardForm>(html`
        <foxy-gift-card-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = './hapi/sleep';
      const layout = html`<foxy-gift-card-form href=${href} lang="es"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = './hapi/not-found';
      const layout = html`<foxy-gift-card-form href=${href} lang="es"></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-form .data=${data}></foxy-gift-card-form>`;
      const element = await fixture<GiftCardForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
