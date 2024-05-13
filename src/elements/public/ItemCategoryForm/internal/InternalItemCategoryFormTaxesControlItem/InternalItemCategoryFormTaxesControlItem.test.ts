import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalItemCategoryFormTaxesControlItem as Item } from './InternalItemCategoryFormTaxesControlItem';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../../server';
import { getByTag } from '../../../../../testgen/getByTag';
import { TaxCard } from '../../../TaxCard/index';

const waitUntilNetworkIsIdle = (element: HTMLElement) => {
  return new Promise<void>(resolve => {
    let timeout = setTimeout(() => resolve(), 500);

    const handler = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        element.removeEventListener('fetch', handler);
        resolve();
      }, 500);
    };

    element.addEventListener('fetch', handler);
  });
};

describe('ItemCategoryForm', () => {
  describe('InternalItemCategoryFormTaxesControlItem', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines vaadin-checkbox', () => {
      const element = customElements.get('vaadin-checkbox');
      expect(element).to.exist;
    });

    it('imports and defines foxy-nucleon', () => {
      const element = customElements.get('foxy-nucleon');
      expect(element).to.equal(NucleonElement);
    });

    it('imports and defines foxy-tax-card', () => {
      const element = customElements.get('foxy-tax-card');
      expect(element).to.equal(TaxCard);
    });

    it('imports and defines itself as foxy-internal-item-category-form-taxes-control-item', () => {
      const element = customElements.get('foxy-internal-item-category-form-taxes-control-item');
      expect(element).to.equal(Item);
    });

    it('extends foxy-tax-card', () => {
      expect(new Item()).to.be.instanceOf(TaxCard);
    });

    it('has a reactive property "taxItemCategories"', () => {
      expect(new Item()).to.have.property('taxItemCategories', null);
      expect(Item).to.have.nested.property('properties.taxItemCategories');
      expect(Item).to.not.have.nested.property('properties.taxItemCategories.type');
      expect(Item).to.have.nested.property(
        'properties.taxItemCategories.attribute',
        'tax-item-categories'
      );
    });

    it('has a reactive property "itemCategory"', () => {
      expect(new Item()).to.have.property('itemCategory', null);
      expect(Item).to.have.nested.property('properties.itemCategory');
      expect(Item).to.not.have.nested.property('properties.itemCategory.type');
      expect(Item).to.have.nested.property('properties.itemCategory.attribute', 'item-category');
    });

    it('renders an unchecked checkbox if tax item category resource does not exist', async () => {
      const router = createRouter();
      const item = await fixture<Item>(html`
        <foxy-internal-item-category-form-taxes-control-item
          tax-item-categories="https://demo.api/hapi/tax_item_categories?i_dont=exist"
          item-category="https://demo.api/hapi/item_categories/0"
          href="https://demo.api/hapi/taxes/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-item-category-form-taxes-control-item>
      `);

      await waitUntilNetworkIsIdle(item);
      expect(await getByTag(item, 'vaadin-checkbox')).to.not.have.attribute('checked');
    });

    it('creates a tax item category when checkbox is checked', async () => {
      const router = createRouter();

      const item = await fixture<Item>(html`
        <foxy-internal-item-category-form-taxes-control-item
          tax-item-categories="https://demo.api/hapi/tax_item_categories?i_dont=exist"
          item-category="https://demo.api/hapi/item_categories/0"
        >
        </foxy-internal-item-category-form-taxes-control-item>
      `);

      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      item.addEventListener('fetch', handleFetch as (evt: Event) => unknown);
      item.href = 'https://demo.api/hapi/taxes/0';

      await waitUntilNetworkIsIdle(item);
      item.removeEventListener('fetch', handleFetch as (evt: Event) => unknown);
      const checkbox = (await getByTag(item, 'vaadin-checkbox')) as CheckboxElement;
      const whenFetchEventSent = oneEvent(item, 'fetch') as unknown as Promise<FetchEvent>;

      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change'));
      const fetchEvent = await whenFetchEventSent;

      expect(fetchEvent).to.have.nested.property('request.method', 'POST');

      expect(fetchEvent).to.have.nested.property(
        'request.url',
        'https://demo.api/hapi/tax_item_categories?i_dont=exist'
      );

      expect(await fetchEvent.request.clone().json()).to.deep.equal({
        item_category_uri: 'https://demo.api/hapi/item_categories/0',
        tax_uri: 'https://demo.api/hapi/taxes/0',
      });
    });

    it('renders a checked checkbox if tax item category resource exists', async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/tax_item_categories', {
          method: 'POST',
          body: JSON.stringify({
            item_category_id: 0,
            item_category_uri: 'https://demo.api/hapi/item_categories/0',
            tax_id: 0,
            tax_uri: 'https://demo.api/hapi/taxes/0',
          }),
        })
      )?.handlerPromise;

      const item = await fixture<Item>(html`
        <foxy-internal-item-category-form-taxes-control-item
          tax-item-categories="https://demo.api/hapi/tax_item_categories"
          item-category="https://demo.api/hapi/item_categories/0"
          href="https://demo.api/hapi/taxes/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-item-category-form-taxes-control-item>
      `);

      await waitUntilNetworkIsIdle(item);
      expect(await getByTag(item, 'vaadin-checkbox')).to.have.attribute('checked');
    });

    it('deletes a tax item category when checkbox is unchecked', async () => {
      const router = createRouter();

      const newTICResponse = await router.handleRequest(
        new Request('https://demo.api/hapi/tax_item_categories', {
          method: 'POST',
          body: JSON.stringify({
            item_category_id: 0,
            item_category_uri: 'https://demo.api/hapi/item_categories/0',
            tax_id: 0,
            tax_uri: 'https://demo.api/hapi/taxes/0',
          }),
        })
      )!.handlerPromise;

      const newTIC = await newTICResponse.json();

      const item = await fixture<Item>(html`
        <foxy-internal-item-category-form-taxes-control-item
          tax-item-categories="https://demo.api/hapi/tax_item_categories"
          item-category="https://demo.api/hapi/item_categories/0"
        >
        </foxy-internal-item-category-form-taxes-control-item>
      `);

      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      item.addEventListener('fetch', handleFetch as (evt: Event) => unknown);
      item.href = 'https://demo.api/hapi/taxes/0';

      await waitUntilNetworkIsIdle(item);
      item.removeEventListener('fetch', handleFetch as (evt: Event) => unknown);
      const checkbox = (await getByTag(item, 'vaadin-checkbox')) as CheckboxElement;
      const whenFetchEventSent = oneEvent(item, 'fetch');

      checkbox.checked = false;
      checkbox.dispatchEvent(new CustomEvent('change'));
      const fetchEvent = await whenFetchEventSent;

      expect(fetchEvent).to.have.nested.property('request.method', 'DELETE');
      expect(fetchEvent).to.have.nested.property('request.url', newTIC._links.self.href);
    });

    it('disables the checkbox while fetching data', async () => {
      const router = createRouter();
      const item = await fixture<Item>(html`
        <foxy-internal-item-category-form-taxes-control-item
          tax-item-categories="https://demo.api/hapi/tax_item_categories?i_dont=exist"
          item-category="https://demo.api/hapi/item_categories/0"
          href="https://demo.api/hapi/taxes/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-item-category-form-taxes-control-item>
      `);

      expect(await getByTag(item, 'vaadin-checkbox')).to.have.attribute('disabled');
      await waitUntilNetworkIsIdle(item);
      expect(await getByTag(item, 'vaadin-checkbox')).to.not.have.attribute('disabled');
    });

    it('disables the checkbox when the entire item is disabled', async () => {
      const router = createRouter();
      const item = await fixture<Item>(html`
        <foxy-internal-item-category-form-taxes-control-item
          tax-item-categories="https://demo.api/hapi/tax_item_categories?i_dont=exist"
          item-category="https://demo.api/hapi/item_categories/0"
          href="https://demo.api/hapi/taxes/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-item-category-form-taxes-control-item>
      `);

      await waitUntilNetworkIsIdle(item);
      expect(await getByTag(item, 'vaadin-checkbox')).to.not.have.attribute('disabled');

      item.disabled = true;
      await item.requestUpdate();
      expect(await getByTag(item, 'vaadin-checkbox')).to.have.attribute('disabled');
    });
  });
});
