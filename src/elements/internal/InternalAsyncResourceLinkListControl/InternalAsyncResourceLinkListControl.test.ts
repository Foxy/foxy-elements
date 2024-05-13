import type { CollectionPage } from '../../public/CollectionPage/CollectionPage';
import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import '../../public/ItemCategoryCard/index';
import './index';

import { InternalAsyncResourceLinkListControl as Control } from './InternalAsyncResourceLinkListControl';
import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/hapi';
import { getTestData } from '../../../testgen/getTestData';

describe('InternalAsyncResourceLinkListControl', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-checkbox element', () => {
    expect(customElements.get('vaadin-checkbox')).to.exist;
  });

  it('imports and defines foxy-collection-page element', () => {
    expect(customElements.get('foxy-collection-page')).to.exist;
  });

  it('imports and defines foxy-pagination element', () => {
    expect(customElements.get('foxy-pagination')).to.exist;
  });

  it('imports and defines foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-editable-control element', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.exist;
  });

  it('defines itself as foxy-internal-async-resource-link-list-control', () => {
    expect(customElements.get('foxy-internal-async-resource-link-list-control')).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('has a reactive property foreignKeyForUri', () => {
    expect(new Control()).to.have.property('foreignKeyForUri', null);
    expect(Control).to.have.deep.nested.property('properties.foreignKeyForUri', {
      attribute: 'foreign-key-for-uri',
    });
  });

  it('has a reactive property foreignKeyForId', () => {
    expect(new Control()).to.have.property('foreignKeyForId', null);
    expect(Control).to.have.deep.nested.property('properties.foreignKeyForId', {
      attribute: 'foreign-key-for-id',
    });
  });

  it('has a reactive property ownKeyForUri', () => {
    expect(new Control()).to.have.property('ownKeyForUri', null);
    expect(Control).to.have.deep.nested.property('properties.ownKeyForUri', {
      attribute: 'own-key-for-uri',
    });
  });

  it('has a reactive property optionsHref', () => {
    expect(new Control()).to.have.property('optionsHref', null);
    expect(Control).to.have.deep.nested.property('properties.optionsHref', {
      attribute: 'options-href',
    });
  });

  it('has a reactive property linksHref', () => {
    expect(new Control()).to.have.property('linksHref', null);
    expect(Control).to.have.deep.nested.property('properties.linksHref', {
      attribute: 'links-href',
    });
  });

  it('has a reactive property embedKey', () => {
    expect(new Control()).to.have.property('embedKey', null);
    expect(Control).to.have.deep.nested.property('properties.embedKey', { attribute: 'embed-key' });
  });

  it('has a reactive property ownUri', () => {
    expect(new Control()).to.have.property('ownUri', null);
    expect(Control).to.have.deep.nested.property('properties.ownUri', { attribute: 'own-uri' });
  });

  it('has a reactive property limit', () => {
    expect(new Control()).to.have.property('limit', 20);
    expect(Control).to.have.deep.nested.property('properties.limit', { type: Number });
  });

  it('has a reactive property item', () => {
    expect(new Control()).to.have.property('item', null);
    expect(Control).to.have.deep.nested.property('properties.item', {});
  });

  it('renders label', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-resource-link-list-control></foxy-internal-async-resource-link-list-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-resource-link-list-control></foxy-internal-async-resource-link-list-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text if available', async () => {
    let control = await fixture<Control>(html`
      <foxy-internal-async-resource-link-list-control></foxy-internal-async-resource-link-list-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    customElements.define(
      'x-test-control',
      class extends Control {
        protected get _errorMessage() {
          return 'Test error message';
        }
      }
    );

    control = await fixture<Control>(html`<x-test-control></x-test-control>`);
    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders pagination and collection page for the list of options', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-resource-link-list-control
        options-href="https://demo.api/hapi/item_categories"
        limit="5"
      >
      </foxy-internal-async-resource-link-list-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination');
    const page = pagination?.querySelector('foxy-collection-page');

    expect(pagination).to.exist;
    expect(pagination).to.have.attribute('infer', 'pagination');
    expect(pagination).to.have.attribute('first', 'https://demo.api/hapi/item_categories?limit=5');

    expect(page).to.exist;
    expect(page).to.have.attribute('infer', 'card');
  });

  it('renders checkbox with card content for each option', async () => {
    const router = createRouter();
    const control = await fixture<Control>(html`
      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="item_category_uri"
        foreign-key-for-id="item_category_id"
        own-key-for-uri="coupon_uri"
        options-href="https://demo.api/hapi/item_categories"
        links-href="https://demo.api/coupon_item_categories"
        embed-key="fx:coupon_item_categories"
        own-uri="https://demo.api/coupons/0"
        limit="5"
        item="foxy-item-category-card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-resource-link-list-control>
    `);

    const page = control.renderRoot.querySelector('foxy-collection-page') as CollectionPage<any>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const checkboxes = page.querySelectorAll('vaadin-checkbox');
    const options = await getTestData<Resource<Rels.ItemCategories>>(
      './hapi/item_categories',
      router
    );

    expect(options.returned_items).to.be.greaterThan(0);
    expect(checkboxes).to.have.length(Math.min(5, options.returned_items));

    for (let i = 0; i < Math.min(5, options.returned_items); ++i) {
      const checkbox = checkboxes[i];
      const option = options._embedded['fx:item_categories'][i];
      const card = checkbox.querySelector('foxy-item-category-card');

      expect(card).to.have.attribute('parent', 'https://demo.api/hapi/item_categories?limit=5');
      expect(card).to.have.attribute('infer', '');
      expect(card).to.have.property('href', option._links.self.href);
    }
  });

  it('checks the checkbox if the option is already linked', async () => {
    const router = createRouter();

    const control = await fixture<Control>(html`
      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="item_category_uri"
        foreign-key-for-id="item_category_id"
        own-key-for-uri="coupon_uri"
        options-href="https://demo.api/hapi/item_categories"
        links-href="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
        embed-key="fx:coupon_item_categories"
        own-uri="https://demo.api/hapi/coupons/0"
        limit="5"
        item="foxy-item-category-card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-resource-link-list-control>
    `);

    const page = control.renderRoot.querySelector('foxy-collection-page') as CollectionPage<any>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const checkboxes = page.querySelectorAll('vaadin-checkbox');
    await waitUntil(() => checkboxes[0].hasAttribute('checked'));

    expect(checkboxes[0]).to.have.attribute('checked');
    expect(checkboxes[1]).to.not.have.attribute('checked');
  });

  it('deletes a link when the checkbox is unchecked', async () => {
    const router = createRouter();

    const wrapper = await fixture<HTMLDivElement>(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-internal-async-resource-link-list-control
          foreign-key-for-uri="item_category_uri"
          foreign-key-for-id="item_category_id"
          own-key-for-uri="coupon_uri"
          options-href="https://demo.api/hapi/item_categories"
          links-href="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          embed-key="fx:coupon_item_categories"
          own-uri="https://demo.api/hapi/coupons/0"
          limit="5"
          item="foxy-item-category-card"
        >
        </foxy-internal-async-resource-link-list-control>
      </div>
    `);

    const control = wrapper.firstElementChild as Control;
    const page = control.renderRoot.querySelector('foxy-collection-page') as CollectionPage<any>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const checkboxes = page.querySelectorAll('vaadin-checkbox');
    await waitUntil(() => !checkboxes[0].disabled && checkboxes[0].checked);

    const whenDeleted = oneEvent(control, 'fetch');
    checkboxes[0].click();
    const deleteEvent = (await whenDeleted) as unknown as FetchEvent;

    expect(deleteEvent.request.url).to.equal('https://demo.api/hapi/coupon_item_categories/0');
    expect(deleteEvent.request.method).to.equal('DELETE');
  });

  it('adds a link when a checkbox is checked', async () => {
    const router = createRouter();

    const wrapper = await fixture<HTMLDivElement>(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-internal-async-resource-link-list-control
          foreign-key-for-uri="item_category_uri"
          foreign-key-for-id="item_category_id"
          own-key-for-uri="coupon_uri"
          options-href="https://demo.api/hapi/item_categories"
          links-href="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          embed-key="fx:coupon_item_categories"
          own-uri="https://demo.api/hapi/coupons/0"
          limit="5"
          item="foxy-item-category-card"
        >
        </foxy-internal-async-resource-link-list-control>
      </div>
    `);

    const control = wrapper.firstElementChild as Control;
    const page = control.renderRoot.querySelector('foxy-collection-page') as CollectionPage<any>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const checkboxes = page.querySelectorAll('vaadin-checkbox');
    await waitUntil(() => !checkboxes[1].disabled && !checkboxes[1].checked);

    const whenAdded = oneEvent(control, 'fetch');
    checkboxes[1].click();
    await whenAdded;

    await new Promise(r => setTimeout(r));
    const results = await getTestData<Resource<Rels.CouponItemCategories>>(
      './hapi/coupon_item_categories?coupon_id=0',
      router
    );

    expect(results.returned_items).to.equal(2);
  });
});
