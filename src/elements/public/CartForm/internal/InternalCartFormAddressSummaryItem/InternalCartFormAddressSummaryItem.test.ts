import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalCartFormAddressSummaryItem as Control } from './InternalCartFormAddressSummaryItem';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../../../server';
import { NucleonElement } from '../../../NucleonElement';
import { Data } from '../../types';
import { getTestData } from '../../../../../testgen/getTestData';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';
import { stub } from 'sinon';

async function waitForIdle(element: Control) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

type Customer = Resource<
  Rels.Customer,
  {
    zoom: ['default_billing_address', 'default_shipping_address', 'default_payment_method'];
  }
>;

class TestControl extends Control {
  static get properties() {
    return {
      ...super.properties,
      testCheckValidity: { attribute: false },
      testErrorMessage: { attribute: false },
      testValue: { attribute: false },
    };
  }

  testCheckValidity = () => true;

  testErrorMessage = '';

  testValue = '';

  nucleon = new NucleonElement();

  protected get _checkValidity() {
    return this.testCheckValidity;
  }

  protected get _errorMessage() {
    return this.testErrorMessage;
  }

  protected get _value() {
    return this.testValue;
  }

  protected set _value(newValue: string) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-cart-form-address-summary-item', TestControl);

describe('CartForm', () => {
  describe('InternalCartFormAddressSummaryItem', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines vaadin-button', () => {
      expect(customElements.get('vaadin-button')).to.exist;
    });

    it('imports and defines foxy-internal-editable-control', () => {
      expect(customElements.get('foxy-internal-editable-control')).to.exist;
    });

    it('imports and defines foxy-internal-select-control', () => {
      expect(customElements.get('foxy-internal-select-control')).to.exist;
    });

    it('imports and defines foxy-internal-text-control', () => {
      expect(customElements.get('foxy-internal-text-control')).to.exist;
    });

    it('imports and defines foxy-nucleon', () => {
      expect(customElements.get('foxy-nucleon')).to.exist;
    });

    it('defines itself as foxy-internal-cart-form-address-summary-item', () => {
      expect(customElements.get('foxy-internal-cart-form-address-summary-item')).to.exist;
    });

    it('extends foxy-internal-editable-control', () => {
      expect(new Control()).to.be.an.instanceOf(
        customElements.get('foxy-internal-editable-control')
      );
    });

    it('has a reactive property "customer"', () => {
      expect(Control).to.have.deep.nested.property('properties.customer', { type: Object });
      expect(new Control()).to.have.property('customer', null);
    });

    it('has a reactive property "countries"', () => {
      expect(Control).to.have.deep.nested.property('properties.countries', {});
      expect(new Control()).to.have.property('countries', null);
    });

    it('has a reactive property "regions"', () => {
      expect(Control).to.have.deep.nested.property('properties.regions', {});
      expect(new Control()).to.have.property('regions', null);
    });

    it('has a reactive property "type"', () => {
      expect(Control).to.have.deep.nested.property('properties.type', {});
      expect(new Control()).to.have.property('type', null);
    });

    (['billing', 'shipping'] as const).forEach(addressType => {
      it(`disables ${addressType} region selector while regions are loading`, async () => {
        const router = createRouter();
        const nucleon = await fixture<NucleonElement<Data>>(html`
          <foxy-nucleon
            type=${addressType}
            href="https://demo.api/hapi/carts/0?zoom=discounts"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
            <foxy-internal-cart-form-address-summary-item
              countries="https://demo.api/hapi/property_helpers/3"
              regions="https://demo.api/virtual/stall"
              infer="${addressType}-address"
            >
            </foxy-internal-cart-form-address-summary-item>
          </foxy-nucleon>
        `);

        await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });
        const control = nucleon.firstElementChild as Control;

        nucleon.edit({ [`${addressType}_country`]: 'US' });
        control.inferProperties();
        await control.requestUpdate();

        const disabled = control.disabledSelector;
        expect(disabled.matches('address:state', true)).to.be.true;
      });
    });

    it('renders label in summary item layout', async () => {
      const control = await fixture<TestControl>(html`
        <test-internal-cart-form-address-summary-item></test-internal-cart-form-address-summary-item>
      `);

      expect(control.renderRoot).to.include.text('label');

      control.label = 'Foo bar';
      await control.requestUpdate();

      expect(control.renderRoot).to.not.include.text('label');
      expect(control.renderRoot).to.include.text('Foo bar');
    });

    it('renders helper text in summary item layout', async () => {
      const control = await fixture<TestControl>(html`
        <test-internal-cart-form-address-summary-item></test-internal-cart-form-address-summary-item>
      `);

      expect(control.renderRoot).to.include.text('helper_text');

      control.helperText = 'Test helper text';
      await control.requestUpdate();

      expect(control.renderRoot).to.not.include.text('helper_text');
      expect(control.renderRoot).to.include.text('Test helper text');
    });

    it('renders error text in summary item layout if available', async () => {
      const control = await fixture<TestControl>(html`
        <test-internal-cart-form-address-summary-item></test-internal-cart-form-address-summary-item>
      `);

      expect(control.renderRoot).to.not.include.text('Test error message');

      control.testErrorMessage = 'Test error message';
      await control.requestUpdate();

      expect(control.renderRoot).to.include.text('Test error message');
    });

    it('renders Edit button that opens the Edit dialog', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const button = control.renderRoot.querySelector<HTMLButtonElement>(
        'button[aria-label="edit"]'
      );

      expect(button).to.exist;
      button?.click();

      const dialog = control.renderRoot.querySelector('dialog');
      expect(dialog).to.have.attribute('open');
    });

    it('disables Edit button when control is disabled or readonly', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const button = control.renderRoot.querySelector<HTMLButtonElement>(
        'button[aria-label="edit"]'
      );

      expect(button).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');

      control.disabled = false;
      control.readonly = true;
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');

      control.readonly = true;
      control.disabled = true;
      await control.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });

    (['billing', 'shipping'] as const).forEach(addressType => {
      it(`renders ${addressType} address with overrides in Edit button`, async () => {
        const router = createRouter();
        const customer = await getTestData<Customer>(
          './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
        );

        const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];

        defaultAddress.first_name = 'John';
        defaultAddress.last_name = 'Doe';
        defaultAddress.company = 'ACME';
        defaultAddress.phone = '123456789';
        defaultAddress.address1 = '123 Main St';
        defaultAddress.address2 = 'Apt 1';
        defaultAddress.country = 'US';
        defaultAddress.region = 'CA';
        defaultAddress.city = 'San Francisco';
        defaultAddress.postal_code = '94105';

        const nucleon = await fixture<NucleonElement<Data>>(html`
          <foxy-nucleon
            type=${addressType}
            href="https://demo.api/hapi/carts/0?zoom=discounts"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
            >
            <foxy-internal-cart-form-address-summary-item
              countries="https://demo.api/hapi/property_helpers/3"
              regions="https://demo.api/hapi/property_helpers/4"
              infer="${addressType}-address"
              type=${addressType}
              .customer=${customer}
            >
            </foxy-internal-cart-form-address-summary-item>
          </foxy-nucleon>
        `);

        await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

        nucleon.edit({
          use_customer_shipping_address: true,
          [`${addressType}_first_name`]: 'John',
          [`${addressType}_last_name`]: '',
          [`${addressType}_company`]: null,
          [`${addressType}_phone`]: '0987654321',
          [`${addressType}_address1`]: '',
          [`${addressType}_address2`]: null,
          [`${addressType}_country`]: 'GB',
          [`${addressType}_state`]: '',
          [`${addressType}_city`]: null,
          [`${addressType}_postal_code`]: '00383',
        });

        const control = nucleon.firstElementChild as Control;
        control.inferProperties();
        await control.requestUpdate();

        const editBtn = control.renderRoot.querySelector('button[aria-label="edit"]');
        const editBtnText = editBtn?.textContent?.replace(/\s+/g, ' ').trim();
        expect(editBtnText).to.equal('John -- ACME 0987654321 -- Apt 1 San Francisco -- 00383 GB');
      });
    });

    it('renders dialog header with the same key as label', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const label = control.renderRoot.querySelector('dialog h2 foxy-i18n[key="label"]');
      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
    });

    it('renders summary control for name fields in dialog', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const dialog = control.renderRoot.querySelector('dialog');
      const name = dialog?.querySelector('foxy-internal-summary-control[infer="name"]');
      expect(name).to.exist;
    });

    it('renders summary control for extra fields in dialog', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const dialog = control.renderRoot.querySelector('dialog');
      const extra = dialog?.querySelector('foxy-internal-summary-control[infer="extra"]');
      expect(extra).to.exist;
    });

    it('renders summary control for address fields in dialog', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const dialog = control.renderRoot.querySelector('dialog');
      const address = dialog?.querySelector('foxy-internal-summary-control[infer="address"]');
      expect(address).to.exist;
    });

    (['billing', 'shipping'] as const).forEach(addressType => {
      (['first_name', 'last_name'] as const).forEach(property => {
        it(`renders text control for ${addressType} ${property} in dialog`, async () => {
          const router = createRouter();
          const customer = await getTestData<Customer>(
            './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
          );

          const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];
          defaultAddress[property] = 'foo';

          const nucleon = await fixture<NucleonElement<Data>>(html`
            <foxy-nucleon
              type=${addressType}
              href="https://demo.api/hapi/carts/0?zoom=discounts"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
              >
              <foxy-internal-cart-form-address-summary-item
                countries="https://demo.api/hapi/property_helpers/3"
                regions="https://demo.api/hapi/property_helpers/4"
                infer="${addressType}-address"
                type=${addressType}
                .customer=${customer}
              >
              </foxy-internal-cart-form-address-summary-item>
            </foxy-nucleon>
          `);

          await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

          nucleon.edit({
            use_customer_shipping_address: true,
            [`${addressType}_${property}`]: 'foo',
          });

          const control = nucleon.firstElementChild as Control;
          control.inferProperties();
          await control.requestUpdate();

          const dialog = control.renderRoot.querySelector('dialog');
          const field = dialog?.querySelector(
            `[infer="name"] foxy-internal-text-control[infer="${property.replace(/_/g, '-')}"]`
          );

          expect(field).to.exist;
          expect(field).to.have.attribute('layout', 'summary-item');
          expect(field).to.have.attribute('property', `${addressType}_${property}`);
          expect(field).to.have.attribute('placeholder', 'empty_modified_placeholder');

          field?.dispatchEvent(new CustomEvent('clear'));
          control.inferProperties();
          await control.requestUpdate();
          expect(nucleon).to.have.nested.property(`form.${addressType}_${property}`, null);
          expect(field).to.have.attribute('placeholder', 'foo');

          customer._embedded[`fx:default_${addressType}_address` as const][property] = '';
          await control.requestUpdate();
          expect(field).to.not.have.attribute('placeholder');
        });
      });

      (['company', 'phone'] as const).forEach(property => {
        it(`renders text control for ${addressType} ${property} in dialog`, async () => {
          const router = createRouter();
          const customer = await getTestData<Customer>(
            './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
          );

          const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];
          defaultAddress[property] = 'foo';

          const nucleon = await fixture<NucleonElement<Data>>(html`
            <foxy-nucleon
              type=${addressType}
              href="https://demo.api/hapi/carts/0?zoom=discounts"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
              >
              <foxy-internal-cart-form-address-summary-item
                countries="https://demo.api/hapi/property_helpers/3"
                regions="https://demo.api/hapi/property_helpers/4"
                infer="${addressType}-address"
                type=${addressType}
                .customer=${customer}
              >
              </foxy-internal-cart-form-address-summary-item>
            </foxy-nucleon>
          `);

          await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

          nucleon.edit({
            use_customer_shipping_address: true,
            [`${addressType}_${property}`]: 'foo',
          });

          const control = nucleon.firstElementChild as Control;
          control.inferProperties();
          await control.requestUpdate();

          const dialog = control.renderRoot.querySelector('dialog');
          const field = dialog?.querySelector(
            `[infer="extra"] foxy-internal-text-control[infer="${property.replace(/_/g, '-')}"]`
          );

          expect(field).to.exist;
          expect(field).to.have.attribute('layout', 'summary-item');
          expect(field).to.have.attribute('property', `${addressType}_${property}`);
          expect(field).to.have.attribute('placeholder', 'empty_modified_placeholder');

          field?.dispatchEvent(new CustomEvent('clear'));
          control.inferProperties();
          await control.requestUpdate();
          expect(nucleon).to.have.nested.property(`form.${addressType}_${property}`, null);
          expect(field).to.have.attribute('placeholder', 'foo');

          customer._embedded[`fx:default_${addressType}_address` as const][property] = '';
          await control.requestUpdate();
          expect(field).to.not.have.attribute('placeholder');
        });
      });

      (
        [
          { property: 'address1', infer: 'address-one' },
          { property: 'address2', infer: 'address-two' },
          { property: 'city', infer: 'city' },
          { property: 'postal_code', infer: 'postal-code' },
        ] as const
      ).forEach(({ property, infer }) => {
        it(`renders text control for ${addressType} ${property} in dialog`, async () => {
          const router = createRouter();
          const customer = await getTestData<Customer>(
            './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
          );

          const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];
          defaultAddress[property] = 'foo';

          const nucleon = await fixture<NucleonElement<Data>>(html`
            <foxy-nucleon
              type=${addressType}
              href="https://demo.api/hapi/carts/0?zoom=discounts"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
              >
              <foxy-internal-cart-form-address-summary-item
                countries="https://demo.api/hapi/property_helpers/3"
                regions="https://demo.api/hapi/property_helpers/4"
                infer="${addressType}-address"
                type=${addressType}
                .customer=${customer}
              >
              </foxy-internal-cart-form-address-summary-item>
            </foxy-nucleon>
          `);

          await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

          nucleon.edit({
            use_customer_shipping_address: true,
            [`${addressType}_${property}`]: 'foo',
          });

          const control = nucleon.firstElementChild as Control;
          control.inferProperties();
          await control.requestUpdate();

          const dialog = control.renderRoot.querySelector('dialog');
          const field = dialog?.querySelector(
            `[infer="address"] foxy-internal-text-control[infer="${infer}"]`
          );

          expect(field).to.exist;
          expect(field).to.have.attribute('layout', 'summary-item');
          expect(field).to.have.attribute('property', `${addressType}_${property}`);
          expect(field).to.have.attribute('placeholder', 'empty_modified_placeholder');

          field?.dispatchEvent(new CustomEvent('clear'));
          control.inferProperties();
          await control.requestUpdate();
          expect(nucleon).to.have.nested.property(`form.${addressType}_${property}`, null);
          expect(field).to.have.attribute('placeholder', 'foo');

          customer._embedded[`fx:default_${addressType}_address` as const][property] = '';
          await control.requestUpdate();
          expect(field).to.not.have.attribute('placeholder');
        });
      });

      it(`renders select control for ${addressType} country in dialog`, async () => {
        const router = createRouter();
        const customer = await getTestData<Customer>(
          './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
        );

        const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];
        defaultAddress.country = 'US';

        const nucleon = await fixture<NucleonElement<Data>>(html`
          <foxy-nucleon
            type=${addressType}
            href="https://demo.api/hapi/carts/0?zoom=discounts"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
            >
            <foxy-internal-cart-form-address-summary-item
              countries="https://demo.api/hapi/property_helpers/3"
              regions="https://demo.api/hapi/property_helpers/4"
              infer="${addressType}-address"
              type=${addressType}
              .customer=${customer}
            >
            </foxy-internal-cart-form-address-summary-item>
          </foxy-nucleon>
        `);

        await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

        nucleon.edit({
          use_customer_shipping_address: true,
          [`${addressType}_country`]: 'GB',
        });

        const control = nucleon.firstElementChild as Control;
        control.inferProperties();
        await control.requestUpdate();
        await waitForIdle(control);

        const dialog = control.renderRoot.querySelector('dialog');
        const field = dialog?.querySelector(
          `[infer="address"] foxy-internal-select-control[infer="country"]`
        );

        expect(field).to.exist;
        expect(field).to.have.attribute('layout', 'summary-item');
        expect(field).to.have.attribute('property', `${addressType}_country`);
        expect(field).to.have.attribute('placeholder', 'empty_modified_placeholder');

        const countries = await getTestData<Resource<Rels.Countries>>('./hapi/property_helpers/3');
        const options = Object.values(countries.values).map(v => ({
          rawLabel: v.default,
          value: v.cc2,
        }));

        expect(field).to.have.deep.property('options', options);

        nucleon.edit({ [`${addressType}_country`]: null });
        control.inferProperties();
        await control.requestUpdate();
        expect(nucleon).to.have.nested.property(`form.${addressType}_country`, null);
        expect(field).to.have.attribute('placeholder', 'US');

        customer._embedded[`fx:default_${addressType}_address` as const].country = '';
        await control.requestUpdate();
        expect(field).to.not.have.attribute('placeholder');
      });

      it(`renders text control for ${addressType} state in dialog if selected country has no regions on file`, async () => {
        const router = createRouter();
        const customer = await getTestData<Customer>(
          './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
        );

        const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];
        defaultAddress.country = 'AR';
        defaultAddress.region = 'CABA';

        const nucleon = await fixture<NucleonElement<Data>>(html`
          <foxy-nucleon
            type=${addressType}
            href="https://demo.api/hapi/carts/0?zoom=discounts"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
            >
            <foxy-internal-cart-form-address-summary-item
              countries="https://demo.api/hapi/property_helpers/3"
              regions="https://demo.api/virtual/empty"
              infer="${addressType}-address"
              type=${addressType}
              .customer=${customer}
            >
            </foxy-internal-cart-form-address-summary-item>
          </foxy-nucleon>
        `);

        await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

        nucleon.edit({
          use_customer_shipping_address: true,
          [`${addressType}_country`]: 'AR',
          [`${addressType}_state`]: 'CABA',
        });

        const control = nucleon.firstElementChild as Control;
        control.inferProperties();
        await control.requestUpdate();

        const dialog = control.renderRoot.querySelector('dialog');
        const field = dialog?.querySelector(
          `[infer="address"] foxy-internal-text-control[infer="state"]`
        );

        expect(field).to.exist;
        expect(field).to.have.attribute('layout', 'summary-item');
        expect(field).to.have.attribute('property', `${addressType}_state`);
        expect(field).to.have.attribute('placeholder', 'empty_modified_placeholder');

        field?.dispatchEvent(new CustomEvent('clear'));
        control.inferProperties();
        await control.requestUpdate();
        expect(nucleon).to.have.nested.property(`form.${addressType}_state`, null);
        expect(field).to.have.attribute('placeholder', 'CABA');

        customer._embedded[`fx:default_${addressType}_address` as const].region = '';
        await control.requestUpdate();
        expect(field).to.not.have.attribute('placeholder');
      });

      it(`renders select control for ${addressType} state in dialog if selected country has regions on file`, async () => {
        const router = createRouter();
        const customer = await getTestData<Customer>(
          './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
        );

        const defaultAddress = customer._embedded[`fx:default_${addressType}_address` as const];
        defaultAddress.country = 'AR';
        defaultAddress.region = 'CABA';

        const nucleon = await fixture<NucleonElement<Data>>(html`
          <foxy-nucleon
            type=${addressType}
            href="https://demo.api/hapi/carts/0?zoom=discounts"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
            >
            <foxy-internal-cart-form-address-summary-item
              countries="https://demo.api/hapi/property_helpers/3"
              regions="https://demo.api/hapi/property_helpers/4"
              infer="${addressType}-address"
              type=${addressType}
              .customer=${customer}
            >
            </foxy-internal-cart-form-address-summary-item>
          </foxy-nucleon>
        `);

        await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

        nucleon.edit({
          use_customer_shipping_address: true,
          [`${addressType}_country`]: 'AR',
          [`${addressType}_state`]: 'CABA',
        });

        const control = nucleon.firstElementChild as Control;
        control.inferProperties();
        await control.requestUpdate();
        await waitForIdle(control);

        const dialog = control.renderRoot.querySelector('dialog');
        const field = dialog?.querySelector(
          `[infer="address"] foxy-internal-select-control[infer="state"]`
        );

        expect(field).to.exist;
        expect(field).to.have.attribute('layout', 'summary-item');
        expect(field).to.have.attribute('property', `${addressType}_state`);
        expect(field).to.have.attribute('placeholder', 'empty_modified_placeholder');

        const regions = await getTestData<Resource<Rels.Regions>>('./hapi/property_helpers/4');
        const options = Object.values(regions.values).map(v => ({
          rawLabel: v.default,
          value: v.code,
        }));

        expect(field).to.have.deep.property('options', options);

        nucleon.edit({ [`${addressType}_state`]: null });
        control.inferProperties();
        await control.requestUpdate();
        expect(nucleon).to.have.nested.property(`form.${addressType}_state`, null);
        expect(field).to.have.attribute('placeholder', 'CABA');

        customer._embedded[`fx:default_${addressType}_address` as const].region = '';
        await control.requestUpdate();
        expect(field).to.not.have.attribute('placeholder');
      });

      it(`renders a button in dialog that resets all overrides for ${addressType} address`, async () => {
        const router = createRouter();
        const customer = await getTestData<Customer>(
          './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
        );

        const nucleon = await fixture<NucleonElement<Data>>(html`
          <foxy-nucleon
            type=${addressType}
            href="https://demo.api/hapi/carts/0?zoom=discounts"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
            >
            <foxy-internal-cart-form-address-summary-item
              countries="https://demo.api/hapi/property_helpers/3"
              regions="https://demo.api/hapi/property_helpers/4"
              infer="${addressType}-address"
              type=${addressType}
              .customer=${customer}
            >
            </foxy-internal-cart-form-address-summary-item>
          </foxy-nucleon>
        `);

        await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

        nucleon.edit({
          use_customer_shipping_address: true,
          [`${addressType}_first_name`]: 'John',
          [`${addressType}_last_name`]: 'Smith',
          [`${addressType}_company`]: 'ACME',
          [`${addressType}_phone`]: '0987654321',
          [`${addressType}_address1`]: '123 Main St',
          [`${addressType}_address2`]: 'Apt 1',
          [`${addressType}_country`]: 'US',
          [`${addressType}_state`]: 'CA',
          [`${addressType}_city`]: 'San Francisco',
          [`${addressType}_postal_code`]: '00383',
        });

        const control = nucleon.firstElementChild as Control;
        control.inferProperties();
        await control.requestUpdate();

        const dialog = control.renderRoot.querySelector('dialog');
        const resetLabel = dialog?.querySelector('foxy-i18n[infer=""][key="reset"]');
        const resetBtn = resetLabel?.closest('vaadin-button');

        expect(resetBtn).to.exist;
        resetBtn?.click();

        expect(nucleon).to.have.nested.property(`form.${addressType}_first_name`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_last_name`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_company`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_phone`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_address1`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_address2`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_country`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_state`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_city`, null);
        expect(nucleon).to.have.nested.property(`form.${addressType}_postal_code`, null);
      });
    });

    it('disables Reset Overrides button in dialog when control is disabled', async () => {
      const router = createRouter();
      const customer = await getTestData<Customer>(
        './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
      );

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/carts/0?zoom=discounts"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          >
          <foxy-internal-cart-form-address-summary-item
            countries="https://demo.api/hapi/property_helpers/3"
            regions="https://demo.api/hapi/property_helpers/4"
            .customer=${customer}
          >
          </foxy-internal-cart-form-address-summary-item>
        </foxy-nucleon>
      `);

      await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const dialog = control.renderRoot.querySelector('dialog');
      const resetLabel = dialog?.querySelector('foxy-i18n[infer=""][key="reset"]');
      const resetBtn = resetLabel?.closest('vaadin-button');
      expect(resetBtn).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(resetBtn).to.have.attribute('disabled');
    });

    it('hides Reset Overrides button in dialog when control is readonly', async () => {
      const router = createRouter();
      const customer = await getTestData<Customer>(
        './hapi/customers/0?zoom=default_billing_address,default_shipping_address,default_payment_method'
      );

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/carts/0?zoom=discounts"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          >
          <foxy-internal-cart-form-address-summary-item
            countries="https://demo.api/hapi/property_helpers/3"
            regions="https://demo.api/hapi/property_helpers/4"
            .customer=${customer}
          >
          </foxy-internal-cart-form-address-summary-item>
        </foxy-nucleon>
      `);

      await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const dialog = control.renderRoot.querySelector('dialog');
      const resetLabel = dialog?.querySelector('foxy-i18n[infer=""][key="reset"]');
      const resetBtn = resetLabel?.closest('vaadin-button');
      expect(resetBtn).to.not.have.attribute('hidden');

      control.readonly = true;
      await control.requestUpdate();
      expect(resetBtn).to.have.attribute('hidden');
    });

    it('renders helper text in dialog', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const dialog = control.renderRoot.querySelector('dialog');
      const helper = dialog?.querySelector('foxy-i18n[key="form_helper_text"]');
      expect(helper).to.exist;
      expect(helper).to.have.attribute('infer', '');
    });

    it('renders Done button in dialog', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const dialog = control.renderRoot.querySelector('dialog');
      const doneLabel = dialog?.querySelector<HTMLDialogElement>('foxy-i18n[infer=""][key="done"]');
      const doneBtn = doneLabel?.closest('vaadin-button');
      expect(doneBtn).to.exist;

      const closeMethod = stub(dialog!, 'close');
      doneBtn?.click();
      expect(closeMethod).to.have.been.called;
    });

    it('disables Done button in dialog when control is disabled', async () => {
      const control = await fixture<TestControl>(html`
        <foxy-internal-cart-form-address-summary-item></foxy-internal-cart-form-address-summary-item>
      `);

      const dialog = control.renderRoot.querySelector('dialog');
      const doneLabel = dialog?.querySelector<HTMLDialogElement>('foxy-i18n[infer=""][key="done"]');
      const doneBtn = doneLabel?.closest('vaadin-button');
      expect(doneBtn).to.not.have.attribute('disabled');

      control.disabled = true;
      await control.requestUpdate();
      expect(doneBtn).to.have.attribute('disabled');
    });
  });
});
