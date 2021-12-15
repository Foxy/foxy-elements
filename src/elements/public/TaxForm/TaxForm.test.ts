import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Checkbox } from '../../private/Checkbox/Checkbox';
import { CheckboxChangeEvent } from '../../private/Checkbox/CheckboxChangeEvent';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { Data } from './types';
import { DropdownChangeEvent } from '../../private/Dropdown/DropdownChangeEvent';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TaxForm } from './TaxForm';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('TaxForm', () => {
  it('extends NucleonElement', () => {
    expect(new TaxForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-tax-form', () => {
    expect(customElements.get('foxy-tax-form')).to.equal(TaxForm);
  });

  it('has a default i18next namespace of "tax-form"', () => {
    expect(new TaxForm()).to.have.property('ns', 'tax-form');
  });

  it('has an empty fx:countries URI by default', () => {
    expect(new TaxForm()).to.have.property('countries', '');
  });

  it('has an empty fx:regions URI by default', () => {
    expect(new TaxForm()).to.have.property('regions', '');
  });

  describe('name', () => {
    it('has i18n label key "name"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      expect(control).to.have.property('label', 'name');
    });

    it('has value of form.name', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ name: 'Test Tax' });

      const control = await getByTestId<TextFieldElement>(element, 'name');
      expect(control).to.have.property('value', 'Test Tax');
    });

    it('writes to form.name on input', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      control!.value = 'Test Tax';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.name', 'Test Tax');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ name: 'Test Tax' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByName(element, 'name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const name = 'name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const name = 'name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes name', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="name"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form href=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-tax-form href=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes name', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="name"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes name', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="name"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });
  });

  describe('type', () => {
    it('has i18n label key "type"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'type');
      expect(control).to.have.property('label', 'type');
    });

    it('has value of form.type', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      const control = await getByTestId<TextFieldElement>(element, 'type');
      expect(control).to.have.property('value', 'union');
    });

    it('writes to form.type on change', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'type');

      control!.value = 'union';
      control!.dispatchEvent(new DropdownChangeEvent('union'));

      expect(element).to.have.nested.property('form.type', 'union');
    });

    it('renders "type:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByName(element, 'type:before')).to.have.property('localName', 'slot');
    });

    it('replaces "type:before" slot with template "type:before" if available', async () => {
      const type = 'type:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "type:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'type:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "type:after" slot with template "type:after" if available', async () => {
      const type = 'type:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes type', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="type"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'global',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'type')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes type', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="type"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes type', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="type"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'type')).to.not.exist;
    });
  });

  describe('country', () => {
    it('has i18n label key "country"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      const control = await getByTestId<TextFieldElement>(element, 'country');
      expect(control).to.have.property('label', 'country');
    });

    it('has value of form.country', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country', country: 'AL' });

      const control = await getByTestId<TextFieldElement>(element, 'country');
      expect(control).to.have.property('value', 'AL');
    });

    it('writes to form.country on input', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      const control = await getByTestId<TextFieldElement>(element, 'country');

      control!.value = 'AL';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.country', 'AL');
    });

    it('loads countries for a country', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const handleFetch = (evt: Event) => {
        if (!(evt instanceof FetchEvent)) return;
        if (evt.request.url !== 'test://countries') return;
        const countries = JSON.stringify({ values: { AB: { cc2: 'AB', default: 'Foo' } } });
        evt.respondWith(Promise.resolve(new Response(countries)));
      };

      element.edit({ type: 'country', country: 'BY' });
      element.addEventListener('fetch', handleFetch);
      element.countries = 'test://countries';

      const control = await getByTestId<ComboBoxElement>(element, 'country');
      await waitUntil(() => control!.items!.length > 0, undefined, { timeout: 5000 });
      element.removeEventListener('fetch', handleFetch);

      expect(control).to.have.deep.property('items', [{ cc2: 'AB', default: 'Foo' }]);
    });

    it('renders "country:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByName(element, 'country:before')).to.have.property('localName', 'slot');
    });

    it('replaces "country:before" slot with template "country:before" if available', async () => {
      const country = 'country:before';
      const value = `<p>Value of the "${country}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${country}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'country' });

      const slot = await getByName<HTMLSlotElement>(element, country);
      const sandbox = (await getByTestId<InternalSandbox>(element, country))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "country:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);

      element.edit({ type: 'country' });

      const slot = await getByName<HTMLSlotElement>(element, 'country:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "country:after" slot with template "country:after" if available', async () => {
      const country = 'country:after';
      const value = `<p>Value of the "${country}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${country}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'country' });

      const slot = await getByName<HTMLSlotElement>(element, country);
      const sandbox = (await getByTestId<InternalSandbox>(element, country))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes country', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="country"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'country',
        country: 'US',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes country', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="country"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'country')).to.not.exist;
    });

    it('is visible when tax type is "country"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.exist;
    });

    it('is visible when tax type is "region"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'country')).to.exist;
    });

    it('is visible when tax type is "local"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'country')).to.exist;
    });

    it('is visible when tax type is "union" and origin rates are used', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local', use_origin_rates: true });

      expect(await getByTestId(element, 'country')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes country', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="country"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'country')).to.not.exist;
    });
  });

  describe('region', () => {
    it('has i18n label key "region"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      const control = await getByTestId<TextFieldElement>(element, 'region');
      expect(control).to.have.property('label', 'region');
    });

    it('has value of form.region', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region', region: 'AL' });

      const control = await getByTestId<TextFieldElement>(element, 'region');
      expect(control).to.have.property('value', 'AL');
    });

    it('writes to form.region on input', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      const control = await getByTestId<TextFieldElement>(element, 'region');

      control!.value = 'AL';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.region', 'AL');
    });

    it('loads regions for a country', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const handleFetch = (evt: Event) => {
        if (!(evt instanceof FetchEvent)) return;
        if (evt.request.url !== 'test://regions?country_code=BY') return;
        const regions = JSON.stringify({ values: { AB: { code: 'AB', default: 'Foo' } } });
        evt.respondWith(Promise.resolve(new Response(regions)));
      };

      element.edit({ type: 'region', country: 'BY' });
      element.addEventListener('fetch', handleFetch);
      element.regions = 'test://regions';

      const control = await getByTestId<ComboBoxElement>(element, 'region');
      await waitUntil(() => control!.items!.length > 0, undefined, { timeout: 5000 });
      element.removeEventListener('fetch', handleFetch);

      expect(control).to.have.deep.property('items', [{ code: 'AB', default: 'Foo' }]);
    });

    it('renders "region:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByName(element, 'region:before')).to.have.property('localName', 'slot');
    });

    it('replaces "region:before" slot with template "region:before" if available', async () => {
      const region = 'region:before';
      const value = `<p>Value of the "${region}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${region}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'region' });

      const slot = await getByName<HTMLSlotElement>(element, region);
      const sandbox = (await getByTestId<InternalSandbox>(element, region))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "region:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);

      element.edit({ type: 'region' });

      const slot = await getByName<HTMLSlotElement>(element, 'region:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "region:after" slot with template "region:after" if available', async () => {
      const region = 'region:after';
      const value = `<p>Value of the "${region}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${region}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'region' });

      const slot = await getByName<HTMLSlotElement>(element, region);
      const sandbox = (await getByTestId<InternalSandbox>(element, region))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes region', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="region"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'region',
        country: 'US',
        region: 'AL',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes region', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="region"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'region')).to.not.exist;
    });

    it('is visible when tax type is "region"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.exist;
    });

    it('is visible when tax type is "local"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'region')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes region', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="region"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'region')).to.not.exist;
    });
  });

  describe('city', () => {
    it('has i18n label key "city"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      const control = await getByTestId<TextFieldElement>(element, 'city');
      expect(control).to.have.property('label', 'city');
    });

    it('has value of form.city', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local', city: 'Nullville' });

      const control = await getByTestId<TextFieldElement>(element, 'city');
      expect(control).to.have.property('value', 'Nullville');
    });

    it('writes to form.city on input', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      const control = await getByTestId<TextFieldElement>(element, 'city');

      control!.value = 'Nullville';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.city', 'Nullville');
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const submit = stub(element, 'submit');

      element.edit({
        name: 'Test Tax',
        type: 'local',
        country: 'US',
        region: 'AL',
        city: 'Nullville',
        rate: 10,
      });

      const control = await getByTestId<TextFieldElement>(element, 'city');
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "city:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByName(element, 'city:before')).to.have.property('localName', 'slot');
    });

    it('replaces "city:before" slot with template "city:before" if available', async () => {
      const city = 'city:before';
      const value = `<p>Value of the "${city}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${city}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'local' });

      const slot = await getByName<HTMLSlotElement>(element, city);
      const sandbox = (await getByTestId<InternalSandbox>(element, city))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "city:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);

      element.edit({ type: 'local' });

      const slot = await getByName<HTMLSlotElement>(element, 'city:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "city:after" slot with template "city:after" if available', async () => {
      const city = 'city:after';
      const value = `<p>Value of the "${city}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${city}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'local' });

      const slot = await getByName<HTMLSlotElement>(element, city);
      const sandbox = (await getByTestId<InternalSandbox>(element, city))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes city', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="city"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'local',
        country: 'US',
        region: 'AL',
        city: 'Nullville',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes city', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="city"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'city')).to.not.exist;
    });

    it('is visible when tax type is "local"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes city', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="city"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'local' });

      expect(await getByTestId(element, 'city')).to.not.exist;
    });
  });

  describe('provider', () => {
    it('has i18n label key "tax_rate_provider"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      const control = await getByTestId<TextFieldElement>(element, 'provider');
      expect(control).to.have.property('label', 'tax_rate_provider');
    });

    it('has value of form.service_provider', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ service_provider: 'avalara', type: 'union' });

      const control = await getByTestId<TextFieldElement>(element, 'provider');
      expect(control).to.have.property('value', 'avalara');
    });

    it('writes to form.service_provider on change', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });
      const control = await getByTestId<TextFieldElement>(element, 'provider');

      control!.value = 'avalara';
      control!.dispatchEvent(new DropdownChangeEvent('avalara'));

      expect(element).to.have.nested.property('form.service_provider', 'avalara');
    });

    it('renders "provider:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByName(element, 'provider:before')).to.have.property('localName', 'slot');
    });

    it('replaces "provider:before" slot with template "provider:before" if available', async () => {
      const provider = 'provider:before';
      const value = `<p>Value of the "${provider}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${provider}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'union' });

      const slot = await getByName<HTMLSlotElement>(element, provider);
      const sandbox = (await getByTestId<InternalSandbox>(element, provider))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "provider:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      element.edit({ type: 'union' });

      const slot = await getByName<HTMLSlotElement>(element, 'provider:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "provider:after" slot with template "provider:after" if available', async () => {
      const provider = 'provider:after';
      const value = `<p>Value of the "${provider}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${provider}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'union' });

      const slot = await getByName<HTMLSlotElement>(element, provider);
      const sandbox = (await getByTestId<InternalSandbox>(element, provider))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes provider', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="provider"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'union',
        service_provider: 'avalara',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'provider')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes provider', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="provider"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.have.attribute('disabled');
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'provider')).to.not.exist;
    });

    it('is visible when tax type is "union"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.exist;
    });

    it('is visible when tax type is "country"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'country' });

      expect(await getByTestId(element, 'provider')).to.exist;
    });

    it('is visible when tax type is "region"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'region' });

      expect(await getByTestId(element, 'provider')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes provider', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="provider"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union' });

      expect(await getByTestId(element, 'provider')).to.not.exist;
    });
  });

  describe('rate', () => {
    it('has i18n label key "tax_rate"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'rate');
      expect(control).to.have.property('label', 'tax_rate');
    });

    it('has value of form.rate', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ rate: 10 });

      const control = await getByTestId<TextFieldElement>(element, 'rate');
      expect(control).to.have.property('value', '10');
    });

    it('writes to form.rate on change', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'rate');

      control!.value = '10';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.rate', 10);
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const submit = stub(element, 'submit');

      element.edit({
        name: 'Test Tax',
        type: 'global',
        rate: 10,
      });

      const control = await getByTestId<TextFieldElement>(element, 'rate');
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "rate:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByName(element, 'rate:before')).to.have.property('localName', 'slot');
    });

    it('replaces "rate:before" slot with template "rate:before" if available', async () => {
      const rate = 'rate:before';
      const value = `<p>Value of the "${rate}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${rate}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, rate);
      const sandbox = (await getByTestId<InternalSandbox>(element, rate))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "rate:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'rate:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "rate:after" slot with template "rate:after" if available', async () => {
      const rate = 'rate:after';
      const value = `<p>Value of the "${rate}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${rate}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, rate);
      const sandbox = (await getByTestId<InternalSandbox>(element, rate))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-tax-form readonly></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes rate', async () => {
      const layout = html`<foxy-tax-form readonlycontrols="rate"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'global',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'rate')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes rate', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="rate"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.exist;
    });

    it('is hidden when live tax rates are used', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ is_live: true });

      expect(await getByTestId(element, 'rate')).to.not.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes rate', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="rate"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'rate')).to.not.exist;
    });
  });

  describe('apply-to-shipping', () => {
    it('has i18n label with key "tax_apply_to_shipping"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });
      expect(await getByKey(element, 'tax_apply_to_shipping')).to.exist;
    });

    it('has i18n explainer with key "tax_apply_to_shipping_explainer"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });
      expect(await getByKey(element, 'tax_apply_to_shipping_explainer')).to.exist;
    });

    it('has value of form.apply_to_shipping', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global', apply_to_shipping: true });

      const control = await getByTestId<TextFieldElement>(element, 'apply-to-shipping');
      expect(control).to.have.property('checked', true);
    });

    it('writes to form.apply_to_shipping on change', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      const control = await getByTestId<Checkbox>(element, 'apply-to-shipping');
      control!.checked = true;
      control!.dispatchEvent(new CheckboxChangeEvent(true));

      expect(element).to.have.nested.property('form.apply_to_shipping', true);
    });

    it('renders "apply-to-shipping:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      const slot = await getByName(element, 'apply-to-shipping:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "apply-to-shipping:before" slot with template "apply-to-shipping:before" if available', async () => {
      const name = 'apply-to-shipping:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'global' });

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "apply-to-shipping:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      element.edit({ type: 'global' });

      const slot = await getByName<HTMLSlotElement>(element, 'apply-to-shipping:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "apply-to-shipping:after" slot with template "apply-to-shipping:after" if available', async () => {
      const name = 'apply-to-shipping:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'global' });

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      const control = await getByTestId(element, 'apply-to-shipping');
      expect(control).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        name: 'Test Tax',
        type: 'global',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'apply-to-shipping')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      expect(await getByTestId(element, 'apply-to-shipping')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes apply-to-shipping', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="apply-to-shipping"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      expect(await getByTestId(element, 'apply-to-shipping')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'apply-to-shipping')).to.exist;
    });

    // prettier-ignore
    ['US', 'CA', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IM', 'IT', 'LT', 'LU', 'LV', 'MC', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'].forEach(country => {
      it(`is hidden in ${country} when live tax rates are enabled`, async () => {
        const layout = html`<foxy-tax-form></foxy-tax-form>`;
        const element = await fixture<TaxForm>(layout);
    
        element.edit({ type: 'country', is_live: true, country })
    
        expect(await getByTestId(element, 'apply-to-shipping')).to.not.exist;
      });
    })

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      expect(await getByTestId(element, 'apply-to-shipping')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes apply-to-shipping', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="apply-to-shipping"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'global' });

      expect(await getByTestId(element, 'apply-to-shipping')).to.not.exist;
    });
  });

  describe('use-origin-rates', () => {
    it('has i18n label with key "tax_use_origin_rates"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });
      expect(await getByKey(element, 'tax_use_origin_rates')).to.exist;
    });

    it('has i18n explainer with key "tax_use_origin_rates_explainer"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });
      expect(await getByKey(element, 'tax_use_origin_rates_explainer')).to.exist;
    });

    it('has value of form.use_origin_rates', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '', use_origin_rates: true });

      const control = await getByTestId<Checkbox>(element, 'use-origin-rates');
      expect(control).to.have.property('checked', true);
    });

    it('writes to form.use_origin_rates on change', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      const control = await getByTestId<Checkbox>(element, 'use-origin-rates');
      control!.checked = true;
      control!.dispatchEvent(new CheckboxChangeEvent(true));

      expect(element).to.have.nested.property('form.use_origin_rates', true);
    });

    it('renders "use-origin-rates:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      const slot = await getByName(element, 'use-origin-rates:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "use-origin-rates:before" slot with template "use-origin-rates:before" if available', async () => {
      const name = 'use-origin-rates:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "use-origin-rates:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      element.edit({ type: 'union', is_live: true, service_provider: '' });

      const slot = await getByName<HTMLSlotElement>(element, 'use-origin-rates:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "use-origin-rates:after" slot with template "use-origin-rates:after" if available', async () => {
      const name = 'use-origin-rates:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      const control = await getByTestId(element, 'use-origin-rates');
      expect(control).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        is_live: true,
        service_provider: '',
        name: 'Test Tax',
        type: 'union',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'use-origin-rates')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      expect(await getByTestId(element, 'use-origin-rates')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes use-origin-rates', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="use-origin-rates"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      expect(await getByTestId(element, 'use-origin-rates')).to.have.attribute('disabled');
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'use-origin-rates')).to.not.exist;
    });

    it('is visible when tax type is "union"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });
      expect(await getByTestId(element, 'use-origin-rates')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      expect(await getByTestId(element, 'use-origin-rates')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes use-origin-rates', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="use-origin-rates"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ type: 'union', is_live: true, service_provider: '' });

      expect(await getByTestId(element, 'use-origin-rates')).to.not.exist;
    });
  });

  describe('exempt-all-customer-tax-ids', () => {
    it('has i18n label with key "tax_exempt_all_customer_tax_ids"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ service_provider: '' });
      expect(await getByKey(element, 'tax_exempt_all_customer_tax_ids')).to.exist;
    });

    it('has i18n explainer with key "tax_exempt_all_customer_tax_ids_explainer"', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ service_provider: '' });
      expect(await getByKey(element, 'tax_exempt_all_customer_tax_ids_explainer')).to.exist;
    });

    it('has value of form.exempt_all_customer_tax_ids', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ service_provider: '', exempt_all_customer_tax_ids: true });

      const control = await getByTestId<Checkbox>(element, 'exempt-all-customer-tax-ids');
      expect(control).to.have.property('checked', true);
    });

    it('writes to form.exempt_all_customer_tax_ids on change', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ service_provider: '' });

      const control = await getByTestId<Checkbox>(element, 'exempt-all-customer-tax-ids');
      control!.checked = true;
      control!.dispatchEvent(new CheckboxChangeEvent(true));

      expect(element).to.have.nested.property('form.exempt_all_customer_tax_ids', true);
    });

    it('renders "exempt-all-customer-tax-ids:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      element.edit({ service_provider: '' });

      const slot = await getByName(element, 'exempt-all-customer-tax-ids:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "exempt-all-customer-tax-ids:before" slot with template "exempt-all-customer-tax-ids:before" if available', async () => {
      const name = 'exempt-all-customer-tax-ids:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ service_provider: '' });

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "exempt-all-customer-tax-ids:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      element.edit({ service_provider: '' });

      const slot = await getByName<HTMLSlotElement>(element, 'exempt-all-customer-tax-ids:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "exempt-all-customer-tax-ids:after" slot with template "exempt-all-customer-tax-ids:after" if available', async () => {
      const name = 'exempt-all-customer-tax-ids:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      element.edit({ service_provider: '' });

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      element.edit({ service_provider: '' });

      const control = await getByTestId(element, 'exempt-all-customer-tax-ids');
      expect(control).not.to.have.attribute('disabled');
    });

    it('is disabled when form is in busy state', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-tax-form parent=${href}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({
        service_provider: '',
        name: 'Test Tax',
        type: 'global',
        rate: 10,
      });

      element.submit();

      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.have.attribute(
        'disabled'
      );
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      element.edit({ service_provider: '' });

      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.have.attribute(
        'disabled'
      );
    });

    it('is disabled when disabledcontrols includes exempt-all-customer-tax-ids', async () => {
      const layout = html`
        <foxy-tax-form disabledcontrols="exempt-all-customer-tax-ids"> </foxy-tax-form>
      `;

      const element = await fixture<TaxForm>(layout);
      element.edit({ service_provider: '' });

      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.have.attribute(
        'disabled'
      );
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.not.exist;
    });

    it('is visible when using the default tax service', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ service_provider: '' });
      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes exempt-all-customer-tax-ids', async () => {
      const layout = html`
        <foxy-tax-form hiddencontrols="exempt-all-customer-tax-ids"> </foxy-tax-form>
      `;

      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'exempt-all-customer-tax-ids')).to.not.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-tax-form lang="es"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'tax-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-tax-form disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-tax-form disabledcontrols="create"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      const submit = stub(element, 'submit');
      element.edit({ name: 'Foo', type: 'global', rate: 10 });

      const control = await getByTestId<ButtonElement>(element, 'create');
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-tax-form hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-tax-form hiddencontrols="create"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-tax-form></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<TaxForm>(html`<foxy-tax-form></foxy-tax-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = './s/admin/stores/0/taxes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-tax-form .data=${data} disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data} lang="es"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'tax-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data} disabled></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form
          .data=${await getTestData<Data>('./s/admin/stores/0/taxes/0')}
          disabledcontrols="delete"
        >
        </foxy-tax-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data} hidden></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form
          .data=${await getTestData<Data>('./s/admin/stores/0/taxes/0')}
          hiddencontrols="delete"
        >
        </foxy-tax-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = './s/admin/stores/0/taxes/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = './s/admin/stores/0/taxes/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TaxForm>(html`
        <foxy-tax-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-tax-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = './s/admin/sleep';
      const layout = html`<foxy-tax-form href=${href} lang="es"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'tax-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = './s/admin/not-found';
      const layout = html`<foxy-tax-form href=${href} lang="es"></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'tax-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./s/admin/stores/0/taxes/0');
      const layout = html`<foxy-tax-form .data=${data}></foxy-tax-form>`;
      const element = await fixture<TaxForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
