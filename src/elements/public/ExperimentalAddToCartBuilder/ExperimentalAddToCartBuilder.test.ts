import type { ExperimentalAddToCartSnippet } from './types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { ExperimentalAddToCartBuilder as Builder } from './ExperimentalAddToCartBuilder';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';

import dedent from 'dedent';

async function waitForIdle(element: Builder) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('ExperimentalAddToCartBuilder', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-template-set-card', () => {
    expect(customElements.get('foxy-template-set-card')).to.exist;
  });

  it('imports and defines foxy-copy-to-clipboard', () => {
    expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines itself as foxy-experimental-add-to-cart-builder', () => {
    expect(customElements.get('foxy-experimental-add-to-cart-builder')).to.equal(Builder);
  });

  it('extends InternalForm', () => {
    expect(new Builder()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "experimental-add-to-cart-builder"', () => {
    expect(Builder).to.have.property('defaultNS', 'experimental-add-to-cart-builder');
    expect(new Builder()).to.have.property('ns', 'experimental-add-to-cart-builder');
  });

  it('has a reactive property/attribute "defaultDomain"', () => {
    expect(Builder).to.have.nested.property('properties.defaultDomain');
    expect(Builder).to.have.nested.property('properties.defaultDomain.attribute', 'default-domain');

    expect(new Builder()).to.have.property('defaultDomain', null);
  });

  it('has a reactive property/attribute "encodeHelper"', () => {
    expect(Builder).to.have.nested.property('properties.encodeHelper');
    expect(Builder).to.have.nested.property('properties.encodeHelper.attribute', 'encode-helper');

    expect(new Builder()).to.have.property('encodeHelper', null);
  });

  it('has a reactive property/attribute "localeCodes"', () => {
    expect(Builder).to.have.nested.property('properties.localeCodes');
    expect(Builder).to.have.nested.property('properties.localeCodes.attribute', 'locale-codes');

    expect(new Builder()).to.have.property('localeCodes', null);
  });

  it('has a reactive property/attribute "store"', () => {
    expect(Builder).to.have.nested.property('properties.store');
    expect(new Builder()).to.have.property('store', null);
  });

  it('renders summary control for items', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="items"]'
    );

    expect(control).to.exist;
  });

  it('renders summary control for each one of the items inside of the items summary', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    element.edit({
      items: [
        { name: 'first item', price: 1, quantity: 1, custom_options: [] },
        { name: 'second item', price: 2, quantity: 2, custom_options: [] },
      ],
    });

    await element.requestUpdate();
    const items = element.renderRoot.querySelectorAll(
      '[infer="items"] foxy-internal-summary-control[infer="item-group"]'
    );

    expect(items).to.have.length(2);

    expect(items[0]).to.have.attribute('layout', 'details');
    expect(items[0]).to.have.attribute('label', 'first item');
    expect(items[0]).to.have.attribute('open');

    expect(items[1]).to.have.attribute('layout', 'details');
    expect(items[1]).to.have.attribute('label', 'second item');
    expect(items[1]).to.not.have.attribute('open');
  });

  it('renders internal item control for each one of the items inside of the item summary', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element.edit({
      items: [
        { name: 'first item', price: 1, quantity: 1, custom_options: [] },
        { name: 'second item', price: 2, quantity: 2, custom_options: [] },
      ],
    });

    await element.requestUpdate();
    const defaultItemCategory = await getTestData('./hapi/item_categories/0');
    const items = element.renderRoot.querySelectorAll(
      '[infer="items"] [infer="item-group"] foxy-internal-experimental-add-to-cart-builder-item-control[infer="item"]'
    );

    expect(items).to.have.length(2);
    await waitForIdle(element);
    await element.requestUpdate();

    for (let index = 0; index < items.length; ++index) {
      expect(items[index]).to.have.deep.property('defaultItemCategory', defaultItemCategory);
      expect(items[index]).to.not.have.attribute('use-cart-validation');
      expect(items[index]).to.have.attribute('currency-code', 'AUD');
      expect(items[index]).to.have.attribute('store', 'https://demo.api/hapi/stores/0');
      expect(items[index]).to.have.attribute('index', String(index));
      expect(items[index]).to.have.attribute(
        'item-categories',
        'https://demo.api/hapi/item_categories?store_id=0'
      );
    }
  });

  it('removes item when "remove" event is dispatched', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    element.edit({
      items: [
        { name: 'first item', price: 1, quantity: 1, custom_options: [] },
        { name: 'second item', price: 2, quantity: 2, custom_options: [] },
      ],
    });

    await element.requestUpdate();
    const item = element.renderRoot.querySelector('[infer="item"]');
    item?.dispatchEvent(new CustomEvent('remove'));

    await element.requestUpdate();
    expect(element).to.have.deep.nested.property('form.items', [
      { name: 'second item', price: 2, quantity: 2, custom_options: [] },
    ]);
  });

  it('renders Add Product button', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const label = element.renderRoot.querySelector('foxy-i18n[infer="add-product"][key="caption"]');
    const button = label?.closest('vaadin-button');

    expect(button).to.exist;
    expect(element.form.items).to.have.length(1);

    button?.dispatchEvent(new CustomEvent('click'));
    expect(element.form.items).to.have.length(2);

    expect(button).to.not.have.attribute('disabled');
    element.disabled = true;
    await element.requestUpdate();
    expect(button).to.have.attribute('disabled');
  });

  it('renders summary control for preview', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="preview"]'
    );

    expect(control).to.exist;
  });

  it('renders SKU Required message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element1);
    await element1.requestUpdate();

    const spinnerSelector = 'foxy-spinner[infer="unavailable"][state="paused"]';
    const labelSelector = 'foxy-i18n[infer="unavailable"][key="paused_code_required"]';
    expect(element1.renderRoot.querySelector(spinnerSelector)).to.exist;
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(spinnerSelector)).to.not.exist;
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders HTML Entities Unsupported message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element1.edit({ items: [{ name: 'Test&quot;', code: 'TEST', price: 25, custom_options: [] }] });
    await waitForIdle(element1);
    await element1.requestUpdate();

    const spinnerSelector = 'foxy-spinner[infer="unavailable"][state="error"]';
    const labelSelector = 'foxy-i18n[infer="unavailable"][key="error_html_entities_present"]';
    expect(element1.renderRoot.querySelector(spinnerSelector)).to.exist;
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(spinnerSelector)).to.not.exist;
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders Double Quotes Unsupported message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element1.edit({ items: [{ name: 'Test"', code: 'TEST', price: 25, custom_options: [] }] });
    await waitForIdle(element1);
    await element1.requestUpdate();

    const spinnerSelector = 'foxy-spinner[infer="unavailable"][state="error"]';
    const labelSelector = 'foxy-i18n[infer="unavailable"][key="error_double_quotes_present"]';
    expect(element1.renderRoot.querySelector(spinnerSelector)).to.exist;
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(spinnerSelector)).to.not.exist;
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders Special Characters Present message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element1.edit({
      items: [
        {
          name: 'Test',
          code: 'TEST',
          price: 25,
          custom_options: [{ name: 'foo&', value: 'bar' }],
        },
      ],
    });

    await waitForIdle(element1);
    await element1.requestUpdate();

    const labelSelector = 'foxy-i18n[infer="unavailable"][key="error_special_characters_present"]';
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders Configurable Price Unsupported message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element1.edit({
      items: [
        {
          name: 'Test',
          code: 'TEST',
          price: 25,
          price_configurable: true,
          custom_options: [],
        },
      ],
    });

    await waitForIdle(element1);
    await element1.requestUpdate();

    const labelSelector = 'foxy-i18n[infer="unavailable"][key="error_price_configurable"]';
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders Duplicate Custom Options Unsupported message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element1.edit({
      items: [
        {
          name: 'Test',
          code: 'TEST',
          price: 25,
          custom_options: [
            { name: 'foo', value: 'bar' },
            { name: 'foo', value: 'baz' },
          ],
        },
      ],
    });

    await waitForIdle(element1);
    await element1.requestUpdate();

    const labelSelector =
      'foxy-i18n[infer="unavailable"][key="error_duplicate_custom_option_names"]';
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders Configurable Value In Custom Options Unsupported message when appropriate', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: true }),
      })
    )?.handlerPromise;

    const element1 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    element1.edit({
      items: [
        {
          name: 'Test',
          code: 'TEST',
          price: 25,
          custom_options: [{ name: 'foo', value: 'bar', value_configurable: true }],
        },
      ],
    });

    await waitForIdle(element1);
    await element1.requestUpdate();

    const labelSelector = 'foxy-i18n[infer="unavailable"][key="error_option_value_configurable"]';
    expect(element1.renderRoot.querySelector(labelSelector)).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_cart_validation: false }),
      })
    )?.handlerPromise;

    const element2 = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element2);
    await element2.requestUpdate();
    expect(element2.renderRoot.querySelector(labelSelector)).to.not.exist;
  });

  it('renders iframe with preview when preview is available', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element);
    element.edit({ items: [{ name: 'item', price: 1, quantity: 1, custom_options: [] }] });
    await element.requestUpdate();

    const iframe = element.renderRoot.querySelector('[infer="preview"] iframe');
    expect(iframe).to.exist;
    expect(iframe).to.have.attribute('srcdoc');
    expect(iframe?.getAttribute('srcdoc')).to.include('<form ');
  });

  it('renders source code for preview when preview is available', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element);
    element.edit({ items: [{ name: 'item', price: 1, quantity: 1, custom_options: [] }] });
    await element.requestUpdate();

    const code = element.renderRoot.querySelector('[infer="preview"] code');
    expect(code).to.exist;
    expect(code?.textContent).to.include('<form ');
  });

  it('renders Copy button for preview source when preview is available', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element);
    element.edit({ items: [{ name: 'item', price: 1, quantity: 1, custom_options: [] }] });
    await element.requestUpdate();

    const button = element.renderRoot.querySelector('[infer="preview"] foxy-copy-to-clipboard');
    expect(button).to.exist;
    expect(button).to.have.attribute('infer', 'copy-to-clipboard');
    expect(button).to.have.attribute('text');
    expect(button?.getAttribute('text')).to.include('<form ');
  });

  it('renders link with cart URL when preview is available', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element);
    element.edit({ items: [{ name: 'item', price: 1, quantity: 1, custom_options: [] }] });
    await element.requestUpdate();

    const link = element.renderRoot.querySelector('[infer="link"] a');
    expect(link).to.exist;
    expect(link).to.have.attribute('target', '_blank');
    expect(link).to.have.attribute('href');
    expect(link?.getAttribute('href')).to.include('.foxycart.com/cart?');
  });

  it('renders Copy button for cart URL when preview is available', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element);
    element.edit({ items: [{ name: 'item', price: 1, quantity: 1, custom_options: [] }] });
    await element.requestUpdate();

    const button = element.renderRoot.querySelector('[infer="link"] foxy-copy-to-clipboard');
    expect(button).to.exist;
    expect(button).to.have.attribute('infer', 'copy-to-clipboard');
    expect(button).to.have.attribute('text');
    expect(button?.getAttribute('text')).to.include('.foxycart.com/cart?');
  });

  it('renders summary control for cart settings', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="cart-settings"]'
    );

    expect(control).to.exist;
  });

  it('renders text control for coupon code in cart settings', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="cart-settings"] foxy-internal-text-control[infer="coupon"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders resource picker control for template set in cart settings', async () => {
    const router = createRouter();
    const element = await fixture<Builder>(
      html`
        <foxy-experimental-add-to-cart-builder
          default-domain="foxycart.com"
          encode-helper="https://demo.api/virtual/encode"
          locale-codes="https://demo.api/hapi/property_helpers/7"
          store="https://demo.api/hapi/stores/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-experimental-add-to-cart-builder>
      `
    );

    await waitForIdle(element);
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="cart-settings"] foxy-internal-resource-picker-control[infer="template-set-uri"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/template_sets?store_id=0');
    expect(control).to.have.attribute('item', 'foxy-template-set-card');
  });

  it('renders select control for "empty" parameter in cart settings', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="cart-settings"] foxy-internal-select-control[infer="empty"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { label: 'option_false', value: 'false' },
      { label: 'option_true', value: 'true' },
      { label: 'option_reset', value: 'reset' },
    ]);
  });

  it('renders select control for "cart" parameter in cart settings', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="cart-settings"] foxy-internal-select-control[infer="cart"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { label: 'option_add', value: 'add' },
      { label: 'option_checkout', value: 'checkout' },
      { label: 'option_redirect', value: 'redirect' },
    ]);
  });

  it('renders text control for "redirect" parameter in cart settings', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    element.edit({ cart: 'redirect' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="cart-settings"] foxy-internal-text-control[infer="redirect"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('hides redirect control in cart settings when "cart" parameter is "redirect"', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    element.edit({ cart: 'checkout' });
    await element.requestUpdate();
    let control = element.renderRoot.querySelector('[infer="cart-settings"] [infer="redirect"]');
    expect(control).to.not.exist;

    element.edit({ cart: 'redirect' });
    await element.requestUpdate();
    control = element.renderRoot.querySelector('[infer="cart-settings"] [infer="redirect"]');
    expect(control).to.exist;
  });

  const testDate1 = new Date(2055, 2, 6);
  const testDate2 = new Date(2065, 4, 12);

  const testCases: {
    name: string;
    form: ExperimentalAddToCartSnippet['props'];
    html: string;
    link?: string;
  }[] = [
    {
      name: 'simple product with just name and price',
      form: { items: [{ name: 'Test0', price: 15, custom_options: [] }] },
      link: 'https://acme.foxycart.com/cart?name=Test0&price=15AUD',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test0">
          <input type="hidden" name="price" value="15AUD">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product without custom options',
      form: {
        items: [
          {
            name: 'Test1',
            item_category_uri: 'https://demo.api/hapi/item_categories/1',
            price: 25,
            price_configurable: true,
            code: 'CODETEST1',
            parent_code: 'PARENTCODETEST1',
            image: 'https://picsum.photos/200/300',
            url: 'https://example.com',
            sub_enabled: true,
            sub_frequency: '2y',
            discount_details: 'allunits|1-10|2-20',
            discount_type: 'quantity_amount',
            discount_name: 'TestDiscount',
            quantity: 3,
            quantity_max: 10,
            quantity_min: 2,
            weight: 10,
            length: 20,
            width: 30,
            height: 40,
            custom_options: [],
          },
        ],
      },
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test1">
          <label>
            <span>preview.price_label</span>
            <input required name="price" value="25.00">
          </label>
          <input type="hidden" name="category" value="CATEGORY_1">
          <input type="hidden" name="code" value="CODETEST1">
          <input type="hidden" name="parent_code" value="PARENTCODETEST1">
          <input type="hidden" name="image" value="https://picsum.photos/200/300">
          <input type="hidden" name="url" value="https://example.com">
          <input type="hidden" name="sub_frequency" value="2y">
          <input type="hidden" name="discount_quantity_amount" value="TestDiscount{allunits|1-10|2-20}">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="2" max="10" value="3">
          </label>
          <input type="hidden" name="quantity_min" value="2">
          <input type="hidden" name="quantity_max" value="10">
          <input type="hidden" name="length" value="20.000">
          <input type="hidden" name="width" value="30.000">
          <input type="hidden" name="height" value="40.000">
          <input type="hidden" name="weight" value="10.000">
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product with DD subscription start date format',
      form: {
        items: [
          {
            name: 'Test2',
            price: 25,
            sub_enabled: true,
            sub_frequency: '2y',
            sub_startdate_format: 'dd',
            sub_startdate: 12,
            custom_options: [],
          },
        ],
      },
      link: 'https://acme.foxycart.com/cart?name=Test2&price=25AUD&sub_frequency=2y&sub_startdate=12',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test2">
          <input type="hidden" name="price" value="25AUD">
          <input type="hidden" name="sub_frequency" value="2y">
          <input type="hidden" name="sub_startdate" value="12">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product with duration subscription start/end date format',
      form: {
        items: [
          {
            name: 'Test3',
            price: 30,
            sub_enabled: true,
            sub_frequency: '1m',
            sub_startdate_format: 'duration',
            sub_startdate: '3d',
            sub_enddate_format: 'duration',
            sub_enddate: '2y',
            custom_options: [],
          },
        ],
      },
      link: 'https://acme.foxycart.com/cart?name=Test3&price=30AUD&sub_frequency=1m&sub_startdate=3d&sub_enddate=2y',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test3">
          <input type="hidden" name="price" value="30AUD">
          <input type="hidden" name="sub_frequency" value="1m">
          <input type="hidden" name="sub_startdate" value="3d">
          <input type="hidden" name="sub_enddate" value="2y">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product with YYYYMMDD subscription start/end date format',
      form: {
        items: [
          {
            name: 'Test3',
            price: 30,
            sub_enabled: true,
            sub_frequency: '1m',
            sub_startdate_format: 'yyyymmdd',
            sub_startdate: testDate1.getTime(),
            sub_enddate_format: 'yyyymmdd',
            sub_enddate: testDate2.getTime(),
            custom_options: [],
          },
        ],
      },
      link: 'https://acme.foxycart.com/cart?name=Test3&price=30AUD&sub_frequency=1m&sub_startdate=20550306&sub_enddate=20650512',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test3">
          <input type="hidden" name="price" value="30AUD">
          <input type="hidden" name="sub_frequency" value="1m">
          <input type="hidden" name="sub_startdate" value="20550306">
          <input type="hidden" name="sub_enddate" value="20650512">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product with expiration timestamp',
      form: {
        items: [
          {
            name: 'Test4',
            price: 35,
            expires_format: 'timestamp',
            expires_value: 2687914800,
            custom_options: [],
          },
        ],
      },
      link: 'https://acme.foxycart.com/cart?name=Test4&price=35AUD&expires=2687914800',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test4">
          <input type="hidden" name="price" value="35AUD">
          <input type="hidden" name="expires" value="2687914800">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product with expiration duration (minutes)',
      form: {
        items: [
          {
            name: 'Test5',
            price: 40,
            expires_format: 'minutes',
            expires_value: 15,
            custom_options: [],
          },
        ],
      },
      link: 'https://acme.foxycart.com/cart?name=Test5&price=40AUD&expires=15',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test5">
          <input type="hidden" name="price" value="40AUD">
          <input type="hidden" name="expires" value="15">
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'complex product with custom options',
      form: {
        items: [
          {
            name: 'Test6',
            price: 45,
            custom_options: [
              { name: 'Option1', value: 'Option1DefaultValue', value_configurable: true },
              { name: 'Option2', value: 'Option2Value1' },
              { name: 'Option2', value: 'Option2Value2', price: 5 },
              { name: 'Option2', value: 'Option2Value3', price: 5, replace_price: true },
              { name: 'Option2', value: 'Option2Value4', price: -5 },
              { name: 'Option2', value: 'Option2Value5', weight: 5 },
              { name: 'Option2', value: 'Option2Value6', weight: 5, replace_weight: true },
              { name: 'Option2', value: 'Option2Value7', weight: -5 },
              { name: 'Option2', value: 'Option2Value8', code: 'FOOBAR' },
              { name: 'Option2', value: 'Option2Value9', code: 'FOOBAR', replace_code: true },
              {
                name: 'Option2',
                value: 'Option2Value10',
                item_category_uri: 'https://demo.api/hapi/item_categories/1',
              },
              {
                name: 'Option2',
                value: 'Option2Value11',
                price: 5,
                weight: -10,
                replace_weight: true,
                code: 'FOOBAR',
                item_category_uri: 'https://demo.api/hapi/item_categories/1',
              },
            ],
          },
        ],
      },
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="name" value="Test6">
          <input type="hidden" name="price" value="45AUD">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <label>
            <span>Option1:</span>
            <input name="Option1" value="Option1DefaultValue">
          </label>
          <label>
            <span>Option2:</span>
            <select name="Option2">
              <option value="Option2Value1">Option2Value1</option>
              <option value="Option2Value2{p+5AUD}">Option2Value2</option>
              <option value="Option2Value3{p:5AUD}">Option2Value3</option>
              <option value="Option2Value4{p-5AUD}">Option2Value4</option>
              <option value="Option2Value5{w+5}">Option2Value5</option>
              <option value="Option2Value6{w:5}">Option2Value6</option>
              <option value="Option2Value7{w-5}">Option2Value7</option>
              <option value="Option2Value8{c+FOOBAR}">Option2Value8</option>
              <option value="Option2Value9{c:FOOBAR}">Option2Value9</option>
              <option value="Option2Value10{y:CATEGORY_1}">Option2Value10</option>
              <option value="Option2Value11{p+5AUD|w:10|y:CATEGORY_1|c+FOOBAR}">Option2Value11</option>
            </select>
          </label>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'simple product with cart options',
      form: {
        template_set_uri: 'https://demo.api/hapi/template_sets/1',
        redirect: 'https://example.com',
        coupon: 'TEST-COUPON-CODE',
        empty: 'reset',
        cart: 'checkout',
        items: [{ name: 'Test7', price: 50, custom_options: [] }],
      },
      link: 'https://acme.foxycart.com/cart?template_set=TEST&cart=checkout&redirect=https%3A%2F%2Fexample.com&coupon=TEST-COUPON-CODE&empty=reset&name=Test7&price=50CAD',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <input type="hidden" name="template_set" value="TEST">
          <input type="hidden" name="empty" value="reset">
          <input type="hidden" name="cart" value="checkout">
          <input type="hidden" name="redirect" value="https://example.com">
          <input type="hidden" name="coupon" value="TEST-COUPON-CODE">
          <input type="hidden" name="name" value="Test7">
          <input type="hidden" name="price" value="50CAD">
          <label>
            <span>preview.quantity_label</span>
            <input type="number" name="quantity" min="1" value="1">
          </label>
          <button type="submit">preview.submit_caption_checkout</button>
        </form>
      `,
    },
    {
      name: 'multiple simple products',
      form: {
        items: [
          { name: 'Test8Product1', price: 55, custom_options: [] },
          { name: 'Test8Product2', price: 60, custom_options: [] },
        ],
      },
      link: 'https://acme.foxycart.com/cart?name=Test8Product1&price=55AUD&2%3Aname=Test8Product2&2%3Aprice=60AUD',
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <fieldset>
            <legend>Test8Product1</legend>
            <input type="hidden" name="name" value="Test8Product1">
            <input type="hidden" name="price" value="55AUD">
            <label>
              <span>preview.quantity_label</span>
              <input type="number" name="quantity" min="1" value="1">
            </label>
          </fieldset>
          <fieldset>
            <legend>Test8Product2</legend>
            <input type="hidden" name="2:name" value="Test8Product2">
            <input type="hidden" name="2:price" value="60AUD">
            <label>
              <span>preview.quantity_label</span>
              <input type="number" name="2:quantity" min="1" value="1">
            </label>
          </fieldset>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
    {
      name: 'multiple complex products with custom options',
      form: {
        items: [
          {
            name: 'Test9Product1',
            price: 65,
            sub_enabled: true,
            sub_frequency: '1m',
            sub_enddate_format: 'duration',
            sub_enddate: '2y',
            custom_options: [
              {
                name: 'Option1',
                value: 'Option1DefaultValue',
                value_configurable: true,
                required: true,
              },
            ],
          },
          {
            name: 'Test9Product2',
            price: 70,
            image: 'https://picsum.photos/200/300',
            url: 'https://example.com',
            custom_options: [
              { name: 'Option2', value: 'Option2Value1' },
              { name: 'Option2', value: 'Option2Value2', price: 5 },
              { name: 'Option2', value: 'Option2Value3', price: 5, replace_price: true },
            ],
          },
        ],
      },
      html: dedent`
        <form action="https://acme.foxycart.com/cart" method="post" target="_blank">
          <fieldset>
            <legend>Test9Product1</legend>
            <input type="hidden" name="name" value="Test9Product1">
            <input type="hidden" name="price" value="65AUD">
            <input type="hidden" name="sub_frequency" value="1m">
            <input type="hidden" name="sub_enddate" value="2y">
            <label>
              <span>preview.quantity_label</span>
              <input type="number" name="quantity" min="1" value="1">
            </label>
            <label>
              <span>Option1:</span>
              <input name="Option1" value="Option1DefaultValue" placeholder="preview.required" required>
            </label>
          </fieldset>
          <fieldset>
            <legend>Test9Product2</legend>
            <input type="hidden" name="2:name" value="Test9Product2">
            <input type="hidden" name="2:price" value="70AUD">
            <input type="hidden" name="2:image" value="https://picsum.photos/200/300">
            <input type="hidden" name="2:url" value="https://example.com">
            <label>
              <span>preview.quantity_label</span>
              <input type="number" name="2:quantity" min="1" value="1">
            </label>
            <label>
              <span>Option2:</span>
              <select name="2:Option2">
                <option value="Option2Value1">Option2Value1</option>
                <option value="Option2Value2{p+5AUD}">Option2Value2</option>
                <option value="Option2Value3{p:5AUD}">Option2Value3</option>
              </select>
            </label>
          </fieldset>
          <button type="submit">preview.submit_caption_cart</button>
        </form>
      `,
    },
  ];

  for (const testCase of testCases) {
    it(`generates form and link for ${testCase.name}`, async () => {
      const router = createRouter();
      const element = await fixture<Builder>(
        html`
          <foxy-experimental-add-to-cart-builder
            default-domain="foxycart.com"
            encode-helper="https://demo.api/virtual/encode"
            locale-codes="https://demo.api/hapi/property_helpers/7"
            store="https://demo.api/hapi/stores/0"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-experimental-add-to-cart-builder>
        `
      );

      await waitForIdle(element);
      element.edit(testCase.form);
      await element.requestUpdate();
      await waitForIdle(element);

      const form = element.renderRoot.querySelector('[infer="preview"] code');
      const link = element.renderRoot.querySelector('[infer="link"] a');
      const linkCopyButton = element.renderRoot.querySelector(
        '[infer="link"] foxy-copy-to-clipboard'
      );
      const formCopyButton = element.renderRoot.querySelector(
        '[infer="preview"] foxy-copy-to-clipboard'
      );

      expect(form?.textContent).to.equal(testCase.html);
      expect(link?.getAttribute('href')).to.equal(testCase.link);
      expect(linkCopyButton?.getAttribute('text')).to.equal(testCase.link);
      expect(formCopyButton?.getAttribute('text')).to.equal(testCase.html);
    });
  }

  it('renders default slot', async () => {
    const element = await fixture<Builder>(
      html`<foxy-experimental-add-to-cart-builder></foxy-experimental-add-to-cart-builder>`
    );

    const slot = element.renderRoot.querySelector('slot:not([name])');
    expect(slot).to.exist;
  });
});
