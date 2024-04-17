import type { InternalEditableListControl } from '../../../../internal/InternalEditableListControl/InternalEditableListControl';

import './index';

import { InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleForm as Form } from './InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleForm';
import { expect, fixture, html } from '@open-wc/testing';

describe('CustomerPortalSettingsForm', () => {
  describe('InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleForm', () => {
    it('imports and defines foxy-internal-source-control', () => {
      expect(customElements.get('foxy-internal-source-control')).to.exist;
    });

    it('imports and defines foxy-internal-editable-list-control', () => {
      expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
    });

    it('imports and defines foxy-internal-form', () => {
      expect(customElements.get('foxy-internal-form')).to.exist;
    });

    it('defines itself as foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form', () => {
      expect(
        customElements.get(
          'foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form'
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

    it('produces "jsonata-query:v8n_required" error when jsonata query is missing', async () => {
      const form = new Form();
      expect(form.errors).to.include('jsonata-query:v8n_required');

      form.edit({ jsonataQuery: '*' });
      expect(form.errors).not.to.include('jsonata-query:v8n_required');
    });

    it('produces "jsonata-query:v8n_too_long" error when jsonata query is too long', async () => {
      const form = new Form();
      expect(form.errors).not.to.include('jsonata-query:v8n_too_long');

      form.edit({ jsonataQuery: 'a'.repeat(201) });
      expect(form.errors).to.include('jsonata-query:v8n_too_long');
    });

    it('produces "values:v8n_required" error when values are missing', async () => {
      const form = new Form();
      expect(form.errors).to.include('values:v8n_required');

      form.edit({ values: [] });
      expect(form.errors).to.include('values:v8n_required');

      form.edit({ values: ['1y'] });
      expect(form.errors).not.to.include('values:v8n_required');
    });

    it('produces "values:v8n_too_long" error when there are too many values', async () => {
      const form = new Form();
      expect(form.errors).not.to.include('values:v8n_too_long');

      form.edit({ values: new Array(21).fill('1y') });
      expect(form.errors).to.include('values:v8n_too_long');
    });

    it('always hides timestamps', () => {
      expect(new Form().hiddenSelector.matches('timestamps', true)).to.be.true;
    });

    it('renders source control for jsonata query', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-source-control[infer="jsonata-query"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'jsonataQuery');
    });

    it('renders editable list control for values', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form></foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-editable-list-control[infer="values"]'
      ) as InternalEditableListControl;

      expect(control).to.exist;

      expect(control).to.have.deep.property('inputParams', {
        type: 'number',
        step: '1',
        min: '1',
        max: '999',
      });

      expect(control).to.have.deep.property('units', [
        { label: 'values.unit_years', value: 'y' },
        { label: 'values.unit_months', value: 'm' },
        { label: 'values.unit_weeks', value: 'w' },
        { label: 'values.unit_days', value: 'd' },
      ]);

      expect(control.getValue()).to.equal(undefined);
      control.setValue([{ value: '1', unit: 'y' }]);
      expect(form).to.have.deep.nested.property('form.values', ['1y']);
      expect(control.getValue()).to.deep.equal([{ value: '1y', label: 'values.yearly' }]);
    });
  });
});
