import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CategoryRestrictionsPage } from './private/CategoryRestrictionsPage';
import { CheckboxChangeEvent } from '../../private/events';
import { CouponForm } from './index';
import { Data } from './types';
import { EditableList } from '../../private/EditableList/EditableList';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
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
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('CouponForm', () => {
  it('extends NucleonElement', () => {
    expect(new CouponForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-coupon-form', () => {
    expect(customElements.get('foxy-coupon-form')).to.equal(CouponForm);
  });

  it('has a default i18n namespace "coupon-form"', () => {
    expect(new CouponForm()).to.have.property('ns', 'coupon-form');
  });

  describe('name', () => {
    it('is an instance of Vaadin.TextFieldElement', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      expect(control).to.be.instanceOf(TextFieldElement);
    });

    it('has i18n label key "name"', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      expect(control).to.have.property('label', 'name');
    });

    it('has value of form.name', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ name: 'Test Gift Card' });

      const control = await getByTestId<TextFieldElement>(element, 'name');
      expect(control).to.have.property('value', 'Test Gift Card');
    });

    it('writes to form.name on input', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      control!.value = 'Test Gift Card';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.name', 'Test Gift Card');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ name: 'Test Gift Card' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByName(element, 'name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const name = 'name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const name = 'name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-coupon-form readonly></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes name', async () => {
      const layout = html`<foxy-coupon-form readonlycontrols="name"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-coupon-form href=${href}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-coupon-form href=${href}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-coupon-form disabled></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes name', async () => {
      const layout = html`<foxy-coupon-form disabledcontrols="name"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-coupon-form hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes name', async () => {
      const layout = html`<foxy-coupon-form hiddencontrols="name"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });
  });

  describe('rules', () => {
    it('renders i18n label rule_plural', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const label = await getByKey(control, 'rule_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders with "rules:before" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'rules:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "rules:before" slot with template "rules:before" if available and rendered', async () => {
      const name = 'rules:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "rules:after" slot by default', async () => {
      const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'rules:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "rules:after" slot with template "rules:after" if available and rendered', async () => {
      const name = 'rules:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'rules')).to.exist;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-coupon-form hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'rules')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "rules"', async () => {
      const layout = html`<foxy-coupon-form hiddencontrols="rules"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'rules')).to.not.exist;
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render some rules
      element.edit({
        coupon_discount_details: 'allunits|1-2|3-4|5-6',
        coupon_discount_type: 'price_amount',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const interactiveControls = await getByTestClass(control, 'interactive');

      interactiveControls.forEach(input => {
        expect(input).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render some rules
      element.edit({
        coupon_discount_details: 'allunits|1-2|3-4|5-6',
        coupon_discount_type: 'price_amount',
      });

      element.disabled = true;

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const interactiveControls = await getByTestClass(control, 'interactive');

      interactiveControls.forEach(input => {
        expect(input).to.have.attribute('disabled');
      });
    });

    it('is disabled when the form is loading data', async () => {
      const router = createRouter();
      const handle = (evt: FetchEvent) => router.handleEvent(evt);
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-coupon-form href=${href} @fetch=${handle}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      await waitUntil(() => element.in({ busy: 'fetching' }));

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const interactiveControls = await getByTestClass(control, 'interactive');

      interactiveControls.forEach(input => {
        expect(input).to.have.attribute('disabled');
      });
    });

    it('is disabled when disabledcontrols includes rules', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render some rules
      element.edit({
        coupon_discount_details: 'allunits|1-2|3-4|5-6',
        coupon_discount_type: 'price_amount',
      });

      element.setAttribute('disabledcontrols', 'rules');

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const interactiveControls = await getByTestClass(control, 'interactive');

      interactiveControls.forEach(input => {
        expect(input).to.have.attribute('disabled');
      });
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render some rules
      element.edit({
        coupon_discount_details: 'allunits|1-2|3-4|5-6',
        coupon_discount_type: 'price_amount',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const inputs = await getByTestClass(control, 'editable');

      inputs.forEach(input => expect(input).to.not.have.attribute('readonly'));
    });

    it('is disabled when the form is readonly', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render some rules
      element.edit({
        coupon_discount_details: 'allunits|1-2|3-4|5-6',
        coupon_discount_type: 'price_amount',
      });

      element.readonly = true;

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const inputs = await getByTestClass(control, 'editable');

      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('is disabled when readonlycontrols includes rules', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render some rules
      element.edit({
        coupon_discount_details: 'allunits|1-2|3-4|5-6',
        coupon_discount_type: 'price_amount',
      });

      element.setAttribute('readonlycontrols', 'rules');

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const inputs = await getByTestClass(control, 'editable');

      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('renders preset picker', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const preset = (await getByTestId(control, 'rules:preset')) as HTMLElement;
      const label = await getByKey(preset, 'preset');
      const select = (await getByTestId(preset, 'rules:preset:select')) as HTMLSelectElement;

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      const presets = [
        { type: 'quantity_amount', details: 'allunits|2-2' },
        { type: 'quantity_percentage', details: 'allunits|5-10|10-20' },
        { type: 'quantity_amount', details: 'incremental|3-5' },
        { type: 'quantity_percentage', details: 'incremental|11-10|51-15|101-20' },
        { type: 'quantity_percentage', details: 'repeat|2-100' },
        { type: 'quantity_percentage', details: 'repeat|4-50' },
        { type: 'quantity_amount', details: 'single|5-10' },
        { type: 'price_percentage', details: 'single|99.99-10' },
      ];

      presets.forEach((preset, index) => {
        expect(select).to.have.nested.property(`options[${index}].value`, preset.details);
        expect(select).to.include.text('discount_summary');
      });

      expect(select).to.have.nested.property('options[8].value', 'custom');
      expect(select).to.include.text('custom_discount');
    });

    it('binds preset picker to form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const preset = (await getByTestId(control, 'rules:preset')) as HTMLElement;

      let select = (await getByTestId(preset, 'rules:preset:select')) as HTMLSelectElement;
      expect(select).to.have.nested.property('selectedOptions[0].value', 'custom');

      select.selectedIndex = 0;
      select.dispatchEvent(new CustomEvent('change'));
      await element.updateComplete;

      expect(element).to.have.nested.property(
        'form.coupon_discount_details',
        select.options[0].value
      );

      element.edit({
        coupon_discount_details: 'incremental|11-10|51-15|101-20',
        coupon_discount_type: 'quantity_percentage',
      });

      select = (await getByTestId(preset, 'rules:preset:select')) as HTMLSelectElement;
      expect(select).to.have.nested.property('selectedIndex', 3);
    });

    it('renders discount url parameter with Copy button', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        coupon_discount_details: '1-2|3-4',
        coupon_discount_type: 'price_amount',
        name: 'Test',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const url = (await getByTestId(control, 'rules:url')) as HTMLElement;
      const label = (await getByKey(url, 'url_parameter')) as HTMLElement;
      const button = (await getByTestId(url, 'rules:url:copy')) as HTMLElement;
      const expectedText = 'discount_price_amount=Test%7B1-2%7C3-4%7D';

      expect(button).to.have.property('localName', 'foxy-copy-to-clipboard');
      expect(button).to.have.property('text', expectedText);
      expect(button).to.have.property('lang', 'es');
      expect(button).to.have.property('ns', 'foo copy-to-clipboard');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(url).to.include.text(expectedText);
    });

    it('renders discount description', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        coupon_discount_details: '1-2|3-4',
        coupon_discount_type: 'price_amount',
        name: 'Test',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const wrapper = (await getByTestId(control, 'rules:description')) as HTMLElement;
      const label = (await getByKey(wrapper, 'description')) as HTMLElement;
      const summary = (await getByKey(wrapper, 'discount_summary')) as HTMLElement;

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(summary).to.exist;
      expect(summary).to.have.attribute('lang', 'es');
      expect(summary).to.have.attribute('ns', 'foo');
      expect(summary).to.have.attribute(
        'options',
        JSON.stringify({ params: { details: '1-2|3-4', type: 'price_amount', ns: 'foo' } })
      );
    });

    it('renders tiers from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: '1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      let labels = [...tiers[0].querySelectorAll('label')];
      let from = labels.find(v => !!v.querySelector('[key="from"]'));
      let reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
      let increase = labels.find(v => !!v.querySelector('[key="increase"]'));
      let adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));

      expect(from?.control).to.have.value('1');
      expect(reduce?.control).to.have.attribute('checked');
      expect(increase?.control).to.not.have.attribute('checked');
      expect(adjustment?.control).to.have.value('2');

      labels = [...tiers[1].querySelectorAll('label')];
      from = labels.find(v => !!v.querySelector('[key="from"]'));
      reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
      increase = labels.find(v => !!v.querySelector('[key="increase"]'));
      adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));

      expect(from?.control).to.have.value('3');
      expect(reduce?.control).to.not.have.attribute('checked');
      expect(increase?.control).to.have.attribute('checked');
      expect(adjustment?.control).to.have.value('4');
    });

    it('supports "allunits" discount method from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: 'allunits|1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const target = labels.find(v => !!v.querySelector('[key="target"]'));
        expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'allunits');
      }
    });

    it('supports "incremental" discount method from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: 'incremental|1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const target = labels.find(v => !!v.querySelector('[key="target"]'));
        expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'incremental');
      }
    });

    it('supports "repeat" discount method from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: 'repeat|1-2' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(1);

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const target = labels.find(v => !!v.querySelector('[key="target"]'));
        expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'repeat');
      }
    });

    it('supports "single" discount method from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: 'single|1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const target = labels.find(v => !!v.querySelector('[key="target"]'));
        expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'single');
      }
    });

    it('supports "quantity_percentage" discount type from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        coupon_discount_details: '1-2|3+4',
        coupon_discount_type: 'quantity_percentage',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const price = labels.find(v => !!v.querySelector('[key="total"]'));
        const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

        expect(price?.control).to.not.have.attribute('checked');
        expect(quantity?.control).to.have.attribute('checked');

        const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
        const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

        expect(amount?.control).to.not.have.attribute('checked');
        expect(percentage?.control).to.have.attribute('checked');
      }
    });

    it('supports "quantity_amount" discount type from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        coupon_discount_details: '1-2|3+4',
        coupon_discount_type: 'quantity_amount',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const price = labels.find(v => !!v.querySelector('[key="total"]'));
        const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

        expect(price?.control).to.not.have.attribute('checked');
        expect(quantity?.control).to.have.attribute('checked');

        const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
        const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

        expect(amount?.control).to.have.attribute('checked');
        expect(percentage?.control).to.not.have.attribute('checked');
      }
    });

    it('supports "price_percentage" discount type from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        coupon_discount_details: '1-2|3+4',
        coupon_discount_type: 'price_percentage',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const price = labels.find(v => !!v.querySelector('[key="total"]'));
        const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

        expect(price?.control).to.have.attribute('checked');
        expect(quantity?.control).to.not.have.attribute('checked');

        const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
        const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

        expect(amount?.control).to.not.have.attribute('checked');
        expect(percentage?.control).to.have.attribute('checked');
      }
    });

    it('supports "price_amount" discount type from form.coupon_discount_details', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        coupon_discount_details: '1-2|3+4',
        coupon_discount_type: 'price_amount',
      });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      for (const tier of tiers) {
        const labels = [...tier.querySelectorAll('label')];
        const price = labels.find(v => !!v.querySelector('[key="total"]'));
        const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

        expect(price?.control).to.have.attribute('checked');
        expect(quantity?.control).to.not.have.attribute('checked');

        const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
        const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

        expect(amount?.control).to.have.attribute('checked');
        expect(percentage?.control).to.not.have.attribute('checked');
      }
    });

    it('can edit discount method', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: '1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const anyTier = (await getByTestClass<HTMLElement>(control, 'rules:tier'))[0];
      const labels = [...anyTier.querySelectorAll('label')];
      const target = labels.find(v => !!v.querySelector('[key="target"]')) as HTMLLabelElement;
      const select = target.control as HTMLSelectElement;

      ['incremental', 'allunits', 'repeat', 'single'].forEach((method, index) => {
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change'));
        expect(element.form.coupon_discount_details).to.equal(`${method}|1-2|3+4`);
      });
    });

    it('can edit discount type', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: '1-2|3+4', coupon_discount_type: 'quantity_amount' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tier = (await getByTestClass<HTMLElement>(control, 'rules:tier'))[0];
      const labels = [...tier.querySelectorAll('label')];

      const price = labels.find(v => !!v.querySelector('[key="total"]'));
      const priceControl = price?.control as HTMLInputElement;

      const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));
      const quantityControl = quantity?.control as HTMLInputElement;

      const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
      const amountControl = amount?.control as HTMLInputElement;

      const percentage = labels.find(v => !!v.querySelector('[key="%"]'));
      const percentageControl = percentage?.control as HTMLInputElement;

      priceControl.checked = true;
      priceControl.dispatchEvent(new Event('change'));
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_type', 'price_amount');

      percentageControl.checked = true;
      percentageControl.dispatchEvent(new Event('change'));
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_type', 'price_percentage');

      quantityControl.checked = true;
      quantityControl.dispatchEvent(new Event('change'));
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_type', 'quantity_percentage');

      amountControl.checked = true;
      amountControl.dispatchEvent(new Event('change'));
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_type', 'quantity_amount');
    });

    it('can edit tiers', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: 'single|1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      const labels = [...tiers[1].querySelectorAll('label')];
      const from = labels.find(v => !!v.querySelector('[key="from"]'));
      const fromInput = from?.control as HTMLInputElement;
      const reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
      const reduceInput = reduce?.control as HTMLInputElement;
      const adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));
      const adjustmentInput = adjustment?.control as HTMLInputElement;

      fromInput.value = '7';
      fromInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      reduceInput.checked = true;
      reduceInput.dispatchEvent(new Event('change'));
      await element.updateComplete;

      adjustmentInput.value = '9';
      adjustmentInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_details', 'single|1-2|7-9');
    });

    it('can add tiers', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(1); // 1 placeholder

      const labels = [...tiers[0].querySelectorAll('label')];
      const from = labels.find(v => !!v.querySelector('[key="from"]'));
      const fromInput = from?.control as HTMLInputElement;
      const reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
      const reduceInput = reduce?.control as HTMLInputElement;
      const adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));
      const adjustmentInput = adjustment?.control as HTMLInputElement;

      fromInput.value = '1';
      fromInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      reduceInput.checked = true;
      reduceInput.dispatchEvent(new Event('change'));
      await element.updateComplete;

      adjustmentInput.value = '2';
      adjustmentInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_details', 'single|1-2');
    });

    it('can delete tiers', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ coupon_discount_details: 'single|1-2|3+4' });

      const control = (await getByTestId(element, 'rules')) as HTMLElement;
      const tiers = await getByTestClass<HTMLElement>(control, 'rules:tier');

      expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

      tiers[0].querySelector<HTMLElement>('button[aria-label="delete"]')?.click();
      await element.updateComplete;

      expect(element).to.have.nested.property('form.coupon_discount_details', 'single|3+4');
    });
  });

  describe('codes', () => {
    it('renders "codes:before" slot when visible', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      expect(await getByName(element, 'codes:before')).to.have.property('localName', 'slot');
    });

    it('replaces "codes:before" slot with template "codes:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const name = 'codes:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "codes:after" slot when visible', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'codes:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "codes:after" slot with template "codes:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const name = 'codes:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is enabled by default when visible', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).not.to.have.attribute('disabled');
      });
    });

    it('is disabled when form is sending changes', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
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
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
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
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data} disabled></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is disabled when disabledcontrols includes codes', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${data} disabledcontrols="codes"></foxy-coupon-form>
      `);

      const selectors = ['vaadin-button', 'foxy-query-builder', 'foxy-pagination'];
      const control = (await getByTestId(element, 'codes')) as HTMLElement;

      control.querySelectorAll(selectors.join()).forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('is visible when loaded', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      expect(await getByTestId(element, 'codes')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data} hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes codes', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${data} hiddencontrols="codes"></foxy-coupon-form>
      `);

      expect(await getByTestId(element, 'codes')).to.not.exist;
    });

    it('renders Generate dialog', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          disabledcontrols="codes:generate:form:foo"
          readonlycontrols="codes:generate:form:bar"
          hiddencontrols="codes:generate:form:baz"
          group="test"
          lang="es"
          ns="foo"
          .data=${data}
        >
        </foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#generate-codes-dialog') as HTMLElement;
      const relatedUrl = `${data._links['fx:coupon_codes'].href}&limit=5`;

      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('disabledcontrols', 'foo');
      expect(dialog).to.have.attribute('readonlycontrols', 'bar');
      expect(dialog).to.have.attribute('hiddencontrols', 'save-button current-balance baz');
      expect(dialog).to.have.attribute('header', 'generate');
      expect(dialog).to.have.attribute('parent', data._links['fx:generate_codes'].href);
      expect(dialog).to.have.attribute('group', 'test');
      expect(dialog).to.have.attribute('lang', 'es');
      expect(dialog).to.have.attribute('ns', 'foo');
      expect(dialog).to.have.attribute('form', 'foxy-generate-codes-form');
      expect(dialog).to.have.deep.property('related', [relatedUrl]);
    });

    it('renders Edit dialog', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          disabledcontrols="codes:form:foo"
          readonlycontrols="codes:form:bar"
          hiddencontrols="codes:form:baz"
          group="test"
          lang="es"
          ns="foo"
          .data=${data}
        >
        </foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#code-dialog') as HTMLElement;
      const parent = `${data._links['fx:coupon_codes'].href}&limit=5`;

      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('disabledcontrols', 'foo');
      expect(dialog).to.have.attribute('readonlycontrols', 'bar');
      expect(dialog).to.have.attribute('hiddencontrols', 'baz');
      expect(dialog).to.have.attribute('header', 'code');
      expect(dialog).to.have.attribute('parent', parent);
      expect(dialog).to.have.attribute('group', 'test');
      expect(dialog).to.have.attribute('lang', 'es');
      expect(dialog).to.have.attribute('ns', 'foo');
      expect(dialog).to.have.attribute('form', 'foxy-coupon-code-form');
    });

    it('renders Import dialog', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          disabledcontrols="codes:import:form:foo"
          readonlycontrols="codes:import:form:bar"
          hiddencontrols="codes:import:form:baz"
          group="test"
          lang="es"
          ns="foo"
          .data=${data}
        >
        </foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const dialog = control.querySelector('#import-dialog') as HTMLElement;

      expect(dialog).to.exist;
      expect(dialog).to.have.attribute('disabledcontrols', 'foo');
      expect(dialog).to.have.attribute('readonlycontrols', 'bar');
      expect(dialog).to.have.attribute('hiddencontrols', 'save-button baz');
      expect(dialog).to.have.attribute('header', 'import');
      expect(dialog).to.have.attribute('parent', data._links['fx:coupon_codes'].href);
      expect(dialog).to.have.attribute('group', 'test');
      expect(dialog).to.have.attribute('lang', 'es');
      expect(dialog).to.have.attribute('ns', 'foo');
      expect(dialog).to.have.attribute('form', 'foxy-coupon-codes-form');
    });

    it('renders translatable group label "code_plural"', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const label = await getByKey(control, 'code_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders Generate button', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:generate-button')) as HTMLElement;
      const label = button.querySelector('foxy-i18n[key="generate"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('opens Generate dialog when Generate button is clicked', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
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
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:import-button')) as HTMLElement;
      const label = button.querySelector('foxy-i18n[key="import"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('opens Import dialog when Import button is clicked', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
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
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const button = (await getByTestId(control, 'codes:filter-button')) as HTMLElement;
      const label = button.querySelector('foxy-i18n[key="filter"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('toggles query builder when Filter button is clicked', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
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
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
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
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang="es" ns="foo" .data=${data}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const pagination = control.querySelector('foxy-pagination') as Pagination;
      const paginationURL = new URL(data._links['fx:coupon_codes'].href);

      paginationURL.searchParams.set('limit', '5');

      expect(pagination).to.have.attribute('first', paginationURL.toString());
      expect(pagination).to.have.attribute('lang', 'es');
      expect(pagination).to.have.attribute('ns', 'foo pagination');
    });

    it('renders codes table inside of foxy-pagination', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form group="test" lang="es" ns="foo" .data=${data}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      expect(table).to.have.attribute('group', 'test');
      expect(table).to.have.attribute('lang', 'es');
      expect(table).to.have.attribute('ns', 'foo');
    });

    it('renders Code column in the codes table', async () => {
      type Codes = Resource<Rels.CouponCodes>;

      const card = await getTestData<Data>('./hapi/coupons/0');
      const codes = await getTestData<Codes>('./hapi/coupon_codes?coupon_id=0');
      const code = codes._embedded['fx:coupon_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang=${lang} ns=${ns} .data=${card}></foxy-coupon-form>
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

    it('opens Code dialog when a coupon code in the Code column is clicked', async () => {
      type Codes = Resource<Rels.CouponCodes>;

      const card = await getTestData<Data>('./hapi/coupons/0');
      const codes = await getTestData<Codes>('./hapi/coupon_codes?coupon_id=0');
      const code = codes._embedded['fx:coupon_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang=${lang} ns=${ns} .data=${card}></foxy-coupon-form>
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
      type Codes = Resource<Rels.CouponCodes>;

      const card = await getTestData<Data>('./hapi/coupons/0');
      const codes = await getTestData<Codes>('./hapi/coupon_codes?coupon_id=0');
      const code = codes._embedded['fx:coupon_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang=${lang} ns=${ns} .data=${card}></foxy-coupon-form>
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

    it('renders Last Updated column in the codes table', async () => {
      type Codes = Resource<Rels.CouponCodes>;

      const card = await getTestData<Data>('./hapi/coupons/0');
      const codes = await getTestData<Codes>('./hapi/coupon_codes?coupon_id=0');
      const code = codes._embedded['fx:coupon_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang=${lang} ns=${ns} .data=${card}></foxy-coupon-form>
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
      expect(header).to.have.attribute('key', 'date_modified');
      expect(header).to.have.attribute('ns', 'foo');

      expect(cell).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(cell).to.have.attribute('options', JSON.stringify({ value: code.date_modified }));
      expect(cell).to.have.attribute('lang', 'es');
      expect(cell).to.have.attribute('key', 'date');
      expect(cell).to.have.attribute('ns', 'foo');
    });

    it('renders Uses column in the codes table', async () => {
      type Codes = Resource<Rels.CouponCodes>;

      const card = await getTestData<Data>('./hapi/coupons/0');
      const codes = await getTestData<Codes>('./hapi/coupon_codes?coupon_id=0');
      const code = codes._embedded['fx:coupon_codes'][0];
      const lang = 'es';
      const ns = 'foo';

      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form lang=${lang} ns=${ns} .data=${card}></foxy-coupon-form>
      `);

      const control = (await getByTestId(element, 'codes')) as HTMLElement;
      const table = control.querySelector('foxy-pagination foxy-table') as Table<any>;

      const column = table.columns[3];
      const headerTemplate = column.header?.({ html, data: codes, lang, ns }) as TemplateResult;
      const cellTemplate = column.cell?.({ html, data: code, lang, ns }) as TemplateResult;

      const header = await fixture(headerTemplate);
      const cell = await fixture(html`<div>${cellTemplate}</div>`);

      expect(header).to.be.instanceOf(customElements.get('foxy-i18n'));
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('key', 'used_codes');
      expect(header).to.have.attribute('ns', 'foo');

      expect(cell).to.include.text(code.number_of_uses_to_date.toString());
    });
  });

  describe('usage', () => {
    it('renders "usage:before" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName(element, 'usage:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "usage:before" slot with template "usage:before" if available', async () => {
      const name = 'usage:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "usage:after" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName(element, 'usage:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "usage:after" slot with template "usage:after" if available', async () => {
      const name = 'usage:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'usage')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-coupon-form hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'usage')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes usage', async () => {
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form hiddencontrols="usage"></foxy-coupon-form>
      `);

      expect(await getByTestId(element, 'usage')).to.not.exist;
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.not.have.attribute('disabled');
        })
      );
    });

    it('is disabled when form is busy', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.href = 'https://demo.api/virtual/stall';

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.have.attribute('disabled');
        })
      );
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('disabled', 'disabled');

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.have.attribute('disabled');
        })
      );
    });

    it('is disabled when disabledcontrols includes usage', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('disabledcontrols', 'usage');

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.have.attribute('disabled');
        })
      );
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.not.have.attribute('readonly');
        })
      );
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('readonly', 'readonly');

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.have.attribute('readonly');
        })
      );
    });

    it('is readonly when readonlycontrols includes usage', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('readonlycontrols', 'usage');

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const fields = ['per-customer', 'per-coupon', 'per-coupon-code'];

      await Promise.all(
        fields.map(async field => {
          const fieldElement = await getByTestId(control, `usage:${field}`);
          expect(fieldElement).to.have.attribute('readonly');
        })
      );
    });

    it('renders an integer input for form.number_of_uses_allowed', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ number_of_uses_allowed: 3 });

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const field = (await getByTestId(control, 'usage:per-coupon')) as HTMLElement;

      expect(field).to.be.instanceOf(customElements.get('vaadin-integer-field'));
      expect(field).to.have.property('placeholder', 'unlimited');
      expect(field).to.have.property('label', 'uses_per_coupon');
      expect(field).to.have.property('value', '3');
    });

    it('writes to form.number_of_uses_allowed on change', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const field = (await getByTestId(control, 'usage:per-coupon')) as HTMLInputElement;

      field.value = '3';
      field.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.number_of_uses_allowed', 3);
    });

    it('renders an integer input for form.number_of_uses_allowed_per_code', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ number_of_uses_allowed_per_code: 8 });

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const field = (await getByTestId(control, 'usage:per-coupon-code')) as HTMLElement;

      expect(field).to.be.instanceOf(customElements.get('vaadin-integer-field'));
      expect(field).to.have.property('placeholder', 'unlimited');
      expect(field).to.have.property('label', 'uses_per_coupon_code');
      expect(field).to.have.property('value', '8');
    });

    it('writes to form.number_of_uses_allowed_per_code on change', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const field = (await getByTestId(control, 'usage:per-coupon-code')) as HTMLInputElement;

      field.value = '8';
      field.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.number_of_uses_allowed_per_code', 8);
    });

    it('renders an integer input for form.number_of_uses_allowed_per_customer', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ number_of_uses_allowed_per_customer: 1 });

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const field = (await getByTestId(control, 'usage:per-customer')) as HTMLElement;

      expect(field).to.be.instanceOf(customElements.get('vaadin-integer-field'));
      expect(field).to.have.property('placeholder', 'unlimited');
      expect(field).to.have.property('label', 'uses_per_customer');
      expect(field).to.have.property('value', '1');
    });

    it('writes to form.number_of_uses_allowed_per_customer on change', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const field = (await getByTestId(control, 'usage:per-customer')) as HTMLInputElement;

      field.value = '1';
      field.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.number_of_uses_allowed_per_customer', 1);
    });

    it('renders translatable usage summary', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({
        number_of_uses_allowed: 1,
        number_of_uses_allowed_per_code: 2,
        number_of_uses_allowed_per_customer: 3,
      });

      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const perCustomer = await getByKey(control, 'uses_per_customer_summary');
      const perCoupon = await getByKey(control, 'uses_per_coupon_summary');
      const perCode = await getByKey(control, 'uses_per_coupon_code_summary');

      expect(perCustomer).to.have.attribute('options', JSON.stringify({ count: 3 }));
      expect(perCustomer).to.have.attribute('lang', 'es');
      expect(perCustomer).to.have.attribute('ns', 'foo');

      expect(perCoupon).to.have.attribute('options', JSON.stringify({ count: 1 }));
      expect(perCoupon).to.have.attribute('lang', 'es');
      expect(perCoupon).to.have.attribute('ns', 'foo');

      expect(perCode).to.have.attribute('options', JSON.stringify({ count: 2 }));
      expect(perCode).to.have.attribute('lang', 'es');
      expect(perCode).to.have.attribute('ns', 'foo');
    });

    it('renders special translatable usage summary for unlimited values', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'usage')) as HTMLElement;
      const perCustomer = await getByKey(control, 'uses_per_customer_summary_0');
      const perCoupon = await getByKey(control, 'uses_per_coupon_summary_0');
      const perCode = await getByKey(control, 'uses_per_coupon_code_summary_0');

      expect(perCustomer).to.have.attribute('options', JSON.stringify({ count: 0 }));
      expect(perCustomer).to.have.attribute('lang', 'es');
      expect(perCustomer).to.have.attribute('ns', 'foo');

      expect(perCoupon).to.have.attribute('options', JSON.stringify({ count: 0 }));
      expect(perCoupon).to.have.attribute('lang', 'es');
      expect(perCoupon).to.have.attribute('ns', 'foo');

      expect(perCode).to.have.attribute('options', JSON.stringify({ count: 0 }));
      expect(perCode).to.have.attribute('lang', 'es');
      expect(perCode).to.have.attribute('ns', 'foo');
    });
  });

  describe('product-restrictions', () => {
    it('has i18n label "product_restrictions"', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'product_restrictions');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n explainer "product_restrictions_explainer"', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'product_restrictions_explainer');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n group label "allow"', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'allow');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n group label "block"', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'block');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('renders "product-restrictions:before" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName(element, 'product-restrictions:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "product-restrictions:before" slot with template "product-restrictions:before" if available', async () => {
      const name = 'product-restrictions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "product-restrictions:after" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName(element, 'product-restrictions:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "product-restrictions:after" slot with template "product-restrictions:after" if available', async () => {
      const name = 'product-restrictions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'product-restrictions')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-coupon-form hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'product-restrictions')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes product-restrictions', async () => {
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form hiddencontrols="product-restrictions"></foxy-coupon-form>
      `);

      expect(await getByTestId(element, 'product-restrictions')).to.not.exist;
    });

    it('renders translatable allow and block lists', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
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
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

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
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

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
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.not.have.attribute('disabled');
      expect(block).to.not.have.attribute('disabled');
    });

    it('is disabled when form is busy', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.href = 'https://demo.api/virtual/stall';

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('disabled');
      expect(block).to.have.attribute('disabled');
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('disabled', 'disabled');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('disabled');
      expect(block).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes product-restrictions', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('disabledcontrols', 'product-restrictions');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('disabled');
      expect(block).to.have.attribute('disabled');
    });

    it('is writable by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.not.have.attribute('readonly');
      expect(block).to.not.have.attribute('readonly');
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.setAttribute('readonly', 'readonly');

      const control = (await getByTestId(element, 'product-restrictions')) as HTMLElement;
      const allow = (await getByTestId(control, 'product-restrictions:allow')) as EditableList;
      const block = (await getByTestId(control, 'product-restrictions:block')) as EditableList;

      expect(allow).to.have.attribute('readonly');
      expect(block).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes product-restrictions', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

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
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'category_restrictions');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('has i18n helper text "category_restrictions_helper_text"', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const label = await getByKey(control, 'category_restrictions_helper_text');

      expect(label).to.have.property('lang', 'es');
      expect(label).to.have.property('ns', 'foo');
    });

    it('renders "category-restrictions:before" slot by default', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName(element, 'category-restrictions:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "category-restrictions:before" slot with template "category-restrictions:before" if available', async () => {
      const router = createRouter();
      const name = 'category-restrictions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "category-restrictions:after" slot by default', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName(element, 'category-restrictions:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "category-restrictions:after" slot with template "category-restrictions:after" if available', async () => {
      const router = createRouter();
      const name = 'category-restrictions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible when loaded', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      expect(await getByTestId(element, 'category-restrictions')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          hidden
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      expect(await getByTestId(element, 'category-restrictions')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes category-restrictions', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          hiddencontrols="category-restrictions"
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      expect(await getByTestId(element, 'category-restrictions')).to.not.exist;
    });

    it('is enabled by default', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;

      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when form is busy', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const router = createRouter();
      const handleAsUsual = (evt: FetchEvent) => router.handleEvent(evt);
      const stall = (evt: FetchEvent) => evt.respondWith(new Promise(() => void 0));

      element.addEventListener('fetch', handleAsUsual as (evt: Event) => unknown);
      element.href = 'https://demo.api/hapi/coupons/0';

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
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          disabled
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;

      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.have.attribute('disabled');
      });
    });

    it('is disabled when disabledcontrols includes category-restrictions', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          disabledcontrols="category-restrictions"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;

      ['foxy-pagination', '[data-testid="category-restrictions:page"]'].forEach(selector => {
        expect(control.querySelector(selector)).to.have.attribute('disabled');
      });
    });

    it('is editable by default', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const page = control.querySelector('[data-testid="category-restrictions:page"]');

      expect(page).to.not.have.attribute('readonly');
    });

    it('is readonly when form is readonly', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          readonly
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const page = control.querySelector('[data-testid="category-restrictions:page"]');

      expect(page).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes category-restrictions', async () => {
      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          readonlycontrols="category-restrictions"
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const page = control.querySelector('[data-testid="category-restrictions:page"]');

      expect(page).to.have.attribute('readonly');
    });

    it('renders translatable pagination for category restrictions', async () => {
      type Store = Resource<Rels.Store>;

      const router = createRouter();
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
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
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          group="test"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const control = (await getByTestId(element, 'category-restrictions')) as HTMLElement;
      const pagination = control.querySelector('foxy-pagination') as Pagination;
      const page = pagination.querySelector('[data-testid="category-restrictions:page"]');
      const couponItemCategories = element.data!._links['fx:coupon_item_categories'].href;

      expect(page).to.be.instanceOf(CategoryRestrictionsPage);
      expect(page).to.have.attribute('coupon-item-categories', couponItemCategories);
      expect(page).to.have.attribute('coupon', 'https://demo.api/hapi/coupons/0');
      expect(page).to.have.attribute('group', 'test');
      expect(page).to.have.attribute('lang', 'es');
      expect(page).to.have.attribute('ns', 'foo');
    });
  });

  describe('options', () => {
    it('renders i18n label option_plural', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const label = await getByKey(control, 'option_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders with "options:before" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'options:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "options:before" slot with template "options:before" if available and rendered', async () => {
      const name = 'options:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "options:after" slot by default', async () => {
      const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'options:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "options:after" slot with template "options:after" if available and rendered', async () => {
      const name = 'options:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'options')).to.exist;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-coupon-form hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'options')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "options"', async () => {
      const layout = html`<foxy-coupon-form hiddencontrols="options"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'options')).to.not.exist;
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render start/end date inputs
      element.edit({ start_date: '2022-01-01', end_date: '2022-12-31' });

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.not.have.attribute('disabled'));
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render start/end date inputs
      element.edit({ start_date: '2022-01-01', end_date: '2022-12-31' });
      element.disabled = true;

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('is disabled when the form is loading data', async () => {
      const router = createRouter();
      const handle = (evt: FetchEvent) => router.handleEvent(evt);
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-coupon-form href=${href} @fetch=${handle}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      await waitUntil(() => element.in({ busy: 'fetching' }));

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('is disabled when disabledcontrols includes options', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render start/end date inputs
      element.edit({ start_date: '2022-01-01', end_date: '2022-12-31' });
      element.setAttribute('disabledcontrols', 'options');

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render start/end date inputs
      element.edit({ start_date: '2022-01-01', end_date: '2022-12-31' });

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.not.have.attribute('readonly'));
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render start/end date inputs
      element.edit({ start_date: '2022-01-01', end_date: '2022-12-31' });
      element.readonly = true;

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.have.attribute('readonly'));
    });

    it('is readonly when readonlycontrols includes options', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      // editing to render start/end date inputs
      element.edit({ start_date: '2022-01-01', end_date: '2022-12-31' });
      element.setAttribute('readonlycontrols', 'options');

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const inputs = await getByTestClass(control, 'inputs');

      inputs.forEach(input => expect(input).to.have.attribute('readonly'));
    });

    it('renders a checkbox bound to form.multiple_codes_allowed', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;

      const getInput = () => getByTestId(control, 'options:multiple-codes-allowed');
      expect(await getInput()).to.not.have.attribute('checked');

      element.edit({ multiple_codes_allowed: false });
      expect(await getInput()).to.not.have.attribute('checked');

      element.edit({ multiple_codes_allowed: true });
      expect(await getInput()).to.have.attribute('checked');

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(false));
      expect(element).to.have.nested.property('form.multiple_codes_allowed', false);

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(true));
      expect(element).to.have.nested.property('form.multiple_codes_allowed', true);
    });

    it('renders translatable label and explainer for form.multiple_codes_allowed input', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:multiple-codes-allowed')) as HTMLElement;
      const label = input.querySelector('foxy-i18n[key="multiple_codes_allowed"]');
      const explainer = input.querySelector('foxy-i18n[key="multiple_codes_allowed_explainer"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders a checkbox bound to form.combinable', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;

      const getInput = () => getByTestId(control, 'options:combinable');
      expect(await getInput()).to.not.have.attribute('checked');

      element.edit({ combinable: false });
      expect(await getInput()).to.not.have.attribute('checked');

      element.edit({ combinable: true });
      expect(await getInput()).to.have.attribute('checked');

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(false));
      expect(element).to.have.nested.property('form.combinable', false);

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(true));
      expect(element).to.have.nested.property('form.combinable', true);
    });

    it('renders translatable label and explainer for form.combinable input', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:combinable')) as HTMLElement;
      const label = input.querySelector('foxy-i18n[key="combinable"]');
      const explainer = input.querySelector('foxy-i18n[key="combinable_explainer"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders a checkbox bound to form.exclude_category_discounts', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;

      const getInput = () => getByTestId(control, 'options:exclude-category-discounts');
      expect(await getInput()).to.have.attribute('checked');

      element.edit({ exclude_category_discounts: false });
      expect(await getInput()).to.have.attribute('checked');

      element.edit({ exclude_category_discounts: true });
      expect(await getInput()).to.not.have.attribute('checked');

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(false));
      expect(element).to.have.nested.property('form.exclude_category_discounts', true);

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(true));
      expect(element).to.have.nested.property('form.exclude_category_discounts', false);
    });

    it('renders translatable label and explainer for form.exclude_category_discounts input', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:exclude-category-discounts'))!;
      const label = input.querySelector('foxy-i18n[key="combine_with_category_discounts"]');
      const explainer = input.querySelector(
        'foxy-i18n[key="combine_with_category_discounts_explainer"]'
      );

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders a checkbox bound to form.exclude_line_item_discounts', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;

      const getInput = () => getByTestId(control, 'options:exclude-line-item-discounts');
      expect(await getInput()).to.have.attribute('checked');

      element.edit({ exclude_line_item_discounts: false });
      expect(await getInput()).to.have.attribute('checked');

      element.edit({ exclude_line_item_discounts: true });
      expect(await getInput()).to.not.have.attribute('checked');

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(false));
      expect(element).to.have.nested.property('form.exclude_line_item_discounts', true);

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(true));
      expect(element).to.have.nested.property('form.exclude_line_item_discounts', false);
    });

    it('renders translatable label and explainer for form.exclude_line_item_discounts input', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:exclude-line-item-discounts'))!;
      const label = input.querySelector('foxy-i18n[key="combine_with_line_discounts"]');
      const explainer = input.querySelector(
        'foxy-i18n[key="combine_with_line_discounts_explainer"]'
      );

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders a checkbox bound to form.is_taxable', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;

      const getInput = () => getByTestId(control, 'options:is-taxable');
      expect(await getInput()).to.not.have.attribute('checked');

      element.edit({ is_taxable: false });
      expect(await getInput()).to.not.have.attribute('checked');

      element.edit({ is_taxable: true });
      expect(await getInput()).to.have.attribute('checked');

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(false));
      expect(element).to.have.nested.property('form.is_taxable', false);

      (await getInput())?.dispatchEvent(new CheckboxChangeEvent(true));
      expect(element).to.have.nested.property('form.is_taxable', true);
    });

    it('renders translatable label and explainer for form.is_taxable input', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:is-taxable')) as HTMLElement;
      const label = input.querySelector('foxy-i18n[key="apply_taxes_before_coupon"]');
      const explainer = input.querySelector('foxy-i18n[key="apply_taxes_before_coupon_explainer"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders a checkbox toggling form.start_date and form.end_date inputs', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;

      const getCheckbox = () => getByTestId(control, 'options:dates');
      expect(await getCheckbox()).to.not.have.attribute('checked');

      element.edit({ start_date: '2022-01-01' });
      expect(await getCheckbox()).to.have.attribute('checked');
      element.undo();

      element.edit({ end_date: '2022-12-31' });
      expect(await getCheckbox()).to.have.attribute('checked');
      element.undo();

      element.edit({ start_date: '2022-01-01', end_date: '2022-01-01' });
      expect(await getCheckbox()).to.have.attribute('checked');

      (await getCheckbox())?.dispatchEvent(new CheckboxChangeEvent(false));
      expect(element).to.have.nested.property('form.start_date', null);
      expect(element).to.have.nested.property('form.end_date', null);

      (await getCheckbox())?.dispatchEvent(new CheckboxChangeEvent(true));
      expect(element).to.have.nested.property('form.start_date');
      expect(element).to.have.nested.property('form.end_date');
      expect(element.form.start_date).to.be.string;
      expect(element.form.end_date).to.be.string;
    });

    it('renders a date picker bound to form.start_date', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      element.edit({ start_date: '2022-01-01' });

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:start-date')) as HTMLInputElement;

      expect(input).to.be.instanceOf(customElements.get('vaadin-date-picker'));
      expect(input).to.have.attribute('placeholder', 'select');
      expect(input).to.have.attribute('label', 'start_date');
      expect(input).to.have.property('value', '2022-01-01');

      input.value = '2022-12-31';
      input.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.start_date', '2022-12-31');
    });

    it('renders a date picker bound to form.end_date', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      element.edit({ end_date: '2022-01-01' });

      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const input = (await getByTestId(control, 'options:end-date')) as HTMLInputElement;

      expect(input).to.be.instanceOf(customElements.get('vaadin-date-picker'));
      expect(input).to.have.attribute('placeholder', 'select');
      expect(input).to.have.attribute('label', 'end_date');
      expect(input).to.have.property('value', '2022-01-01');

      input.value = '2022-12-31';
      input.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.end_date', '2022-12-31');
    });

    it('renders translatable label and explainer for date inputs', async () => {
      const layout = html`<foxy-coupon-form lang="es" ns="foo"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = (await getByTestId(element, 'options')) as HTMLElement;
      const checkbox = (await getByTestId(control, 'options:dates')) as HTMLElement;
      const label = checkbox.querySelector('foxy-i18n[key="set_time_constraints"]');
      const explainer = checkbox.querySelector('foxy-i18n[key="set_time_constraints_explainer"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-coupon-form lang="es"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'coupon-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-coupon-form disabled></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-coupon-form disabledcontrols="create"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
      const submit = stub(element, 'submit');
      element.edit({ name: 'Foo' });

      const control = await getByTestId<ButtonElement>(element, 'create');
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-coupon-form hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-coupon-form hiddencontrols="create"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-coupon-form></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = './hapi/coupons/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-coupon-form .data=${data} disabled></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data} lang="es"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'coupon-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data} disabled></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          .data=${await getTestData<Data>('./hapi/coupons/0')}
          disabledcontrols="delete"
        >
        </foxy-coupon-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data} hidden></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form
          .data=${await getTestData<Data>('./hapi/coupons/0')}
          hiddencontrols="delete"
        >
        </foxy-coupon-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = './hapi/coupons/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = './hapi/coupons/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CouponForm>(html`
        <foxy-coupon-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-coupon-form>
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
      const layout = html`<foxy-coupon-form href=${href} lang="es"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = './hapi/not-found';
      const layout = html`<foxy-coupon-form href=${href} lang="es"></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-form .data=${data}></foxy-coupon-form>`;
      const element = await fixture<CouponForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
