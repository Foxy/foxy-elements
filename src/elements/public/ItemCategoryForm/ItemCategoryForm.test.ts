import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { InternalAsyncResourceLinkListControl } from '../../internal/InternalAsyncResourceLinkListControl/InternalAsyncResourceLinkListControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import { ItemCategoryForm as Form } from './ItemCategoryForm';
import { InternalIntegerControl } from '../../internal/InternalIntegerControl/InternalIntegerControl';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';

describe('ItemCategoryForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-async-resource-link-list-control', () => {
    const element = customElements.get('foxy-internal-async-resource-link-list-control');
    expect(element).to.equal(InternalAsyncResourceLinkListControl);
  });

  it('imports and defines foxy-internal-async-combo-box-control', () => {
    const element = customElements.get('foxy-internal-async-combo-box-control');
    expect(element).to.equal(InternalAsyncComboBoxControl);
  });

  it('imports and defines foxy-internal-integer-control', () => {
    const element = customElements.get('foxy-internal-integer-control');
    expect(element).to.equal(InternalIntegerControl);
  });

  it('imports and defines foxy-internal-number-control', () => {
    const element = customElements.get('foxy-internal-number-control');
    expect(element).to.equal(InternalNumberControl);
  });

  it('imports and defines foxy-internal-select-control', () => {
    const element = customElements.get('foxy-internal-select-control');
    expect(element).to.equal(InternalSelectControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const element = customElements.get('foxy-internal-text-control');
    expect(element).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.equal(InternalForm);
  });

  it('imports and defines foxy-discount-builder', () => {
    const element = customElements.get('foxy-discount-builder');
    expect(element).to.equal(DiscountBuilder);
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.equal(NucleonElement);
  });

  it('imports and defines itself as foxy-item-category-form', () => {
    const element = customElements.get('foxy-item-category-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "item-category-form"', () => {
    expect(Form).to.have.property('defaultNS', 'item-category-form');
    expect(new Form()).to.have.property('ns', 'item-category-form');
  });

  it('has a reactive property "emailTemplates"', () => {
    expect(new Form()).to.have.property('emailTemplates', null);
    expect(Form).to.have.nested.property('properties.emailTemplates');
    expect(Form).to.not.have.nested.property('properties.emailTemplates.type');
    expect(Form).to.have.nested.property('properties.emailTemplates.attribute', 'email-templates');
  });

  it('has a reactive property "taxes"', () => {
    expect(new Form()).to.have.property('taxes', null);
    expect(Form).to.have.nested.property('properties.taxes');
    expect(Form).to.not.have.nested.property('properties.taxes.type');
    expect(Form).to.not.have.nested.property('properties.taxes.attribute');
  });

  it('produces the code:v8n_required error if code is empty', () => {
    const form = new Form();

    form.edit({ code: '' });
    expect(form.errors).to.include('code:v8n_required');

    form.edit({ code: 'Test' });
    expect(form.errors).to.not.include('code:v8n_required');
  });

  it('produces the code:v8n_too_long error if code is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ code: 'A'.repeat(51) });
    expect(form.errors).to.include('code:v8n_too_long');

    form.edit({ code: 'A'.repeat(50) });
    expect(form.errors).to.not.include('code:v8n_too_long');
  });

  it('produces the name:v8n_required error if name is empty', () => {
    const form = new Form();

    form.edit({ name: '' });
    expect(form.errors).to.include('name:v8n_required');

    form.edit({ name: 'Test' });
    expect(form.errors).to.not.include('name:v8n_required');
  });

  it('produces the name:v8n_too_long error if name is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ name: 'A'.repeat(51) });
    expect(form.errors).to.include('name:v8n_too_long');

    form.edit({ name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('name:v8n_too_long');
  });

  it('produces the item-delivery-type:v8n_required error if item delivery type is empty', () => {
    const form = new Form();
    expect(form.errors).to.include('item-delivery-type:v8n_required');

    form.edit({ item_delivery_type: 'downloaded' });
    expect(form.errors).to.not.include('item-delivery-type:v8n_required');
  });

  it('produces the max-downloads-per-customer:v8n_required error if item delivery type is "downloaded" and max downloads are not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('max-downloads-per-customer:v8n_required');

    form.edit({ item_delivery_type: 'flat_rate' });
    expect(form.errors).to.not.include('max-downloads-per-customer:v8n_required');

    form.edit({ item_delivery_type: 'downloaded' });
    expect(form.errors).to.include('max-downloads-per-customer:v8n_required');

    form.edit({ max_downloads_per_customer: 10 });
    expect(form.errors).to.not.include('max-downloads-per-customer:v8n_required');
  });

  it('produces the max-downloads-per-customer:v8n_negative error if max downloads is less than 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('max-downloads-per-customer:v8n_negative');

    form.edit({ max_downloads_per_customer: 10 });
    expect(form.errors).to.not.include('max-downloads-per-customer:v8n_negative');

    form.edit({ max_downloads_per_customer: -10 });
    expect(form.errors).to.include('max-downloads-per-customer:v8n_negative');
  });

  it('produces the max-downloads-time-period:v8n_required error if item delivery type is "downloaded" and max downloads are not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('max-downloads-time-period:v8n_required');

    form.edit({ item_delivery_type: 'flat_rate' });
    expect(form.errors).to.not.include('max-downloads-time-period:v8n_required');

    form.edit({ item_delivery_type: 'downloaded' });
    expect(form.errors).to.include('max-downloads-time-period:v8n_required');

    form.edit({ max_downloads_time_period: 10 });
    expect(form.errors).to.not.include('max-downloads-time-period:v8n_required');
  });

  it('produces the max-downloads-time-period:v8n_negative error if max downloads is less than 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('max-downloads-time-period:v8n_negative');

    form.edit({ max_downloads_time_period: 10 });
    expect(form.errors).to.not.include('max-downloads-time-period:v8n_negative');

    form.edit({ max_downloads_time_period: -10 });
    expect(form.errors).to.include('max-downloads-time-period:v8n_negative');
  });

  it('produces the customs-value:v8n_negative error if it is less than 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('customs-value:v8n_negative');

    form.edit({ customs_value: 10 });
    expect(form.errors).to.not.include('customs-value:v8n_negative');

    form.edit({ customs_value: -10 });
    expect(form.errors).to.include('customs-value:v8n_negative');
  });

  it('produces the default-weight:v8n_required error if item delivery type is "shipped" and default weight is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('default-weight:v8n_required');

    form.edit({ item_delivery_type: 'flat_rate' });
    expect(form.errors).to.not.include('default-weight:v8n_required');

    form.edit({ item_delivery_type: 'shipped' });
    expect(form.errors).to.include('default-weight:v8n_required');

    form.edit({ default_weight: 10 });
    expect(form.errors).to.not.include('default-weight:v8n_required');
  });

  it('produces the default-length-unit:v8n_required error if item delivery type is "shipped" and default length unit is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('default-length-unit:v8n_required');

    form.edit({ item_delivery_type: 'flat_rate' });
    expect(form.errors).to.not.include('default-length-unit:v8n_required');

    form.edit({ item_delivery_type: 'shipped' });
    expect(form.errors).to.include('default-length-unit:v8n_required');

    form.edit({ default_length_unit: 'CM' });
    expect(form.errors).to.not.include('default-length-unit:v8n_required');
  });

  it('produces the shipping-flat-rate:v8n_required error if item delivery type is "flat_rate" and rate is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('shipping-flat-rate:v8n_required');

    form.edit({ item_delivery_type: 'pickup' });
    expect(form.errors).to.not.include('shipping-flat-rate:v8n_required');

    form.edit({ item_delivery_type: 'flat_rate' });
    expect(form.errors).to.include('shipping-flat-rate:v8n_required');

    form.edit({ shipping_flat_rate: 123 });
    expect(form.errors).to.not.include('shipping-flat-rate:v8n_required');
  });

  it('produces the shipping-flat-rate:v8n_negative error if rate is less than 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('shipping-flat-rate:v8n_negative');

    form.edit({ shipping_flat_rate: 10 });
    expect(form.errors).to.not.include('shipping-flat-rate:v8n_negative');

    form.edit({ shipping_flat_rate: -10 });
    expect(form.errors).to.include('shipping-flat-rate:v8n_negative');
  });

  it('produces the shipping-flat-rate-type:v8n_required error if item delivery type is "flat_rate" and type is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('shipping-flat-rate-type:v8n_required');

    form.edit({ item_delivery_type: 'pickup' });
    expect(form.errors).to.not.include('shipping-flat-rate-type:v8n_required');

    form.edit({ item_delivery_type: 'flat_rate' });
    expect(form.errors).to.include('shipping-flat-rate-type:v8n_required');

    form.edit({ shipping_flat_rate_type: 'item_delivery_type' });
    expect(form.errors).to.not.include('shipping-flat-rate-type:v8n_required');
  });

  it('produces the handling-fee-type:v8n_required error if handling fee type is empty', () => {
    const form = new Form();
    expect(form.errors).to.include('handling-fee-type:v8n_required');

    form.edit({ handling_fee_type: 'flat_per_item' });
    expect(form.errors).to.not.include('handling-fee-type:v8n_required');
  });

  it('produces the handling-fee-minimum:v8n_required error if handling fee type is "flat_percent_with_minimum" and minimum is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('handling-fee-minimum:v8n_required');

    form.edit({ handling_fee_type: 'flat_percent' });
    expect(form.errors).to.not.include('handling-fee-minimum:v8n_required');

    form.edit({ handling_fee_type: 'flat_percent_with_minimum' });
    expect(form.errors).to.include('handling-fee-minimum:v8n_required');

    form.edit({ handling_fee_minimum: 10 });
    expect(form.errors).to.not.include('handling-fee-minimum:v8n_required');
  });

  it('produces the handling-fee-minimum:v8n_negative error if rate is less than 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('handling-fee-minimum:v8n_negative');

    form.edit({ handling_fee_minimum: 10 });
    expect(form.errors).to.not.include('handling-fee-minimum:v8n_negative');

    form.edit({ handling_fee_minimum: -10 });
    expect(form.errors).to.include('handling-fee-minimum:v8n_negative');
  });

  it('produces the handling-fee-percentage:v8n_required error if handling fee type is "flat_percent" and percentage is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_required');

    form.edit({ handling_fee_type: 'flat_per_order' });
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_required');

    form.edit({ handling_fee_type: 'flat_percent' });
    expect(form.errors).to.include('handling-fee-percentage:v8n_required');

    form.edit({ handling_fee_percentage: 10 });
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_required');
  });

  it('produces the handling-fee-percentage:v8n_required error if handling fee type is "flat_percent_with_minimum" and percentage is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_required');

    form.edit({ handling_fee_type: 'flat_per_order' });
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_required');

    form.edit({ handling_fee_type: 'flat_percent_with_minimum' });
    expect(form.errors).to.include('handling-fee-percentage:v8n_required');

    form.edit({ handling_fee_percentage: 10 });
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_required');
  });

  it('produces the handling-fee-percentage:v8n_negative error if value is less than 0', () => {
    const form = new Form();
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_negative');

    form.edit({ handling_fee_percentage: 10 });
    expect(form.errors).to.not.include('handling-fee-percentage:v8n_negative');

    form.edit({ handling_fee_percentage: -10 });
    expect(form.errors).to.include('handling-fee-percentage:v8n_negative');
  });

  it('produces the admin-email:v8n_required error if "send_admin_email" is true admin email is not specified', () => {
    const form = new Form();
    expect(form.errors).to.not.include('admin-email:v8n_required');

    form.edit({ send_admin_email: false });
    expect(form.errors).to.not.include('admin-email:v8n_required');

    form.edit({ send_admin_email: true });
    expect(form.errors).to.include('admin-email:v8n_required');

    form.edit({ admin_email: 'test@example.com' });
    expect(form.errors).to.not.include('admin-email:v8n_required');
  });

  it('renders a text control for category name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector('[infer="name"]');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for category code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector('[infer="code"]');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a select control for handling fee type', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector('[infer="handling-fee-type"]');

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_none', value: 'none' },
      { label: 'option_flat_per_order', value: 'flat_per_order' },
      { label: 'option_flat_per_item', value: 'flat_per_item' },
      { label: 'option_flat_percent', value: 'flat_percent' },
      { label: 'option_flat_percent_with_minimum', value: 'flat_percent_with_minimum' },
    ]);
  });

  it('renders a number control for handling fee if handling fee type is not "none"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ handling_fee_type: 'none' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee"]')).to.not.exist;

    element.edit({ handling_fee_type: 'flat_per_item' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a number control for handling fee percentage if handling fee type is "flat_percent"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ handling_fee_type: 'none' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee-percentage"]')).to.not.exist;

    element.edit({ handling_fee_type: 'flat_percent' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee-percentage"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a number control for handling fee percentage if handling fee type is "flat_percent_with_minimum"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ handling_fee_type: 'none' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee-percentage"]')).to.not.exist;

    element.edit({ handling_fee_type: 'flat_percent_with_minimum' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee-percentage"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a number control for handling fee minimum if handling fee type is "flat_percent_with_minimum"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ handling_fee_type: 'none' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee-minimum"]')).to.not.exist;

    element.edit({ handling_fee_type: 'flat_percent_with_minimum' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="handling-fee-minimum"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a select control for item delivery type', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector('[infer="item-delivery-type"]');

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_notshipped', value: 'notshipped' },
      { label: 'option_downloaded', value: 'downloaded' },
      { label: 'option_flat_rate', value: 'flat_rate' },
      { label: 'option_shipped', value: 'shipped' },
      { label: 'option_pickup', value: 'pickup' },
    ]);
  });

  it('renders an integer control for max downloads per customer if item delivery type is "downloaded"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const $ = element.renderRoot;
    element.edit({ item_delivery_type: 'notshipped' });
    await element.requestUpdate();
    expect($.querySelector('[infer="max-downloads-per-customer"]')).to.not.exist;

    element.edit({ item_delivery_type: 'downloaded' });
    await element.requestUpdate();
    expect($.querySelector('[infer="max-downloads-per-customer"]')).to.be.instanceOf(
      InternalIntegerControl
    );
  });

  it('renders an integer control for max downloads per time period if item delivery type is "downloaded"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const $ = element.renderRoot;
    element.edit({ item_delivery_type: 'notshipped' });
    await element.requestUpdate();
    expect($.querySelector('[infer="max-downloads-time-period"]')).to.not.exist;

    element.edit({ item_delivery_type: 'downloaded' });
    await element.requestUpdate();
    expect($.querySelector('[infer="max-downloads-time-period"]')).to.be.instanceOf(
      InternalIntegerControl
    );
  });

  it('renders a number control for shipping flat rate if item delivery type is "flat_rate"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="shipping-flat-rate"]')).to.not.exist;

    element.edit({ item_delivery_type: 'flat_rate' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="shipping-flat-rate"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a number control for customs value if item delivery type is "flat_rate"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="customs-value"]')).to.not.exist;

    element.edit({ item_delivery_type: 'flat_rate' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="customs-value"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a select control for shipping flat rate type if item delivery type is "flat_rate"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="shipping-flat-rate-type"]')).to.not.exist;

    element.edit({ item_delivery_type: 'flat_rate' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="shipping-flat-rate-type"]');

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_per_order', value: 'per_order' },
      { label: 'option_per_shipment', value: 'per_shipment' },
    ]);
  });

  it('renders an integer control for default weight if item delivery type is "shipped"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="default-weight"]')).to.not.exist;

    element.edit({ item_delivery_type: 'shipped' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="default-weight"]')).to.be.instanceOf(
      InternalIntegerControl
    );
  });

  it('renders a select control for default weight unit if item delivery type is "shipped"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="default-weight-unit"]')).to.not.exist;

    element.edit({ item_delivery_type: 'shipped' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="default-weight-unit"]');

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_lbs', value: 'LBS' },
      { label: 'option_kgs', value: 'KGS' },
    ]);
  });

  it('renders a select control for default length unit if item delivery type is "shipped"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="default-length-unit"]')).to.not.exist;

    element.edit({ item_delivery_type: 'shipped' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="default-length-unit"]');

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_in', value: 'IN' },
      { label: 'option_cm', value: 'CM' },
    ]);
  });

  it('renders a number control for customs value if item delivery type is "shipped"', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    element.edit({ item_delivery_type: 'pickup' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="customs-value"]')).to.not.exist;

    element.edit({ item_delivery_type: 'shipped' });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="customs-value"]')).to.be.instanceOf(
      InternalNumberControl
    );
  });

  it('renders a text control for discount name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector('[infer="discount-name"]');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a discount builder if discount name is not empty', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    expect(element.renderRoot.querySelector('[infer="discount-builder"]')).to.not.exist;

    element.edit({ discount_name: 'Foo' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="discount-builder"]'
    ) as DiscountBuilder;

    expect(control).to.be.instanceOf(DiscountBuilder);
    expect(control).to.have.deep.property('parsedValue', {
      name: 'Foo',
      type: 'quantity_amount',
      details: '',
    });

    control.parsedValue = { name: 'Bar', type: 'price_percentage', details: '1-2|3+4' };
    control.dispatchEvent(new CustomEvent('change'));

    expect(element).to.have.nested.property('form.discount_name', 'Bar');
    expect(element).to.have.nested.property('form.discount_type', 'price_percentage');
    expect(element).to.have.nested.property('form.discount_details', '1-2|3+4');
  });

  it('renders an async combo box control for admin email template uri', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form
        email-templates="https://demo.api/hapi/email_templates"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="admin-email-template-uri"]'
    ) as InternalAsyncComboBoxControl;

    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'description');
    expect(control).to.have.attribute('item-value-path', '_links.self.href');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/email_templates');

    expect(element).to.not.have.nested.property('form.send_admin_email');
    control.dispatchEvent(
      new CustomEvent('change', { detail: 'https://demo.api/hapi/email_templates/0' })
    );
    expect(element).to.have.nested.property('form.send_admin_email', true);

    control.dispatchEvent(new CustomEvent('change', { detail: '' }));
    expect(element).to.have.nested.property('form.send_admin_email', false);
  });

  it('renders a text control for admin email if "send_admin_email" is true', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-form>
    `);

    expect(element.renderRoot.querySelector('[infer="admin-email"]')).to.not.exist;

    element.edit({ send_admin_email: true });
    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="admin-email"]')).to.be.instanceOf(
      InternalTextControl
    );
  });

  it('renders an async combo box control for customer email template uri', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form
        email-templates="https://demo.api/hapi/email_templates"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="customer-email-template-uri"]'
    ) as InternalAsyncComboBoxControl;

    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'description');
    expect(control).to.have.attribute('item-value-path', '_links.self.href');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/email_templates');

    expect(element).to.not.have.nested.property('form.send_customer_email');
    control.dispatchEvent(
      new CustomEvent('change', { detail: 'https://demo.api/hapi/email_templates/0' })
    );
    expect(element).to.have.nested.property('form.send_customer_email', true);

    control.dispatchEvent(new CustomEvent('change', { detail: '' }));
    expect(element).to.have.nested.property('form.send_customer_email', false);
  });

  it('renders an async combo box control for gift recipient email template uri', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form
        email-templates="https://demo.api/hapi/email_templates"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-category-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="gift-recipient-email-template-uri"]'
    ) as InternalAsyncComboBoxControl;

    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'description');
    expect(control).to.have.attribute('item-value-path', '_links.self.href');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/email_templates');
  });

  it('renders a taxes control when resource is loaded', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-item-category-form
        taxes="https://demo.api/hapi/taxes"
        href="https://demo.api/hapi/item_categories/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-category-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="taxes"]');

    expect(control).to.be.instanceOf(InternalAsyncResourceLinkListControl);
    expect(control).to.have.attribute('foreign-key-for-uri', 'tax_uri');
    expect(control).to.have.attribute('foreign-key-for-id', 'tax_id');
    expect(control).to.have.attribute('own-key-for-uri', 'item_category_uri');
    expect(control).to.have.attribute('options-href', 'https://demo.api/hapi/taxes');
    expect(control).to.have.attribute(
      'links-href',
      'https://demo.api/hapi/tax_item_categories?item_category_id=0'
    );
    expect(control).to.have.attribute('embed-key', 'fx:tax_item_categories');
    expect(control).to.have.attribute('own-uri', 'https://demo.api/hapi/item_categories/0');
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-tax-card');
  });
});
