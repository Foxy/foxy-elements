import type { TabsElement } from '@vaadin/vaadin-tabs';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalI18nEditorEntry } from './internal/InternalI18nEditorEntry/InternalI18nEditorEntry';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { I18nEditor } from './I18nEditor';
import { getByTag } from '../../../testgen/getByTag';
import { Spinner } from '../Spinner/Spinner';
import { I18n } from '../I18n/I18n';

describe('I18nEditor', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-tabs', () => {
    const element = customElements.get('vaadin-tabs');
    expect(element).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.equal(NucleonElement);
  });

  it('imports and defines foxy-spinner', () => {
    const element = customElements.get('foxy-spinner');
    expect(element).to.equal(Spinner);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines foxy-internal-i18n-editor-entry', () => {
    const element = customElements.get('foxy-internal-i18n-editor-entry');
    expect(element).to.equal(InternalI18nEditorEntry);
  });

  it('imports and defines itself as foxy-i18n-editor', () => {
    const element = customElements.get('foxy-i18n-editor');
    expect(element).to.equal(I18nEditor);
  });

  it('extends NucleonElement', () => {
    expect(new I18nEditor()).to.be.instanceOf(NucleonElement);
  });

  it('has a default i18n namespace "i18n-editor"', () => {
    expect(I18nEditor).to.have.property('defaultNS', 'i18n-editor');
    expect(new I18nEditor()).to.have.property('ns', 'i18n-editor');
  });

  it('has a reactive public property "languageOverrides"', () => {
    expect(new I18nEditor()).to.have.property('languageOverrides', null);
    expect(I18nEditor).to.have.nested.property('properties.languageOverrides');
    expect(I18nEditor).to.not.have.nested.property('properties.languageOverrides.type');
    expect(I18nEditor).to.have.nested.property(
      'properties.languageOverrides.attribute',
      'language-overrides'
    );
  });

  it('has a reactive public property "selectedLanguage"', () => {
    expect(new I18nEditor()).to.have.property('selectedLanguage', null);
    expect(I18nEditor).to.have.nested.property('properties.selectedLanguage');
    expect(I18nEditor).to.not.have.nested.property('properties.selectedLanguage.type');
    expect(I18nEditor).to.have.nested.property(
      'properties.selectedLanguage.attribute',
      'selected-language'
    );
  });

  it('renders a tab button for each group of language strings', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/10', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            english: {
              cart_add_coupon: 'Add Coupon',
              cart_add_coupon_and_gift_card: 'Add Coupon or Gift Card',
              checkout_ach_account_number: 'Account number',
              gateways: {
                cybersource: {},
                paypal_plus: { reference_number: 'Reference Number' },
              },
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<I18nEditor>(html`
      <foxy-i18n-editor
        language-overrides="https://demo.api/hapi/language_overrides"
        selected-language="english"
        href="https://demo.api/hapi/property_helpers/10"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-i18n-editor>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const tabsContainer = (await getByTag(element, 'vaadin-tabs')) as HTMLElement;
    const tabs = tabsContainer.children;

    expect(tabs).to.have.length(3);
    expect(tabs[0]).to.have.text('cart');
    expect(tabs[1]).to.have.text('checkout');
    expect(tabs[2]).to.have.text('paypal plus');
  });

  it('renders a list of entries for the selected group of language strings (default: 0)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/10', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            english: {
              cart_add_coupon: 'Add Coupon',
              cart_add_coupon_and_gift_card: 'Add Coupon or Gift Card',
              checkout_ach_account_number: 'Account number',
              gateways: {
                cybersource: {},
                paypal_plus: { reference_number: 'Reference Number' },
              },
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<I18nEditor>(html`
      <foxy-i18n-editor
        language-overrides="https://demo.api/hapi/language_overrides"
        selected-language="english"
        href="https://demo.api/hapi/property_helpers/10"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-i18n-editor>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const entries = element.renderRoot.querySelectorAll('foxy-internal-i18n-editor-entry');

    expect(entries).to.have.length(2);

    expect(entries[0]).to.have.attribute('default-value', 'Add Coupon');
    expect(entries[0]).to.not.have.attribute('gateway');
    expect(entries[0]).to.have.attribute('parent', 'https://demo.api/hapi/language_overrides');
    expect(entries[0]).to.have.attribute('code', 'cart_add_coupon');
    expect(entries[0]).to.have.attribute('infer', '');

    expect(entries[1]).to.have.attribute('default-value', 'Add Coupon or Gift Card');
    expect(entries[1]).to.not.have.attribute('gateway');
    expect(entries[1]).to.have.attribute('parent', 'https://demo.api/hapi/language_overrides');
    expect(entries[1]).to.have.attribute('code', 'cart_add_coupon_and_gift_card');
    expect(entries[1]).to.have.attribute('infer', '');
  });

  it('renders a list of entries for the selected group of language strings (custom: 1)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/10', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            english: {
              cart_add_coupon: 'Add Coupon',
              cart_add_coupon_and_gift_card: 'Add Coupon or Gift Card',
              checkout_ach_account_number: 'Account number',
              gateways: {
                cybersource: {},
                paypal_plus: { reference_number: 'Reference Number' },
              },
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<I18nEditor>(html`
      <foxy-i18n-editor
        language-overrides="https://demo.api/hapi/language_overrides"
        selected-language="english"
        href="https://demo.api/hapi/property_helpers/10"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-i18n-editor>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const tabsContainer = (await getByTag(element, 'vaadin-tabs')) as TabsElement;
    tabsContainer.selected = 1;
    tabsContainer.dispatchEvent(new CustomEvent('selected-changed'));
    await element.requestUpdate();

    const entries = element.renderRoot.querySelectorAll('foxy-internal-i18n-editor-entry');
    expect(entries).to.have.length(1);

    expect(entries[0]).to.have.attribute('default-value', 'Account number');
    expect(entries[0]).to.not.have.attribute('gateway');
    expect(entries[0]).to.have.attribute('parent', 'https://demo.api/hapi/language_overrides');
    expect(entries[0]).to.have.attribute('code', 'checkout_ach_account_number');
    expect(entries[0]).to.have.attribute('infer', '');
  });

  it('adds "gateway" attribute for entries of gateway-specific language strings', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/10', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            english: {
              gateways: {
                foo: { bar: 'Bar', baz: 'Baz' },
              },
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<I18nEditor>(html`
      <foxy-i18n-editor
        language-overrides="https://demo.api/hapi/language_overrides"
        selected-language="english"
        href="https://demo.api/hapi/property_helpers/10"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-i18n-editor>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const entries = element.renderRoot.querySelectorAll('foxy-internal-i18n-editor-entry');

    expect(entries[0]).to.have.attribute('gateway', 'foo');
    expect(entries[1]).to.have.attribute('gateway', 'foo');
  });

  it('loads and supplies the override to a language string entry if it exists', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/10', {
        method: 'PATCH',
        body: JSON.stringify({ values: { english: { foo_bar: 'Bar', foo_baz: 'Baz' } } }),
      })
    )?.handlerPromise;

    const newOverrideResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/language_overrides', {
        method: 'POST',
        body: JSON.stringify({ code: 'foo_bar', custom_value: 'Custom Bar' }),
      })
    )?.handlerPromise;

    const newOverrideResponseJSON = await newOverrideResponse.json();
    const newOverride = await getTestData(newOverrideResponseJSON._links.self.href, router);

    const element = await fixture<I18nEditor>(html`
      <foxy-i18n-editor
        language-overrides="https://demo.api/hapi/language_overrides"
        selected-language="english"
        href="https://demo.api/hapi/property_helpers/10"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-i18n-editor>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const $ = element.renderRoot;
    const entries = $.querySelectorAll<InternalI18nEditorEntry>('foxy-internal-i18n-editor-entry');
    await waitUntil(() => !!entries[0].data, '', { timeout: 5000 });

    expect(entries[0]).to.have.deep.property('data', newOverride);
    expect(entries[1]).to.have.deep.property('data', null);
  });
});
