import type { InternalTemplateConfigFormFilterValuesControl } from './internal/InternalTemplateConfigFormFilterValuesControl/InternalTemplateConfigFormFilterValuesControl';
import type { InternalSourceControl } from '../../internal/InternalSourceControl/InternalSourceControl';
import type { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import type { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { TemplateConfigForm as Form } from './TemplateConfigForm';
import { getDefaultJSON } from './defaults';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('TemplateConfigForm', () => {
  it('imports and defines foxy-internal-editable-list-control element', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control element', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control element', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control element', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control element', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-template-config-form-supported-cards-control element', () => {
    expect(customElements.get('foxy-internal-template-config-form-supported-cards-control')).to
      .exist;
  });

  it('imports and defines foxy-internal-template-config-form-filter-values-control element', () => {
    expect(customElements.get('foxy-internal-template-config-form-filter-values-control')).to.exist;
  });

  it('defines itself as foxy-template-config-form', () => {
    expect(customElements.get('foxy-template-config-form')).to.equal(Form);
  });

  it('has a default i18next namespace of "template-config-form"', () => {
    expect(Form.defaultNS).to.equal('template-config-form');
    expect(new Form().ns).to.equal('template-config-form');
  });

  it('has a reactive property "countries"', () => {
    expect(Form.properties).to.have.deep.property('countries', {});
    expect(new Form().countries).to.be.null;
  });

  it('has a reacitve property "regions" (deprecated)', () => {
    expect(Form.properties).to.have.deep.property('regions', {});
    expect(new Form().regions).to.be.null;
  });

  it('has a reactive property "store"', () => {
    expect(Form.properties).to.have.deep.property('store', {});
    expect(new Form().store).to.be.null;
  });

  it('produces "csp-policy-enforce-reporting-endpoint:v8n_too_long" error when appropriate', () => {
    const form = new Form();
    const error = 'csp-policy-enforce-reporting-endpoint:v8n_too_long';
    expect(form.errors).to.not.include(error);

    const json = getDefaultJSON();
    json.csp = { usage: 'enforce', policy_enforce: { reporting_endpoint: 'A'.repeat(1000) } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.not.include(error);

    json.csp = { usage: 'enforce', policy_enforce: { reporting_endpoint: 'A'.repeat(1001) } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.include(error);
  });

  it('produces "csp-policy-report-reporting-endpoint:v8n_too_long" error when appropriate', () => {
    const form = new Form();
    const error = 'csp-policy-report-reporting-endpoint:v8n_too_long';
    expect(form.errors).to.not.include(error);

    const json = getDefaultJSON();
    json.csp = { usage: 'report', policy_report: { reporting_endpoint: 'A'.repeat(1000) } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.not.include(error);

    json.csp = { usage: 'report', policy_report: { reporting_endpoint: 'A'.repeat(1001) } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.include(error);
  });

  it('produces "csp-policy-enforce-script-src:v8n_too_long" error when appropriate', () => {
    const form = new Form();
    const error = 'csp-policy-enforce-script-src:v8n_too_long';
    expect(form.errors).to.not.include(error);

    const json = getDefaultJSON();
    json.csp = { usage: 'enforce', policy_enforce: { script_src: ['A'.repeat(1000)] } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.not.include(error);

    json.csp = { usage: 'enforce', policy_enforce: { script_src: ['A'.repeat(1001)] } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.include(error);
  });

  it('produces "csp-policy-report-script-src:v8n_too_long" error when appropriate', () => {
    const form = new Form();
    const error = 'csp-policy-report-script-src:v8n_too_long';
    expect(form.errors).to.not.include(error);

    const json = getDefaultJSON();
    json.csp = { usage: 'report', policy_report: { script_src: ['A'.repeat(1000)] } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.not.include(error);

    json.csp = { usage: 'report', policy_report: { script_src: ['A'.repeat(1001)] } };
    form.edit({ json: JSON.stringify(json) });
    expect(form.errors).to.include(error);
  });

  it('hides cart display settings when customization is turned off', () => {
    const form = new Form();

    expect(form.hiddenSelector.matches('cart-group-two', true)).to.be.true;
    expect(form.hiddenSelector.matches('cart-group-three', true)).to.be.true;
    expect(form.hiddenSelector.matches('cart-group-four', true)).to.be.true;

    const json = getDefaultJSON();
    json.cart_display_config.usage = 'required';
    form.edit({ json: JSON.stringify(json) });

    expect(form.hiddenSelector.matches('cart-group-two', true)).to.be.false;
    expect(form.hiddenSelector.matches('cart-group-three', true)).to.be.false;
    expect(form.hiddenSelector.matches('cart-group-four', true)).to.be.false;
  });

  it('hides foxycomplete settings when it is turned off', () => {
    const form = new Form();

    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-show-combobox', true)
    ).to.be.false;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-open', true)
    ).to.be.false;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-close', true)
    ).to.be.false;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-show-flags', true)
    ).to.be.false;

    const json = getDefaultJSON();
    json.foxycomplete.usage = 'none';
    form.edit({ json: JSON.stringify(json) });

    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-show-combobox', true)
    ).to.be.true;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-open', true)
    ).to.be.true;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-close', true)
    ).to.be.true;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-show-flags', true)
    ).to.be.true;
  });

  it('hides foxycomplete combobox settings when combobox is off', () => {
    const form = new Form();

    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-open', true)
    ).to.be.false;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-close', true)
    ).to.be.false;

    const json = getDefaultJSON();
    json.foxycomplete.show_combobox = false;
    form.edit({ json: JSON.stringify(json) });

    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-open', true)
    ).to.be.true;
    expect(
      form.hiddenSelector.matches('country-and-region-group-one:foxycomplete-combobox-close', true)
    ).to.be.true;
  });

  it('hides some location filtering controls depending on usage type', () => {
    const form = new Form();

    expect(form.hiddenSelector.matches('country-and-region-group-two', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-three', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-four', true)).to.be.true;

    const json = getDefaultJSON();
    json.location_filtering.usage = 'both';
    form.edit({ json: JSON.stringify(json) });

    expect(form.hiddenSelector.matches('country-and-region-group-two', true)).to.be.false;
    expect(form.hiddenSelector.matches('country-and-region-group-three', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-four', true)).to.be.true;

    json.location_filtering.usage = 'shipping';
    form.edit({ json: JSON.stringify(json) });

    expect(form.hiddenSelector.matches('country-and-region-group-two', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-three', true)).to.be.false;
    expect(form.hiddenSelector.matches('country-and-region-group-four', true)).to.be.true;

    json.location_filtering.usage = 'billing';
    form.edit({ json: JSON.stringify(json) });

    expect(form.hiddenSelector.matches('country-and-region-group-two', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-three', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-four', true)).to.be.false;

    json.location_filtering.usage = 'independent';
    form.edit({ json: JSON.stringify(json) });

    expect(form.hiddenSelector.matches('country-and-region-group-two', true)).to.be.true;
    expect(form.hiddenSelector.matches('country-and-region-group-three', true)).to.be.false;
    expect(form.hiddenSelector.matches('country-and-region-group-four', true)).to.be.false;
  });

  it('hides default checkout type setting when only one checkout type is configured', () => {
    const form = new Form();
    const selector = 'customer-accounts:checkout-type-default';
    expect(form.hiddenSelector.matches(selector, true)).to.be.false;

    const json = getDefaultJSON();
    json.checkout_type = 'default_guest';
    form.edit({ json: JSON.stringify(json) });
    expect(form.hiddenSelector.matches(selector, true)).to.be.false;

    json.checkout_type = 'account_only';
    form.edit({ json: JSON.stringify(json) });
    expect(form.hiddenSelector.matches(selector, true)).to.be.true;

    json.checkout_type = 'guest_only';
    form.edit({ json: JSON.stringify(json) });
    expect(form.hiddenSelector.matches(selector, true)).to.be.true;
  });

  it('hides ToS checkbox settings when ToS checkbox is not configured', () => {
    const form = new Form();
    const $ = (s: string) => form.hiddenSelector.matches(s, true);

    expect($('consent-group-one:tos-checkbox-settings-url')).to.be.true;
    expect($('consent-group-one:tos-checkbox-settings-initial-state')).to.be.true;
    expect($('consent-group-one:tos-checkbox-settings-is-hidden')).to.be.true;

    const json = getDefaultJSON();
    json.tos_checkbox_settings.usage = 'required';
    form.edit({ json: JSON.stringify(json) });

    expect($('consent-group-one:tos-checkbox-settings-url')).to.be.false;
    expect($('consent-group-one:tos-checkbox-settings-initial-state')).to.be.false;
    expect($('consent-group-one:tos-checkbox-settings-is-hidden')).to.be.false;
  });

  it('hides deprecated Google Analytics and Google Tag Manager settings when 3rd-party analytics are off', async () => {
    const form = new Form();
    const $ = (s: string) => form.hiddenSelector.matches(s, true);

    expect($('analytics-config-google-analytics')).to.be.true;
    expect($('analytics-config-google-tag')).to.be.true;

    const json = getDefaultJSON();
    const data = await getTestData<Data>('./hapi/template_configs/0');
    json.analytics_config.usage = 'required';
    json.analytics_config.google_analytics.usage = 'required';
    data.json = JSON.stringify(json);
    form.data = data;

    expect($('analytics-config-google-analytics')).to.be.false;
    expect($('analytics-config-google-tag')).to.be.false;
  });

  it('hides deprecated Google Analytics section entirely unless it is already configured', async () => {
    const form = new Form();
    const $ = (s: string) => form.hiddenSelector.matches(s, true);
    expect($('analytics-config-google-analytics')).to.be.true;

    const json = getDefaultJSON();
    const data = await getTestData<Data>('./hapi/template_configs/0');
    json.analytics_config.usage = 'required';
    json.analytics_config.google_analytics.usage = 'required';
    form.edit({ json: JSON.stringify(json) });
    expect($('analytics-config-google-analytics')).to.be.true;

    data.json = JSON.stringify(json);
    form.data = data;
    expect($('analytics-config-google-analytics')).to.be.false;
  });

  it('hides deprecated Google Analytics settings when it is turned off', async () => {
    const form = new Form();
    const $ = (s: string) => form.hiddenSelector.matches(s, true);

    expect($('analytics-config-google-analytics:analytics-config-google-analytics-account-id')).to
      .be.true;
    expect($('analytics-config-google-analytics:analytics-config-google-analytics-include-on-site'))
      .to.be.true;

    const json = getDefaultJSON();
    const data = await getTestData<Data>('./hapi/template_configs/0');
    json.analytics_config.usage = 'required';
    json.analytics_config.google_analytics.usage = 'required';
    data.json = JSON.stringify(json);
    form.data = data;

    expect($('analytics-config-google-analytics:analytics-config-google-analytics-account-id')).to
      .be.false;
    expect($('analytics-config-google-analytics:analytics-config-google-analytics-include-on-site'))
      .to.be.false;

    json.analytics_config.google_analytics.usage = 'none';
    form.edit({ json: JSON.stringify(json) });

    expect($('analytics-config-google-analytics:analytics-config-google-analytics-account-id')).to
      .be.true;
    expect($('analytics-config-google-analytics:analytics-config-google-analytics-include-on-site'))
      .to.be.true;
  });

  it('hides Google Tag Manager settings when it is turned off', () => {
    const form = new Form();
    const $ = (s: string) => form.hiddenSelector.matches(s, true);

    expect($('analytics-config-google-tag:analytics-config-google-tag-account-id')).to.be.true;
    expect($('analytics-config-google-tag:analytics-config-google-tag-send-to')).to.be.true;

    const json = getDefaultJSON();
    json.analytics_config.usage = 'required';
    json.analytics_config.google_tag.usage = 'required';
    form.edit({ json: JSON.stringify(json) });

    expect($('analytics-config-google-tag:analytics-config-google-tag-account-id')).to.be.false;
    expect($('analytics-config-google-tag:analytics-config-google-tag-send-to')).to.be.false;
  });

  it('hides custom multiship settings when multiship is turned off for store', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-template-config-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-template-config-form>
    `);

    expect(element.hiddenSelector.matches('custom-script-values-multiship-checkout-fields', true))
      .to.be.true;

    await new Form.API(element).fetch('https://demo.api/hapi/stores/0', {
      method: 'PATCH',
      body: JSON.stringify({ features_multiship: false }),
    });

    element.store = 'https://demo.api/hapi/stores/0';
    await element.requestUpdate();
    await waitUntil(
      () => {
        const nucleon = element.renderRoot.querySelector<NucleonElement<any>>('#storeLoader');
        return !!nucleon?.data;
      },
      undefined,
      { timeout: 5000 }
    );

    await element.requestUpdate();
    expect(element.hiddenSelector.matches('custom-script-values-multiship-checkout-fields', true))
      .to.be.true;

    element.store = '';
    await element.requestUpdate();
    await new Form.API(element).fetch('https://demo.api/hapi/stores/0', {
      method: 'PATCH',
      body: JSON.stringify({ features_multiship: true }),
    });

    element.store = 'https://demo.api/hapi/stores/0';
    await element.requestUpdate();
    await waitUntil(
      () => {
        const nucleon = element.renderRoot.querySelector<NucleonElement<any>>('#storeLoader');
        return !!nucleon?.data;
      },
      undefined,
      { timeout: 5000 }
    );

    await element.requestUpdate();
    expect(element.hiddenSelector.matches('custom-script-values-multiship-checkout-fields', true))
      .to.be.false;
  });

  it('renders form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders four groups of cart settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    [
      'foxy-internal-summary-control[infer="cart-group-one"]',
      'foxy-internal-summary-control[infer="cart-group-two"]',
      'foxy-internal-summary-control[infer="cart-group-three"]',
      'foxy-internal-summary-control[infer="cart-group-four"]',
    ].forEach(selector => {
      expect(element.renderRoot.querySelector(selector)).to.exist;
    });
  });

  it('renders select control for cart type in cart settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="cart-group-one"] foxy-internal-select-control[infer="cart-type"]'
    );

    const options = JSON.stringify([
      { label: 'option_default', value: 'default' },
      { label: 'option_fullpage', value: 'fullpage' },
      { label: 'option_custom', value: 'custom' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'cart_type');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders switch control for cart config usage in cart settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="cart-group-one"] foxy-internal-switch-control[infer="cart-display-config-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'cart_display_config.usage');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('invert');
  });

  [
    ['show_product_weight', 'show_product_category', 'show_product_code', 'show_product_options'],
    ['show_sub_frequency', 'show_sub_startdate', 'show_sub_nextdate', 'show_sub_enddate'],
  ].forEach((group, index) => {
    const suffix = index === 0 ? 'two' : 'three';
    group.forEach(prop => {
      it(`renders switch control for ${prop} in cart settings group ${suffix}`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<Form>(layout);
        const controlInfer = `cart-display-config-${prop.replace(/_/g, '-')}`;
        const control = element.renderRoot.querySelector(
          `[infer="cart-group-${suffix}"] foxy-internal-switch-control[infer="${controlInfer}"]`
        );

        expect(control).to.exist;
        expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
        expect(control).to.have.attribute('json-path', `cart_display_config.${prop}`);
        expect(control).to.have.attribute('property', 'json');
      });
    });
  });

  it('renders editable list control for hidden product options in cart settings group four', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="cart-group-four"] foxy-internal-editable-list-control[infer="cart-display-config-hidden-product-options"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'cart_display_config.hidden_product_options');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('simple-value');
  });

  it('renders four groups for country and region settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    [
      'foxy-internal-summary-control[infer="country-and-region-group-one"]',
      'foxy-internal-summary-control[infer="country-and-region-group-two"]',
      'foxy-internal-summary-control[infer="country-and-region-group-three"]',
      'foxy-internal-summary-control[infer="country-and-region-group-four"]',
    ].forEach(selector => {
      expect(element.renderRoot.querySelector(selector)).to.exist;
    });
  });

  it('renders switch control for foxycomplete usage in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-one"] foxy-internal-switch-control[infer="foxycomplete-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'foxycomplete.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders select control for foxycomplete combobox usage in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="country-and-region-group-one"] foxy-internal-select-control[infer="foxycomplete-show-combobox"]'
    );

    const options = JSON.stringify([
      { label: 'option_combobox', value: 'combobox' },
      { label: 'option_search', value: 'search' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');

    expect(control?.getValue()).to.equal('combobox');
    control?.setValue('search');
    expect(JSON.parse(element.form.json!).foxycomplete.show_combobox).to.equal(false);
  });

  it('renders text control for foxycomplete combobox open icon in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-one"] foxy-internal-text-control[infer="foxycomplete-combobox-open"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'foxycomplete.combobox_open');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders text control for foxycomplete combobox close icon in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-one"] foxy-internal-text-control[infer="foxycomplete-combobox-close"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'foxycomplete.combobox_close');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders switch control for foxycomplete show flags option in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-one"] foxy-internal-switch-control[infer="foxycomplete-show-flags"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'foxycomplete.show_flags');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders switch control for postal code lookup feature in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-one"] foxy-internal-switch-control[infer="postal-code-lookup"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'enabled');
    expect(control).to.have.attribute('json-path', 'postal_code_lookup.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders select control for location filtering usage in country and region settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-one"] foxy-internal-select-control[infer="location-filtering-usage"]'
    );

    const options = JSON.stringify([
      { label: 'option_none', value: 'none' },
      { label: 'option_shipping', value: 'shipping' },
      { label: 'option_billing', value: 'billing' },
      { label: 'option_both', value: 'both' },
      { label: 'option_independent', value: 'independent' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.usage');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('options', options);
  });

  it('renders select control for shipping filter type in country and region settings group two', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-two"] foxy-internal-select-control[infer="location-filtering-filter-type"]'
    );

    const options = JSON.stringify([
      { label: 'option_blocklist', value: 'blacklist' },
      { label: 'option_allowlist', value: 'whitelist' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.shipping_filter_type');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('options', options);
  });

  it('renders filter values control for shipping and billing filter values in country and region settings group two', async () => {
    const layout = html`
      <foxy-template-config-form countries="https://demo.api/hapi/property_helpers/3">
      </foxy-template-config-form>
    `;

    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalTemplateConfigFormFilterValuesControl>(
      '[infer="country-and-region-group-two"] foxy-internal-template-config-form-filter-values-control[infer="location-filtering-filter-values"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.shipping_filter_values');
    expect(control).to.have.attribute('countries', 'https://demo.api/hapi/property_helpers/3');
    expect(control).to.have.attribute('property', 'json');

    const testValue = { US: ['CA', 'NY'], CA: '*' };
    control?.setValue(testValue);
    const config = JSON.parse(element.form.json!).location_filtering;

    expect(config.shipping_filter_values).to.deep.equal(testValue);
    expect(config.billing_filter_values).to.deep.equal(testValue);
  });

  it('renders select control for shipping filter type in country and region settings group three', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-three"] foxy-internal-select-control[infer="location-filtering-shipping-filter-type"]'
    );

    const options = JSON.stringify([
      { label: 'option_blocklist', value: 'blacklist' },
      { label: 'option_allowlist', value: 'whitelist' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.shipping_filter_type');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('options', options);
  });

  it('renders filter values control for shipping filter values in country and region settings group three', async () => {
    const layout = html`
      <foxy-template-config-form countries="https://demo.api/hapi/property_helpers/3">
      </foxy-template-config-form>
    `;

    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalTemplateConfigFormFilterValuesControl>(
      '[infer="country-and-region-group-three"] foxy-internal-template-config-form-filter-values-control[infer="location-filtering-shipping-filter-values"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.shipping_filter_values');
    expect(control).to.have.attribute('countries', 'https://demo.api/hapi/property_helpers/3');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders select control for billing filter type in country and region settings group four', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="country-and-region-group-four"] foxy-internal-select-control[infer="location-filtering-billing-filter-type"]'
    );

    const options = JSON.stringify([
      { label: 'option_blocklist', value: 'blacklist' },
      { label: 'option_allowlist', value: 'whitelist' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.billing_filter_type');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('options', options);
  });

  it('renders filter values control for billing filter values in country and region settings group four', async () => {
    const layout = html`
      <foxy-template-config-form countries="https://demo.api/hapi/property_helpers/3">
      </foxy-template-config-form>
    `;

    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalTemplateConfigFormFilterValuesControl>(
      '[infer="country-and-region-group-four"] foxy-internal-template-config-form-filter-values-control[infer="location-filtering-billing-filter-values"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'location_filtering.billing_filter_values');
    expect(control).to.have.attribute('countries', 'https://demo.api/hapi/property_helpers/3');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders group for customer account settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="customer-accounts"]'
    );

    expect(group).to.exist;
  });

  it('renders select control for checkout type in customer account settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="customer-accounts"] foxy-internal-select-control[infer="checkout-type-account"]'
    );

    const options = JSON.stringify([
      { label: 'option_account', value: 'account_only' },
      { label: 'option_guest', value: 'guest_only' },
      { label: 'option_both', value: 'default_guest' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'checkout_type');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');

    const json = getDefaultJSON();
    json.checkout_type = 'account_only';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal('account_only');

    json.checkout_type = 'guest_only';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal('guest_only');

    json.checkout_type = 'default_guest';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal('default_guest');

    control?.setValue('default_account');
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal('default_guest');
  });

  it('renders select control for default checkout type in customer account settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="customer-accounts"] foxy-internal-select-control[infer="checkout-type-default"]'
    );

    const options = JSON.stringify([
      { label: 'option_default_account', value: 'default_account' },
      { label: 'option_default_guest', value: 'default_guest' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'checkout_type');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders three groups for consent settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    [
      'foxy-internal-summary-control[infer="consent-group-one"]',
      'foxy-internal-summary-control[infer="consent-group-two"]',
      'foxy-internal-summary-control[infer="consent-group-three"]',
    ].forEach(selector => {
      expect(element.renderRoot.querySelector(selector)).to.exist;
    });
  });

  it('renders select control for ToS checkbox usage in consent settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="consent-group-one"] foxy-internal-select-control[infer="tos-checkbox-settings-usage"]'
    );

    const options = JSON.stringify([
      { label: 'option_none', value: 'none' },
      { label: 'option_optional', value: 'optional' },
      { label: 'option_required', value: 'required' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'tos_checkbox_settings.usage');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders text control for ToS checkbox URL in consent settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="consent-group-one"] foxy-internal-text-control[infer="tos-checkbox-settings-url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'tos_checkbox_settings.url');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders select control for ToS checkbox initial state in consent settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="consent-group-one"] foxy-internal-select-control[infer="tos-checkbox-settings-initial-state"]'
    );

    const options = JSON.stringify([
      { label: 'option_checked', value: 'checked' },
      { label: 'option_unchecked', value: 'unchecked' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'tos_checkbox_settings.initial_state');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders switch control for using hidden item option with ToS checkbox in consent settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="consent-group-one"] foxy-internal-switch-control[infer="tos-checkbox-settings-is-hidden"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'tos_checkbox_settings.is_hidden');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders switch control for using hidden item option with ToS checkbox in consent settings group two', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="consent-group-two"] foxy-internal-switch-control[infer="eu-secure-data-transfer-consent-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'eu_secure_data_transfer_consent.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders switch control for newsletter subscription usage in consent settings group three', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="consent-group-three"] foxy-internal-switch-control[infer="newsletter-subscribe-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'newsletter_subscribe.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders group for supported cards settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="supported-cards-group"]'
    );

    expect(group).to.exist;
  });

  it('renders supported cards control in supported cards settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="supported-cards-group"] foxy-internal-template-config-form-supported-cards-control[infer="supported-payment-cards"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'supported_payment_cards');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders disclaimer in supported cards settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const disclaimer = element.renderRoot.querySelector(
      '[infer="supported-cards-group"] foxy-i18n[infer=""][key="disclaimer"]'
    );

    expect(disclaimer).to.exist;
  });

  it('renders group for CSC requirements settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="csc-requirements-group"]'
    );

    expect(group).to.exist;
  });

  it('renders select control for CSC requirements in CSC requirements settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="csc-requirements-group"] foxy-internal-select-control[infer="csc-requirements"]'
    );

    const options = JSON.stringify([
      { label: 'option_all_cards', value: 'all_cards' },
      { label: 'option_sso_only', value: 'sso_only' },
      { label: 'option_new_cards_only', value: 'new_cards_only' },
    ]);

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csc_requirements');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders three groups for checkout fields settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    [
      'foxy-internal-summary-control[infer="checkout-fields-group-one"]',
      'foxy-internal-summary-control[infer="checkout-fields-group-two"]',
      'foxy-internal-summary-control[infer="checkout-fields-group-three"]',
    ].forEach(selector => {
      expect(element.renderRoot.querySelector(selector)).to.exist;
    });
  });

  it('renders switch control for toggling cart controls in checkout fields settings group one', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="checkout-fields-group-one"] foxy-internal-switch-control[infer="custom-checkout-field-requirements-cart-controls"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'disabled');
    expect(control).to.have.attribute('true-alias', 'enabled');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute(
      'json-path',
      'custom_checkout_field_requirements.cart_controls'
    );
  });

  [
    [
      'billing_address1',
      'billing_address2',
      'billing_city',
      'billing_region',
      'billing_postal_code',
      'billing_country',
    ],
    [
      'billing_first_name',
      'billing_last_name',
      'billing_company',
      'billing_tax_id',
      'billing_phone',
      'coupon_entry',
    ],
  ].forEach((group, index) => {
    const suffix = index === 0 ? 'two' : 'three';
    group.forEach(prop => {
      const infer = prop.replace(/_/g, '-').replace('1', '-one').replace('2', '-two');
      const path = `custom_checkout_field_requirements.${prop}`;

      it(`renders select control for ${prop} in checkout fields settings group ${suffix}`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<Form>(layout);
        const control = element.renderRoot.querySelector<InternalSelectControl>(
          `[infer="checkout-fields-group-${suffix}"] foxy-internal-select-control[infer="custom-checkout-field-requirements-${infer}"]`
        );

        const options =
          prop === 'coupon_entry'
            ? [
                { label: 'option_enabled', value: 'enabled' },
                { label: 'option_disabled', value: 'disabled' },
              ]
            : [
                { label: 'option_default', value: 'default' },
                { label: 'option_optional', value: 'optional' },
                { label: 'option_required', value: 'required' },
                { label: 'option_hidden', value: 'hidden' },
              ];

        expect(control).to.exist;
        expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
        expect(control).to.have.attribute('json-path', path);
        expect(control).to.have.attribute('property', 'json');
        expect(control).to.have.attribute('options', JSON.stringify(options));
        expect(control).to.have.attribute('layout', 'summary-item');
      });
    });
  });

  it('renders switch control for CSP usage in CSP settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="csp"] [infer="csp-group-one"] foxy-internal-switch-control[infer="csp-enable-csp"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csp.usage');
    expect(control).to.have.attribute('property', 'json');

    const json = getDefaultJSON();
    json.csp.usage = 'none';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal(false);

    control?.setValue(true);
    expect(JSON.parse(element.form.json!).csp.usage).to.equal('enforce');
    expect(control?.getValue()).to.equal(true);

    json.csp.usage = 'report';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal(false);

    control?.setValue(true);
    expect(JSON.parse(element.form.json!).csp.usage).to.equal('both');
    expect(control?.getValue()).to.equal(true);

    control?.setValue(false);
    expect(JSON.parse(element.form.json!).csp.usage).to.equal('report');
  });

  it('renders text control for CSP report URI in CSP settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    const json = getDefaultJSON();
    json.csp = { usage: 'enforce' };
    element.edit({ json: JSON.stringify(json) });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="csp"] [infer="csp-group-one"] foxy-internal-text-control[infer="csp-policy-enforce-reporting-endpoint"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csp.policy_enforce.reporting_endpoint');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders editable list control for CSP script sources in CSP settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    const json = getDefaultJSON();
    json.csp = { usage: 'enforce' };
    element.edit({ json: JSON.stringify(json) });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="csp"] [infer="csp-group-one"] foxy-internal-editable-list-control[infer="csp-policy-enforce-script-src"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csp.policy_enforce.script_src');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('simple-value');
  });

  it('renders switch control for CSP usage in Report Only CSP settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="csp"] [infer="csp-group-two"] foxy-internal-switch-control[infer="csp-enable-ro-csp"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csp.usage');
    expect(control).to.have.attribute('property', 'json');

    const json = getDefaultJSON();
    json.csp.usage = 'none';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal(false);

    control?.setValue(true);
    expect(JSON.parse(element.form.json!).csp.usage).to.equal('report');
    expect(control?.getValue()).to.equal(true);

    json.csp.usage = 'enforce';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal(false);

    control?.setValue(true);
    expect(JSON.parse(element.form.json!).csp.usage).to.equal('both');
    expect(control?.getValue()).to.equal(true);

    control?.setValue(false);
    expect(JSON.parse(element.form.json!).csp.usage).to.equal('enforce');
  });

  it('renders text control for CSP report URI in Report Only CSP settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    const json = getDefaultJSON();
    json.csp = { usage: 'report' };
    element.edit({ json: JSON.stringify(json) });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="csp"] [infer="csp-group-two"] foxy-internal-text-control[infer="csp-policy-report-reporting-endpoint"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csp.policy_report.reporting_endpoint');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders editable list control for CSP script sources in Report Only CSP settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    const json = getDefaultJSON();
    json.csp = { usage: 'report' };
    element.edit({ json: JSON.stringify(json) });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="csp"] [infer="csp-group-two"] foxy-internal-editable-list-control[infer="csp-policy-report-script-src"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'csp.policy_report.script_src');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('simple-value');
  });

  it('renders group for analytics settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="analytics-config"]'
    );

    expect(group).to.exist;
  });

  it('renders switch control for analytics usage in analytics settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config"] foxy-internal-switch-control[infer="analytics-config-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'analytics_config.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders group for google analytics settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="analytics-config-google-analytics"]'
    );

    expect(group).to.exist;
  });

  it('renders switch control for google analytics usage in google analytics settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config-google-analytics"] foxy-internal-switch-control[infer="analytics-config-google-analytics-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'analytics_config.google_analytics.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders text control for google analytics account ID in google analytics settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config-google-analytics"] foxy-internal-text-control[infer="analytics-config-google-analytics-account-id"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'analytics_config.google_analytics.account_id');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders switch control for including google analytics on site in google analytics settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config-google-analytics"] foxy-internal-switch-control[infer="analytics-config-google-analytics-include-on-site"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute(
      'json-path',
      'analytics_config.google_analytics.include_on_site'
    );
  });

  it('renders deprecation notice in google analytics settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const notice = element.renderRoot.querySelector(
      '[infer="analytics-config-google-analytics"] foxy-i18n[infer=""][key="deprecation_notice"]'
    );

    expect(notice).to.exist;
  });

  it('renders group for google tag settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="analytics-config-google-tag"]'
    );

    expect(group).to.exist;
  });

  it('renders switch control for google tag usage in google tag settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config-google-tag"] foxy-internal-switch-control[infer="analytics-config-google-tag-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'analytics_config.google_tag.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders text control for google tag account ID in google tag settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config-google-tag"] foxy-internal-text-control[infer="analytics-config-google-tag-account-id"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'analytics_config.google_tag.account_id');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders text control for google tag send to value in google tag settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector(
      '[infer="analytics-config-google-tag"] foxy-internal-text-control[infer="analytics-config-google-tag-send-to"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'analytics_config.google_tag.send_to');
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders usage notice in google tag settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const notice = element.renderRoot.querySelector(
      '[infer="analytics-config-google-tag"] foxy-i18n[infer=""][key="usage_notice"]'
    );

    expect(notice).to.exist;
  });

  it('renders group for debug settings', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const group = element.renderRoot.querySelector('foxy-internal-summary-control[infer="debug"]');

    expect(group).to.exist;
  });

  it('renders switch control for debug usage in debug settings group', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);

    const control = element.renderRoot.querySelector(
      '[infer="debug"] foxy-internal-switch-control[infer="debug-usage"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('false-alias', 'none');
    expect(control).to.have.attribute('true-alias', 'required');
    expect(control).to.have.attribute('json-path', 'debug.usage');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders source control for custom config', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSourceControl>(
      'foxy-internal-source-control[infer="custom-config"]'
    );

    expect(control).to.exist;
    expect(control?.getValue()).to.equal('');

    const json = getDefaultJSON();
    json.custom_config = { foo: 'bar' };
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal(JSON.stringify(json.custom_config, null, 2));

    json.custom_config = 'test';
    element.edit({ json: JSON.stringify(json) });
    expect(control?.getValue()).to.equal('test');

    control?.setValue(JSON.stringify({ baz: 'qux' }, null, 2));
    expect(JSON.parse(element.form.json!).custom_config).to.deep.equal({ baz: 'qux' });
  });

  it('renders source control for custom header markup', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSourceControl>(
      'foxy-internal-source-control[infer="custom-script-values-header"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'custom_script_values.header');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders source control for custom checkout fields markup', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSourceControl>(
      'foxy-internal-source-control[infer="custom-script-values-checkout-fields"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'custom_script_values.checkout_fields');
    expect(control).to.have.attribute('property', 'json');
  });

  it('renders source control for custom multiship checkout fields markup', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSourceControl>(
      'foxy-internal-source-control[infer="custom-script-values-multiship-checkout-fields"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('property', 'json');
    expect(control).to.have.attribute(
      'json-path',
      'custom_script_values.multiship_checkout_fields'
    );
  });

  it('renders source control for custom footer markup', async () => {
    const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
    const element = await fixture<Form>(layout);
    const control = element.renderRoot.querySelector<InternalSourceControl>(
      'foxy-internal-source-control[infer="custom-script-values-footer"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', JSON.stringify(getDefaultJSON()));
    expect(control).to.have.attribute('json-path', 'custom_script_values.footer');
    expect(control).to.have.attribute('property', 'json');
  });
});
