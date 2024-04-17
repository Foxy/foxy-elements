import type { InternalCheckboxGroupControl } from '../../../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import type { InternalEditableListControl } from '../../../../internal/InternalEditableListControl/InternalEditableListControl';
import type { InternalRadioGroupControl } from '../../../../internal/InternalRadioGroupControl/InternalRadioGroupControl';

import './index';

import { InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleForm as Form } from './InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleForm';
import { expect, fixture, html } from '@open-wc/testing';

describe('CustomerPortalSettingsForm', () => {
  describe('InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleForm', () => {
    it('imports foxy-internal-checkbox-group-control', () => {
      expect(customElements.get('foxy-internal-checkbox-group-control')).to.exist;
    });

    it('imports foxy-internal-editable-list-control', () => {
      expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
    });

    it('imports foxy-internal-frequency-control', () => {
      expect(customElements.get('foxy-internal-frequency-control')).to.exist;
    });

    it('imports foxy-internal-radio-group-control', () => {
      expect(customElements.get('foxy-internal-radio-group-control')).to.exist;
    });

    it('imports foxy-internal-source-control', () => {
      expect(customElements.get('foxy-internal-source-control')).to.exist;
    });

    it('imports foxy-internal-form', () => {
      expect(customElements.get('foxy-internal-form')).to.exist;
    });

    it('defines itself as foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form', () => {
      expect(
        customElements.get(
          'foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form'
        )
      ).to.equal(Form);
    });

    it('extends foxy-internal-form', () => {
      expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
    });

    it('has an empty i18n namespace', () => {
      expect(Form.defaultNS).to.be.empty;
      expect(new Form().ns).to.be.empty;
    });

    it('produces "jsonata-query:v8n_required" error when jsonata query is missing', () => {
      const form = new Form();
      expect(form.errors).to.include('jsonata-query:v8n_required');

      form.edit({ jsonataQuery: '*' });
      expect(form.errors).not.to.include('jsonata-query:v8n_required');
    });

    it('produces "jsonata-query:v8n_too_long" error when jsonata query is too long', () => {
      const form = new Form();
      expect(form.errors).to.not.include('jsonata-query:v8n_too_long');

      form.edit({ jsonataQuery: 'a'.repeat(201) });
      expect(form.errors).to.include('jsonata-query:v8n_too_long');
    });

    it('produces "disallowed-dates:v8n_too_long" error when the list of disallowed dates is too long', () => {
      const form = new Form();
      expect(form.errors).to.not.include('disallowed-dates:v8n_too_long');

      form.edit({ disallowedDates: new Array(11).fill('') });
      expect(form.errors).to.include('disallowed-dates:v8n_too_long');
    });

    it('always hides timestamps', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('timestamps', true)).to.be.true;
    });

    it('hides min control when min value is not defined', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('min', true)).to.be.true;

      form.edit({ min: '1w' });
      expect(form.hiddenSelector.matches('min', true)).to.be.false;
    });

    it('hides max control when max value is not defined', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('max', true)).to.be.true;

      form.edit({ max: '1w' });
      expect(form.hiddenSelector.matches('max', true)).to.be.false;
    });

    it('hides days of week control when allowed days type is not "day"', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('days-of-week', true)).to.be.true;

      form.edit({ allowedDays: { type: 'day', days: [] } });
      expect(form.hiddenSelector.matches('days-of-week', true)).to.be.false;
    });

    it('hides dates of month control when allowed days type is not "month"', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('dates-of-month', true)).to.be.true;

      form.edit({ allowedDays: { type: 'month', days: [] } });
      expect(form.hiddenSelector.matches('dates', true)).to.be.false;
    });

    it('renders source control for jsonata query', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-source-control[infer="jsonata-query"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'jsonataQuery');
    });

    it('renders checkbox group control for minmax restrictions', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector<InternalCheckboxGroupControl>(
        'foxy-internal-checkbox-group-control[infer="minmax-restrictions"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.deep.property('options', [
        { label: 'option_min', value: 'min' },
        { label: 'option_max', value: 'max' },
      ]);

      expect(control.getValue()).to.deep.equal([]);

      control.setValue(['min']);
      expect(form).to.have.nested.property('form.min', '1m');
      expect(control.getValue()).to.deep.equal(['min']);

      control.setValue(['max']);
      expect(form).to.have.nested.property('form.max', '1y');
      expect(control.getValue()).to.deep.equal(['max']);
    });

    it('renders frequency control for min value', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-frequency-control[infer="min"]'
      )!;

      expect(control).to.exist;
    });

    it('renders frequency control for max value', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-frequency-control[infer="max"]'
      )!;

      expect(control).to.exist;
    });

    it('renders radio group control for day and date restrictions', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector<InternalRadioGroupControl>(
        'foxy-internal-radio-group-control[infer="day-and-date-restrictions"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.deep.property('options', [
        { label: 'option_none', value: 'none' },
        { label: 'option_dates', value: 'dates' },
        { label: 'option_days', value: 'days' },
      ]);

      expect(control.getValue()).to.equal('none');

      control.setValue('dates');
      expect(form).to.have.nested.property('form.allowedDays.type', 'month');
      expect(control.getValue()).to.equal('dates');

      control.setValue('days');
      expect(form).to.have.nested.property('form.allowedDays.type', 'day');
      expect(control.getValue()).to.equal('days');

      control.setValue('none');
      expect(form).to.have.nested.property('form.allowedDays', null);
      expect(control.getValue()).to.equal('none');
    });

    it('renders checkbox group control for days of week', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector<InternalCheckboxGroupControl>(
        'foxy-internal-checkbox-group-control[infer="days-of-week"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.deep.property('options', [
        { label: 'option_1', value: '1' },
        { label: 'option_2', value: '2' },
        { label: 'option_3', value: '3' },
        { label: 'option_4', value: '4' },
        { label: 'option_5', value: '5' },
        { label: 'option_6', value: '6' },
        { label: 'option_7', value: '7' },
      ]);

      expect(control.getValue()).to.deep.equal([]);

      control.setValue(['1', '4']);
      expect(form).to.have.deep.nested.property('form.allowedDays.days', [1, 4]);
      expect(control.getValue()).to.deep.equal(['1', '4']);
    });

    it('renders editable list control for dates of month', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector<InternalEditableListControl>(
        'foxy-internal-editable-list-control[infer="dates-of-month"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.deep.property('inputParams', {
        type: 'number',
        min: '1',
        max: '31',
        step: '1',
      });

      expect(control.getValue()).to.deep.equal([]);

      control.setValue([{ value: '1' }, { value: '31' }]);
      expect(form).to.have.deep.nested.property('form.allowedDays.days', [1, 31]);
      expect(control.getValue()).to.deep.equal([{ value: '1' }, { value: '31' }]);
    });

    it('renders editable list control for disallowed dates', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector<InternalEditableListControl>(
        'foxy-internal-editable-list-control[infer="disallowed-dates"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.attribute('range', 'optional');
      expect(control).to.have.deep.property('inputParams', { type: 'date' });

      expect(control.getValue()).to.deep.equal([]);

      control.setValue([{ value: '2021-01-01' }, { value: '2021-12-31' }]);
      expect(form).to.have.deep.nested.property('form.disallowedDates', [
        '2021-01-01',
        '2021-12-31',
      ]);
      expect(control.getValue()).to.deep.equal([{ value: '2021-01-01' }, { value: '2021-12-31' }]);
    });
  });
});
