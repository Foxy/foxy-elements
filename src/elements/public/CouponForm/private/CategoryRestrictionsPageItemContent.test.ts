import '../index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { CategoryRestrictionsPageItemContent } from './CategoryRestrictionsPageItemContent';
import { Checkbox } from '../../../private/Checkbox/Checkbox';
import { CheckboxChangeEvent } from '../../../private/Checkbox/CheckboxChangeEvent';
import { FetchEvent } from '../../NucleonElement/FetchEvent';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../server/index';
import { getByTestId } from '../../../../testgen/getByTestId';
import { stub } from 'sinon';

customElements.define(
  'test-category-restrictions-page-item-content',
  CategoryRestrictionsPageItemContent
);

describe('CouponForm', () => {
  describe('CategoryRestrictionsPage', () => {
    describe('CategoryRestrictionsPageItem', () => {
      describe('CategoryRestrictionsPageItemContent', () => {
        it('extends NucleonElement', () => {
          expect(new CategoryRestrictionsPageItemContent()).to.be.instanceOf(NucleonElement);
        });

        it('has no default item category URL', () => {
          expect(new CategoryRestrictionsPageItemContent()).to.have.property('itemCategory', '');
        });

        it('has no default coupon URL', () => {
          expect(new CategoryRestrictionsPageItemContent()).to.have.property('coupon', '');
        });

        it('reflects the value of item-category attribute to itemCategory property', () => {
          expect(CategoryRestrictionsPageItemContent).to.have.nested.property(
            'properties.itemCategory.attribute',
            'item-category'
          );
        });

        it("renders unchecked Checkbox element if coupon item category doesn't exist", async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          const slot = checkbox.querySelector('slot:not([name])');

          expect(checkbox).to.be.instanceOf(Checkbox);
          expect(checkbox).to.not.have.attribute('checked');
          expect(slot).to.exist;
        });

        it('renders checked Checkbox element if coupon item category exists', async () => {
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

          const matchResponse = await router.handleRequest(createMatchRequest)?.handlerPromise;
          const matchLink = (await matchResponse.json())._links.self.href;
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              href=${matchLink}
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'snapshot' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          const slot = checkbox.querySelector('slot:not([name])');

          expect(checkbox).to.be.instanceOf(Checkbox);
          expect(checkbox).to.have.attribute('checked');
          expect(slot).to.exist;
        });

        it('deletes coupon item category once unchecked', async () => {
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

          const matchResponse = await router.handleRequest(createMatchRequest)?.handlerPromise;
          const matchLink = (await matchResponse.json())._links.self.href;
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              href=${matchLink}
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'snapshot' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as Checkbox;
          const deleteMethod = stub(element, 'delete');

          checkbox.checked = false;
          checkbox.dispatchEvent(new CheckboxChangeEvent(false));

          expect(deleteMethod).to.have.been.called;

          deleteMethod.restore();
        });

        it('creates coupon item category once checked', async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              parent="https://demo.api/hapi/coupon_item_categories?coupon_id=0&item_category_id=0"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as Checkbox;
          const submitMethod = stub(element, 'submit');

          checkbox.checked = true;
          checkbox.dispatchEvent(new CheckboxChangeEvent(true));

          expect(element).to.have.nested.property('form.item_category_uri', element.itemCategory);
          expect(element).to.have.nested.property('form.coupon_uri', element.coupon);
          expect(submitMethod).to.have.been.called;

          submitMethod.restore();
        });

        it('is enabled by default', async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.not.have.attribute('disabled');
        });

        it('is disabled when element is disabled', async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              disabled
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.have.attribute('disabled');
        });

        it('is disabled when element is loading data', async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              href="https://demo.api/virtual/stall"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ busy: 'fetching' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.have.attribute('disabled');
        });

        it('is editable by default', async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.not.have.attribute('readonly');
        });

        it('is readonly when element is readonly', async () => {
          const router = createRouter();
          const element = await fixture<CategoryRestrictionsPageItemContent>(html`
            <test-category-restrictions-page-item-content
              item-category="https://demo.api/hapi/item_categories/0"
              coupon="https://demo.api/hapi/coupons/0"
              readonly
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </test-category-restrictions-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.have.attribute('readonly');
        });
      });
    });
  });
});
