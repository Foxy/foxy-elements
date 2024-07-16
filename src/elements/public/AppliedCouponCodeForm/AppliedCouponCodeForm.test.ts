import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { AppliedCouponCodeForm as Form } from './AppliedCouponCodeForm';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('AppliedCouponCodeForm', () => {
  it('imports and registers foxy-internal-checkbox-group-control element', () => {
    const constructor = customElements.get('foxy-internal-checkbox-group-control');
    expect(constructor).to.equal(InternalCheckboxGroupControl);
  });

  it('imports and registers foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.equal(InternalTextControl);
  });

  it('imports and registers foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.equal(InternalForm);
  });

  it('imports and registers itself as foxy-applied-coupon-code-form', () => {
    expect(customElements.get('foxy-applied-coupon-code-form')).to.equal(Form);
  });

  it('has a default i18n namespace "applied-coupon-code-form"', () => {
    expect(Form.defaultNS).to.equal('applied-coupon-code-form');
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('makes the all fields in the form readonly when initialized with data', async () => {
    const element = new Form();
    expect(element.readonlySelector.toString()).to.equal('');

    element.data = await getTestData<Data>('./hapi/applied_coupon_codes/0');
    expect(element.readonlySelector.toString()).to.equal('not=delete');
  });

  it('hides the default timestamps control', () => {
    expect(new Form().hiddenSelector.toString()).to.equal('timestamps');
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a text control for "code" field', async () => {
    const element = await fixture<Form>(
      html`<foxy-applied-coupon-code-form></foxy-applied-coupon-code-form>`
    );

    const control = element.renderRoot.querySelector('[infer="code"]');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a special helper text for "code" field in template state', async () => {
    const element = await fixture<Form>(
      html`<foxy-applied-coupon-code-form></foxy-applied-coupon-code-form>`
    );

    const control = element.renderRoot.querySelector('[infer="code"]');
    expect(control).to.have.property('helperText', 'code.helper_text_new');
  });

  it('renders a special helper text for "code" field in snapshot state', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-applied-coupon-code-form
        href="https://demo.api/hapi/applied_coupon_codes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-applied-coupon-code-form>
    `);

    await waitUntil(() => !!element.data);
    const control = element.renderRoot.querySelector('[infer="code"]');

    expect(control).to.have.property('helperText', 'code.helper_text_existing');
  });

  it('renders a checkbox group control for "ignore_usage_limits" field in template state', async () => {
    const element = await fixture<Form>(
      html`<foxy-applied-coupon-code-form></foxy-applied-coupon-code-form>`
    );

    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      '[infer="ignore-usage-limits"]'
    );

    const options = [{ value: 'checked', label: 'option_checked' }];

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', options);

    control?.setValue(['checked']);
    expect(control?.getValue()).to.deep.equal(['checked']);
    expect(element).to.have.nested.property('form.ignore_usage_limits', true);

    control?.setValue([]);
    expect(control?.getValue()).to.deep.equal([]);
    expect(element).to.have.nested.property('form.ignore_usage_limits', false);
  });
});
