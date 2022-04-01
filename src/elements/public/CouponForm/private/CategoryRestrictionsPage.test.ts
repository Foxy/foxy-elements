import '../index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { CategoryRestrictionsPage } from './CategoryRestrictionsPage';
import { CategoryRestrictionsPageItem } from './CategoryRestrictionsPageItem';
import { FetchEvent } from '../../NucleonElement/FetchEvent';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../server/index';
import { getByTestClass } from '../../../../testgen/getByTestClass';
import { getByTestId } from '../../../../testgen/getByTestId';

customElements.define('test-category-restrictions-page', CategoryRestrictionsPage);

describe('CouponForm', () => {
  describe('CategoryRestrictionsPage', () => {
    it('extends NucleonElement', () => {
      expect(new CategoryRestrictionsPage()).to.be.instanceOf(NucleonElement);
    });

    it('has no default i18n namespace', () => {
      expect(new CategoryRestrictionsPage()).to.have.property('ns', '');
    });

    it('has no default coupon item categories URL', () => {
      expect(new CategoryRestrictionsPage()).to.have.property('couponItemCategories', '');
    });

    it('has no default coupon URL', () => {
      expect(new CategoryRestrictionsPage()).to.have.property('coupon', '');
    });

    it('reflects the value of coupon-item-categories attribute to couponItemCategories property', () => {
      expect(CategoryRestrictionsPage).to.have.nested.property(
        'properties.couponItemCategories.attribute',
        'coupon-item-categories'
      );
    });

    it('renders CategoryRestrictionsPageItem element for each item category', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          coupon-item-categories="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          coupon="https://demo.api/hapi/coupons/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      const categories = element.data!._embedded['fx:item_categories'];

      expect(items.length).to.equal(categories.length);

      categories.forEach((category, index) => {
        expect(items[index]).to.be.instanceOf(CategoryRestrictionsPageItem);
        expect(items[index]).to.have.attribute('item-category', category._links.self.href);
        expect(items[index]).to.have.attribute('group', 'test');
        expect(items[index]).to.include.text(category.name);
      });
    });

    it('is enabled by default', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          coupon-item-categories="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          coupon="https://demo.api/hapi/coupons/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.not.have.attribute('disabled'));
    });

    it('is disabled when element is disabled', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          coupon-item-categories="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          coupon="https://demo.api/hapi/coupons/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          disabled
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.have.attribute('disabled'));
    });

    it('is editable by default', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          coupon-item-categories="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          coupon="https://demo.api/hapi/coupons/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.not.have.attribute('readonly'));
    });

    it('is readonly when element is readonly', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          coupon-item-categories="https://demo.api/hapi/coupon_item_categories?coupon_id=0"
          coupon="https://demo.api/hapi/coupons/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          readonly
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.have.attribute('readonly'));
    });

    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          href="https://demo.api/virtual/stall"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ busy: 'fetching' }));
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          href="https://demo.api/virtual/empty?status=500"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in('fail'));
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('hides spinner once loaded', async () => {
      const router = createRouter();
      const element = await fixture<CategoryRestrictionsPage>(html`
        <test-category-restrictions-page
          href="https://demo.api/hapi/item_categories"
          lang="es"
          ns="foo"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </test-category-restrictions-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });
  });
});
