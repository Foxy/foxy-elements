import '../index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { CategoryRestrictionsPageItem } from './CategoryRestrictionsPageItem';
import { CategoryRestrictionsPageItemContent } from './CategoryRestrictionsPageItemContent';
import { FetchEvent } from '../../NucleonElement/FetchEvent';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../server/index';
import { getByTestId } from '../../../../testgen/getByTestId';

customElements.define('test-category-restrictions-page-item', CategoryRestrictionsPageItem);

describe('CouponForm', () => {
  describe('CategoryRestrictionsPage', () => {
    describe('CategoryRestrictionsPageItem', () => {
      it('extends NucleonElement', () => {
        expect(new CategoryRestrictionsPageItem()).to.be.instanceOf(NucleonElement);
      });

      it('has no default item category URL', () => {
        expect(new CategoryRestrictionsPageItem()).to.have.property('itemCategory', '');
      });

      it('has no default coupon URL', () => {
        expect(new CategoryRestrictionsPageItem()).to.have.property('coupon', '');
      });

      it('reflects the value of item-category attribute to itemCategory property', () => {
        expect(CategoryRestrictionsPageItem).to.have.nested.property(
          'properties.itemCategory.attribute',
          'item-category'
        );
      });

      it('renders CategoryRestrictionsPageItemContent element when loaded (match found)', async () => {
        const router = createRouter();
        const createMatchRequest = new Request(
          'https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              item_category_uri: 'https://demo.api/hapi/item_categories/0',
              coupon_uri: 'https://demo.api/hapi/coupons/0',
            }),
          }
        );

        await router.handleRequest(createMatchRequest)?.handlerPromise;

        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            group="test"
            href="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
            lang="es"
            ns="foo"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        const match = element.data!._embedded['fx:coupon_item_categories'][0];
        const slot = content.querySelector('slot:not([name])');

        expect(content).to.be.instanceOf(CategoryRestrictionsPageItemContent);

        expect(content).to.have.attribute('item-category', element.itemCategory);
        expect(content).to.have.attribute('coupon', element.coupon);
        expect(content).to.have.attribute('group', element.group);
        expect(content).to.have.attribute('href', match._links.self.href);

        expect(slot).to.exist;
      });

      it('renders CategoryRestrictionsPageItemContent element when loaded (match not found)', async () => {
        const router = createRouter();
        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            group="test"
            href="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
            lang="es"
            ns="foo"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        const slot = content.querySelector('slot:not([name])');

        expect(content).to.be.instanceOf(CategoryRestrictionsPageItemContent);

        expect(content).to.have.attribute('item-category', element.itemCategory);
        expect(content).to.have.attribute('coupon', element.coupon);
        expect(content).to.have.attribute('parent', element.href);
        expect(content).to.have.attribute('group', element.group);

        expect(slot).to.exist;
      });

      it('is enabled by default', async () => {
        const router = createRouter();
        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            href="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        expect(content).to.not.have.attribute('disabled');
      });

      it('is disabled when element is disabled', async () => {
        const router = createRouter();
        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            href="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
            disabled
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        expect(content).to.have.attribute('disabled');
      });

      it('is disabled when element is loading data', async () => {
        const router = createRouter();
        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            href="https://demo.api/virtual/stall"
            disabled
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ busy: 'fetching' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        expect(content).to.have.attribute('disabled');
      });

      it('is editable by default', async () => {
        const router = createRouter();
        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            href="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        expect(content).to.not.have.attribute('readonly');
      });

      it('is readonly when element is readonly', async () => {
        const router = createRouter();
        const element = await fixture<CategoryRestrictionsPageItem>(html`
          <test-category-restrictions-page-item
            item-category="https://demo.api/hapi/item_categories/0"
            coupon="https://demo.api/hapi/coupons/0"
            href="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
            readonly
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </test-category-restrictions-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        expect(content).to.have.attribute('readonly');
      });
    });
  });
});
