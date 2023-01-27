import type { StoreShippingMethodForm } from '../../StoreShippingMethodForm';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../index';
import './index';

import { InternalStoreShippingMethodFormServicesControl as Control } from './InternalStoreShippingMethodFormServicesControl';
import { InternalStoreShippingMethodFormServicesPage } from '../InternalStoreShippingMethodFormServicesPage/InternalStoreShippingMethodFormServicesPage';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { CollectionPage } from '../../../CollectionPage/CollectionPage';
import { createRouter } from '../../../../../server';
import { Pagination } from '../../../Pagination/Pagination';
import { getByKey } from '../../../../../testgen/getByKey';
import { getByTag } from '../../../../../testgen/getByTag';
import { I18n } from '../../../I18n/I18n';

describe('StoreShippingMethodForm', () => {
  describe('InternalStoreShippingMethodFormServicesControl', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines foxy-internal-control', () => {
      const element = customElements.get('foxy-internal-control');
      expect(element).to.equal(InternalControl);
    });

    it('imports and defines foxy-pagination', () => {
      const element = customElements.get('foxy-pagination');
      expect(element).to.equal(Pagination);
    });

    it('imports and defines foxy-i18n', () => {
      const element = customElements.get('foxy-i18n');
      expect(element).to.equal(I18n);
    });

    it('imports and defines foxy-internal-store-shipping-method-form-services-page', () => {
      const element = customElements.get('foxy-internal-store-shipping-method-form-services-page');
      expect(element).to.equal(InternalStoreShippingMethodFormServicesPage);
    });

    it('imports and defines itself as foxy-internal-store-shipping-method-form-services-control', () => {
      const localName = 'foxy-internal-store-shipping-method-form-services-control';
      const element = customElements.get(localName);
      expect(element).to.equal(Control);
    });

    it('extends foxy-internal-control', () => {
      expect(new Control()).to.be.instanceOf(InternalControl);
    });

    it('renders translatable label', async () => {
      const router = createRouter();

      const element = await fixture<StoreShippingMethodForm>(html`
        <foxy-store-shipping-method-form
          href="https://demo.api/hapi/store_shipping_methods/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-store-shipping-method-form-services-control infer="services">
          </foxy-internal-store-shipping-method-form-services-control>
        </foxy-store-shipping-method-form>
      `);

      const control = element.firstElementChild as Control;
      const root = control.renderRoot;

      await waitUntil(() => !!root.querySelector('foxy-pagination'), '', { timeout: 5000 });
      const label = await getByKey(control, 'label');

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
    });

    it('renders pagination for services', async () => {
      const router = createRouter();

      const element = await fixture<StoreShippingMethodForm>(html`
        <foxy-store-shipping-method-form
          href="https://demo.api/hapi/store_shipping_methods/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-store-shipping-method-form-services-control infer="services">
          </foxy-internal-store-shipping-method-form-services-control>
        </foxy-store-shipping-method-form>
      `);

      const control = element.firstElementChild as Control;
      const root = control.renderRoot;

      await waitUntil(() => !!root.querySelector('foxy-pagination'), '', { timeout: 5000 });
      const pagination = (await getByTag(control, 'foxy-pagination')) as Pagination;

      expect(pagination).to.exist;
      expect(pagination).to.have.attribute('infer', '');
      expect(pagination).to.have.attribute(
        'first',
        'https://demo.api/hapi/shipping_services?shipping_method_id=0&limit=10'
      );
    });

    it('renders pagination page for services', async () => {
      const router = createRouter();

      const element = await fixture<StoreShippingMethodForm>(html`
        <foxy-store-shipping-method-form
          href="https://demo.api/hapi/store_shipping_methods/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-store-shipping-method-form-services-control infer="services">
          </foxy-internal-store-shipping-method-form-services-control>
        </foxy-store-shipping-method-form>
      `);

      const control = element.firstElementChild as Control;
      const root = control.renderRoot;

      await waitUntil(() => !!root.querySelector('foxy-pagination'), '', { timeout: 5000 });
      const pagination = (await getByTag(control, 'foxy-pagination')) as Pagination;
      const page = pagination.lastElementChild as CollectionPage<any>;

      expect(page).to.exist;

      expect(page).to.have.attribute('infer', '');

      expect(page).to.have.attribute(
        'store-shipping-services-uri',
        element.data!._links['fx:store_shipping_services'].href
      );

      expect(page).to.have.attribute(
        'shipping-method-uri',
        element.data!._links['fx:shipping_method'].href
      );

      element.edit({ use_for_international: true });
      await element.updateComplete;
      await control.updateComplete;

      expect(page).to.have.attribute('international-allowed');

      element.edit({ use_for_international: false });
      await element.updateComplete;
      await control.updateComplete;

      expect(page).to.not.have.attribute('international-allowed');
    });
  });
});
