import type { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { TaxForm as Form } from './TaxForm';
import { createRouter } from '../../../server/index';
import { stub } from 'sinon';

async function waitForIdle(element: Form) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('TaxForm', () => {
  it('imports and defines dependencies', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
    expect(customElements.get('foxy-internal-select-control')).to.exist;
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
    expect(customElements.get('foxy-internal-number-control')).to.exist;
    expect(customElements.get('foxy-internal-text-control')).to.exist;
    expect(customElements.get('foxy-internal-form')).to.exist;
    expect(customElements.get('foxy-native-integration-card')).to.exist;
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines itself as foxy-tax-form', () => {
    expect(customElements.get('foxy-tax-form')).to.equal(Form);
  });

  it('has a default i18next namespace of "tax-form"', () => {
    expect(Form.defaultNS).to.equal('tax-form');
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.an.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a reactive property "nativeIntegrations"', () => {
    expect(new Form()).to.have.property('nativeIntegrations', null);
    expect(Form.properties).to.have.deep.property('nativeIntegrations', {
      attribute: 'native-integrations',
    });
  });

  it('has a reactive property "countries"', () => {
    expect(new Form()).to.have.property('countries', null);
    expect(Form.properties).to.have.deep.property('countries', {});
  });

  it('has a reactive property "regions"', () => {
    expect(new Form()).to.have.property('regions', null);
    expect(Form.properties).to.have.deep.property('regions', {});
  });

  it('produces "name:v8n_required" error when name is missing', () => {
    const form = new Form();
    expect(form.errors).to.include('name:v8n_required');
    form.edit({ name: 'Test' });
    expect(form.errors).to.not.include('name:v8n_required');
  });

  it('produces "name:v8n_too_long" error when name is too long', () => {
    const form = new Form();
    expect(form.errors).to.not.include('name:v8n_too_long');
    form.edit({ name: 'a'.repeat(31) });
    expect(form.errors).to.include('name:v8n_too_long');
  });

  it('produces "country:v8n_required" error when country is missing for country-level tax', () => {
    const form = new Form();
    expect(form.errors).to.not.include('country:v8n_required');
    form.edit({ type: 'country' });
    expect(form.errors).to.include('country:v8n_required');
    form.edit({ country: 'US' });
    expect(form.errors).to.not.include('country:v8n_required');
  });

  it('produces "country:v8n_required" error when country is missing for region-level tax', () => {
    const form = new Form();
    expect(form.errors).to.not.include('country:v8n_required');
    form.edit({ type: 'region' });
    expect(form.errors).to.include('country:v8n_required');
    form.edit({ country: 'US' });
    expect(form.errors).to.not.include('country:v8n_required');
  });

  it('produces "country:v8n_required" error when origin rates are enabled and country is missing', () => {
    const form = new Form();
    expect(form.errors).to.not.include('country:v8n_required');
    form.edit({ use_origin_rates: true });
    expect(form.errors).to.include('country:v8n_required');
    form.edit({ country: 'US' });
    expect(form.errors).to.not.include('country:v8n_required');
  });

  it('produces "region:v8n_required" error when region is missing', () => {
    const form = new Form();
    expect(form.errors).to.not.include('region:v8n_required');
    form.edit({ type: 'region' });
    expect(form.errors).to.include('region:v8n_required');
    form.edit({ region: 'CA' });
    expect(form.errors).to.not.include('region:v8n_required');
  });

  it('produces "region:v8n_too_long" error when region is too long', () => {
    const form = new Form();
    expect(form.errors).to.not.include('region:v8n_too_long');
    form.edit({ region: 'a'.repeat(21) });
    expect(form.errors).to.include('region:v8n_too_long');
  });

  it('produces "city:v8n_too_long" error when city is too long', () => {
    const form = new Form();
    expect(form.errors).to.not.include('city:v8n_too_long');
    form.edit({ city: 'a'.repeat(51) });
    expect(form.errors).to.include('city:v8n_too_long');
  });

  it('produces "city:v8n_required" error when city is missing for local tax', () => {
    const form = new Form();
    expect(form.errors).to.not.include('city:v8n_required');
    form.edit({ type: 'local' });
    expect(form.errors).to.include('city:v8n_required');
    form.edit({ city: 'San Francisco' });
    expect(form.errors).to.not.include('city:v8n_required');
  });

  it('produces "rate:v8n_invalid" error when rate is zero or less', () => {
    const form = new Form();
    expect(form.errors).to.not.include('rate:v8n_invalid');
    form.edit({ type: 'country' });
    form.edit({ rate: 0 });
    expect(form.errors).to.include('rate:v8n_invalid');
    form.edit({ rate: -1 });
    expect(form.errors).to.include('rate:v8n_invalid');
    form.edit({ rate: 1 });
    expect(form.errors).to.not.include('rate:v8n_invalid');
  });

  it('always makes native integrations list readonly', () => {
    const form = new Form();
    expect(form.readonlySelector.matches('native-integrations', true)).to.be.true;
  });

  it('conditionally hides native integrations list', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('native-integrations', true)).to.be.true;
    form.nativeIntegrations = 'https://demo.api/hapi/native_integrations';
    form.edit({ type: 'union', service_provider: 'avalara' });
    expect(form.hiddenSelector.matches('native-integrations', true)).to.be.false;
  });

  it('conditionally hides country select', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-three:country', true)).to.be.true;
    form.edit({ type: 'union', service_provider: 'avalara' });
    expect(form.hiddenSelector.matches('group-three:country', true)).to.be.false;
    form.edit({ type: 'country' });
    expect(form.hiddenSelector.matches('group-three:country', true)).to.be.false;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-three:country', true)).to.be.false;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-three:country', true)).to.be.false;
  });

  it('conditionally hides region input', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-three:region-input', true)).to.be.true;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-three:region-input', true)).to.be.false;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-three:region-input', true)).to.be.false;
  });

  it('conditionally hides region select', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-tax-form
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-form>
    `);

    await waitForIdle(form);

    expect(form.hiddenSelector.matches('group-three:region-select', true)).to.be.true;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-three:region-select', true)).to.be.false;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-three:region-select', true)).to.be.false;
  });

  it('conditionally hides city input', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-three:city', true)).to.be.true;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-three:city', true)).to.be.false;
  });

  it('conditionally hides service provider select', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.true;
    form.edit({ type: 'global', is_live: true });
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.true;
    form.edit({ type: 'union', is_live: true });
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.false;
    form.edit({ type: 'country', is_live: true });
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.false;
    form.edit({ type: 'region', is_live: true });
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.false;
    form.edit({ type: 'local', is_live: true });
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.false;
    form.edit({ type: 'custom_tax_endpoint' as Data['type'], is_live: true });
    expect(form.hiddenSelector.matches('group-one:service-provider', true)).to.be.true;
  });

  it('conditionally hides rate input', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.false;
    form.edit({ type: 'union' });
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.false;
    form.edit({ type: 'country' });
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.false;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.false;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.false;
    form.edit({ type: 'custom_tax_endpoint' as Data['type'] });
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.true;
    form.edit({ type: 'local', is_live: true });
    expect(form.hiddenSelector.matches('group-one:rate', true)).to.be.true;
  });

  it('conditionally hides Live Rates input', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.false;
    form.edit({ type: 'global' });
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.true;
    form.edit({ type: 'union' });
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.false;
    form.edit({ type: 'country' });
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.false;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.false;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.false;
    form.edit({ type: 'custom_tax_endpoint' as Data['type'] });
    expect(form.hiddenSelector.matches('group-one:is-live', true)).to.be.true;
  });

  it('conditionally hides apply to shipping switch', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-two:apply-to-shipping', true)).to.be.true;
    form.edit({ type: 'union' });
    expect(form.hiddenSelector.matches('group-two:apply-to-shipping', true)).to.be.false;
    form.edit({ type: 'country', is_live: true });
    expect(form.hiddenSelector.matches('group-two:apply-to-shipping', true)).to.be.true;
    form.edit({ type: 'region', is_live: true });
    expect(form.hiddenSelector.matches('group-two:apply-to-shipping', true)).to.be.true;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-two:apply-to-shipping', true)).to.be.false;
    form.edit({ type: 'custom_tax_endpoint' as Data['type'] });
    expect(form.hiddenSelector.matches('group-two:apply-to-shipping', true)).to.be.true;
  });

  it('conditionally hides use origin rates switch', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'union' });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'union', is_live: true });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.false;
    form.edit({ type: 'union', service_provider: 'avalara' });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'union', service_provider: 'taxjar' as Data['service_provider'] });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'country' });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
    form.edit({ type: 'custom_tax_endpoint' as Data['type'] });
    expect(form.hiddenSelector.matches('group-two:use-origin-rates', true)).to.be.true;
  });

  it('conditionally hides exempt all customer tax ids switch', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('group-two:exempt-all-customer-tax-ids', true)).to.be.true;
    form.edit({ type: 'union' });
    expect(form.hiddenSelector.matches('group-two:exempt-all-customer-tax-ids', true)).to.be.true;
    form.edit({ type: 'country' });
    expect(form.hiddenSelector.matches('group-two:exempt-all-customer-tax-ids', true)).to.be.false;
    form.edit({ type: 'region' });
    expect(form.hiddenSelector.matches('group-two:exempt-all-customer-tax-ids', true)).to.be.false;
    form.edit({ type: 'local' });
    expect(form.hiddenSelector.matches('group-two:exempt-all-customer-tax-ids', true)).to.be.false;
    form.edit({ type: 'custom_tax_endpoint' as Data['type'] });
    expect(form.hiddenSelector.matches('group-two:exempt-all-customer-tax-ids', true)).to.be.true;
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a text control for name in group one', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-one"] foxy-internal-text-control[infer="name"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a select control for type in group one', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-one"] foxy-internal-select-control[infer="type"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute(
      'options',
      JSON.stringify([
        { label: 'option_custom_tax_endpoint', value: 'custom_tax_endpoint' },
        { label: 'option_global', value: 'global' },
        { label: 'option_union', value: 'union' },
        { label: 'option_country', value: 'country' },
        { label: 'option_region', value: 'region' },
        { label: 'option_local', value: 'local' },
      ])
    );
  });

  it('resets some form values on type change', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-one"] foxy-internal-select-control[infer="type"]'
    );

    form.edit({
      type: 'global',
      country: 'US',
      region: 'TX',
      city: 'Test',
      service_provider: 'avalara',
      apply_to_shipping: true,
      use_origin_rates: true,
      exempt_all_customer_tax_ids: true,
      is_live: true,
      rate: 123,
    });

    control?.setValue('local');

    expect(form.form).to.deep.equal({
      type: 'local',
      country: '',
      region: '',
      city: '',
      service_provider: '',
      apply_to_shipping: false,
      use_origin_rates: false,
      exempt_all_customer_tax_ids: false,
      is_live: false,
      rate: 0,
    });
  });

  it('renders a select control for service provider in group one', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-one"] foxy-internal-select-control[infer="service-provider"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute(
      'options',
      JSON.stringify([
        { label: 'option_default', value: '' },
        { label: 'option_avalara', value: 'avalara' },
        { label: 'option_onesource', value: 'onesource' },
        { label: 'option_taxjar', value: 'taxjar' },
      ])
    );
  });

  it('conditionally hides some options for service provider', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-one"] foxy-internal-select-control[infer="service-provider"]'
    );

    form.edit({ type: 'union' });
    await form.requestUpdate();
    expect(control?.options).to.deep.equal([
      { label: 'option_default', value: '' },
      { label: 'option_avalara', value: 'avalara' },
      { label: 'option_onesource', value: 'onesource' },
      { label: 'option_taxjar', value: 'taxjar' },
    ]);

    form.edit({ type: 'country', country: 'AZ' });
    await form.requestUpdate();
    expect(control?.options).to.deep.equal([
      { label: 'option_avalara', value: 'avalara' },
      { label: 'option_onesource', value: 'onesource' },
    ]);
  });

  it('renders a number control for rate in group one', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-one"] foxy-internal-number-control[infer="rate"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('suffix', '%');
    expect(control).to.have.attribute('min', '0');
  });

  it('renders an async list control for native integrations', async () => {
    const form = await fixture<Form>(
      html`
        <foxy-tax-form native-integrations="https://demo.api/hapi/native_integrations?store_id=0">
        </foxy-tax-form>
      `
    );

    form.edit({ type: 'union', service_provider: 'avalara' });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="native-integrations"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('item', 'foxy-native-integration-card');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/native_integrations?store_id=0&provider=avalara'
    );
  });

  it('renders a switch control for apply to shipping in group two', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-two"] foxy-internal-switch-control[infer="apply-to-shipping"]'
    );

    expect(control).to.exist;
  });

  it('renders a switch control for use origin rates in group two', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-two"] foxy-internal-switch-control[infer="use-origin-rates"]'
    );

    expect(control).to.exist;
  });

  it('renders a switch control for exempt all customer tax ids in group two', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-two"] foxy-internal-switch-control[infer="exempt-all-customer-tax-ids"]'
    );

    expect(control).to.exist;
  });

  it('renders a select control for country in group three', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-tax-form
        countries="https://demo.api/hapi/property_helpers/3"
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-form>
    `);

    await waitForIdle(form);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-select-control[infer="country"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute(
      'options',
      JSON.stringify([
        { rawLabel: 'United Kingdom', value: 'GB' },
        { rawLabel: 'United States', value: 'US' },
        { rawLabel: 'United States Minor Outlying Islands', value: 'UM' },
      ])
    );
  });

  it('resets some form values on country change', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-tax-form
        countries="https://demo.api/hapi/property_helpers/3"
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-form>
    `);

    await waitForIdle(form);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-select-control[infer="country"]'
    );

    form.edit({ type: 'country', region: 'TX', city: 'Test' });
    control?.setValue('US');

    expect(form.form).to.deep.equal({
      type: 'country',
      country: 'US',
      region: '',
      city: '',
      apply_to_shipping: false,
    });
  });

  it('renders a select control for region in group three', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-tax-form
        countries="https://demo.api/hapi/property_helpers/3"
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-form>
    `);

    await waitForIdle(form);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-select-control[infer="region-select"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute(
      'options',
      JSON.stringify([
        { rawLabel: 'South Dakota', value: 'SD' },
        { rawLabel: 'Tennessee', value: 'TN' },
        { rawLabel: 'Texas', value: 'TX' },
      ])
    );
  });

  it('resets some form values on region change in region select', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-tax-form
        countries="https://demo.api/hapi/property_helpers/3"
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-form>
    `);

    await waitForIdle(form);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-select-control[infer="region-select"]'
    );

    form.edit({ type: 'region', city: 'Test' });
    control?.setValue('TX');
    expect(form.form).to.deep.equal({ type: 'region', region: 'TX', city: '' });
  });

  it('renders a text control for region input in group three', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-text-control[infer="region-input"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('resets some form values on region change in region input', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-tax-form
        countries="https://demo.api/hapi/property_helpers/3"
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-form>
    `);

    await waitForIdle(form);
    const control = form.renderRoot.querySelector<InternalSelectControl>(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-text-control[infer="region-input"]'
    );

    form.edit({ type: 'region', city: 'Test' });
    control?.setValue('TX');
    expect(form.form).to.deep.equal({ type: 'region', region: 'TX', city: '' });
  });

  it('renders a text control for city in group three', async () => {
    const form = await fixture<Form>(html`<foxy-tax-form></foxy-tax-form>`);
    const control = form.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="group-three"] foxy-internal-text-control[infer="city"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });
});
