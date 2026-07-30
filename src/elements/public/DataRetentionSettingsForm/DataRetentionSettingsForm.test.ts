import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { DataRetentionSettingsForm as Form } from './DataRetentionSettingsForm';

describe('DataRetentionSettingsForm', () => {
  it('imports and registers foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and registers foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and registers foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and registers foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('registers as foxy-data-retention-settings-form', () => {
    expect(customElements.get('foxy-data-retention-settings-form')).to.equal(Form);
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace of "data-retention-settings-form"', () => {
    expect(Form).to.have.property('defaultNS', 'data-retention-settings-form');
  });

  describe('v8n', () => {
    it('allows an unset auto_anonymize_days', () => {
      const element = new Form();
      expect(element.errors).to.not.include('auto-anonymize-days:v8n_too_small');
      expect(element.errors).to.not.include('auto-anonymize-days:v8n_required');
    });

    it('produces "auto-anonymize-days:v8n_too_small" when below 90', () => {
      const element = new Form();
      element.edit({ data_retention: { auto_anonymize: false, auto_anonymize_days: 89 } });
      expect(element.errors).to.include('auto-anonymize-days:v8n_too_small');

      element.edit({ data_retention: { auto_anonymize: false, auto_anonymize_days: 90 } });
      expect(element.errors).to.not.include('auto-anonymize-days:v8n_too_small');
    });

    it('requires days when auto_anonymize is enabled', () => {
      const element = new Form();
      element.edit({ data_retention: { auto_anonymize: true, auto_anonymize_days: null } });
      expect(element.errors).to.include('auto-anonymize-days:v8n_required');

      element.edit({ data_retention: { auto_anonymize: true, auto_anonymize_days: 365 } });
      expect(element.errors).to.not.include('auto-anonymize-days:v8n_required');
    });
  });

  describe('hiddenSelector', () => {
    it('always hides delete and timestamps', async () => {
      const element = await fixture<Form>(
        html`<foxy-data-retention-settings-form></foxy-data-retention-settings-form>`
      );

      expect(element.hiddenSelector.matches('delete', true)).to.be.true;
      expect(element.hiddenSelector.matches('timestamps', true)).to.be.true;
    });

    it('hides the days field when auto_anonymize is off', async () => {
      const element = await fixture<Form>(
        html`<foxy-data-retention-settings-form></foxy-data-retention-settings-form>`
      );

      element.edit({ data_retention: { auto_anonymize: false, auto_anonymize_days: null } });
      expect(element.hiddenSelector.matches('general:auto-anonymize-days', true)).to.be.true;
    });

    it('shows the days field when auto_anonymize is on', async () => {
      const element = await fixture<Form>(
        html`<foxy-data-retention-settings-form></foxy-data-retention-settings-form>`
      );

      element.edit({ data_retention: { auto_anonymize: true, auto_anonymize_days: 365 } });
      expect(element.hiddenSelector.matches('general:auto-anonymize-days', true)).to.be.false;
    });
  });

  it('renders a switch control for auto_anonymize', async () => {
    const element = await fixture<Form>(
      html`<foxy-data-retention-settings-form></foxy-data-retention-settings-form>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-switch-control[infer="auto-anonymize"]'
    );

    expect(control).to.exist;
  });

  it('renders a number control for auto_anonymize_days when enabled', async () => {
    const element = await fixture<Form>(
      html`<foxy-data-retention-settings-form></foxy-data-retention-settings-form>`
    );

    element.edit({ data_retention: { auto_anonymize: true, auto_anonymize_days: 365 } });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer="auto-anonymize-days"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '90');
  });

  it('reads and writes auto_anonymize via the store data_retention field', async () => {
    const element = await fixture<Form>(
      html`<foxy-data-retention-settings-form></foxy-data-retention-settings-form>`
    );

    element.edit({ data_retention: { auto_anonymize: true, auto_anonymize_days: 120 } });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      'foxy-internal-switch-control[infer="auto-anonymize"]'
    ) as HTMLElement & { getValue: () => unknown; setValue: (v: unknown) => void };

    expect(control.getValue()).to.equal(true);

    control.setValue(false);
    expect(element.form.data_retention).to.deep.equal({
      auto_anonymize: false,
      auto_anonymize_days: 120,
    });
  });
});
