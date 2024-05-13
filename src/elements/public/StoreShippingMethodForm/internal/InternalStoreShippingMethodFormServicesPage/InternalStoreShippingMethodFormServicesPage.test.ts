import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../index';
import './index';

import { InternalStoreShippingMethodFormServicesPageItem as Item } from '../InternalStoreShippingMethodFormServicesPageItem/InternalStoreShippingMethodFormServicesPageItem';
import { InternalStoreShippingMethodFormServicesPage as Page } from './InternalStoreShippingMethodFormServicesPage';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { getByTestClass } from '../../../../../testgen/getByTestClass';
import { createRouter } from '../../../../../server/index';
import { getByTestId } from '../../../../../testgen/getByTestId';
import { Spinner } from '../../../Spinner/Spinner';
import { I18n } from '../../../I18n/I18n';

describe('StoreShippingMethodForm', () => {
  describe('InternalStoreShippingMethodFormServicesPage', () => {
    it('imports and defines foxy-spinner', () => {
      const element = customElements.get('foxy-spinner');
      expect(element).to.equal(Spinner);
    });

    it('imports and defines foxy-i18n', () => {
      const element = customElements.get('foxy-i18n');
      expect(element).to.equal(I18n);
    });

    it('imports and defines foxy-internal-store-shipping-method-form-services-page-item', () => {
      const localName = 'foxy-internal-store-shipping-method-form-services-page-item';
      const element = customElements.get(localName);
      expect(element).to.equal(Item);
    });

    it('imports and defines itself as foxy-internal-store-shipping-method-form-services-page', () => {
      const localName = 'foxy-internal-store-shipping-method-form-services-page';
      const element = customElements.get(localName);
      expect(element).to.equal(Page);
    });

    it('extends NucleonElement', () => {
      expect(new Page()).to.be.instanceOf(NucleonElement);
    });

    it('has a reactive property "storeShippingServicesUri"', () => {
      expect(new Page()).to.have.property('storeShippingServicesUri', null);
      expect(Page).to.have.nested.property('properties.storeShippingServicesUri');
      expect(Page).to.not.have.nested.property('properties.storeShippingServicesUri.type');
      expect(Page).to.have.nested.property(
        'properties.storeShippingServicesUri.attribute',
        'store-shipping-services-uri'
      );
    });

    it('has a reactive property "shippingMethodUri"', () => {
      expect(new Page()).to.have.property('shippingMethodUri', null);
      expect(Page).to.have.nested.property('properties.shippingMethodUri');
      expect(Page).to.not.have.nested.property('properties.shippingMethodUri.type');
      expect(Page).to.have.nested.property(
        'properties.shippingMethodUri.attribute',
        'shipping-method-uri'
      );
    });

    it('has a reactive property "internationalAllowed"', () => {
      expect(new Page()).to.have.property('internationalAllowed', false);
      expect(Page).to.have.nested.property('properties.internationalAllowed');
      expect(Page).to.have.nested.property('properties.internationalAllowed.type', Boolean);
      expect(Page).to.have.nested.property(
        'properties.internationalAllowed.attribute',
        'international-allowed'
      );
    });

    it('has an empty default i18n namespace', () => {
      expect(Page).to.have.property('defaultNS', '');
      expect(new Page()).to.have.property('ns', '');
    });

    it('renders InternalStoreShippingMethodFormServicesPageItem element for each service', async () => {
      const router = createRouter();

      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/hapi/shipping_services"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      const services = element.data!._embedded['fx:shipping_services'];

      expect(items.length).to.equal(services.length);

      services.forEach((service, index) => {
        const storeShippingServiceURL = new URL('https://demo.api/hapi/store_shipping_services');
        const shippingServiceURL = new URL(service._links.self.href);
        const shippingServiceID = shippingServiceURL.pathname.split('/').pop() as string;

        storeShippingServiceURL.searchParams.set('shipping_service_id', shippingServiceID);
        storeShippingServiceURL.searchParams.set('limit', '1');

        expect(items[index]).to.be.instanceOf(Item);
        expect(items[index]).to.have.attribute('shipping-service-uri', service._links.self.href);
        expect(items[index]).to.have.attribute('infer', '');
        expect(items[index]).to.have.attribute('href', storeShippingServiceURL.toString());
        expect(items[index]).to.include.text(service.name);
      });
    });

    it('passes shipping-method-uri value to item elements', async () => {
      const router = createRouter();

      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          href="https://demo.api/hapi/shipping_services"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');

      element.data!._embedded['fx:shipping_services'].forEach((_, index) => {
        expect(items[index]).to.not.have.attribute('shipping-method-uri');
      });

      element.shippingMethodUri = 'https://demo.api/hapi/shipping_methods/0';
      await element.requestUpdate();

      element.data!._embedded['fx:shipping_services'].forEach((_, index) => {
        expect(items[index]).to.have.attribute(
          'shipping-method-uri',
          'https://demo.api/hapi/shipping_methods/0'
        );
      });
    });

    it('passes international-allowed value to item elements', async () => {
      const router = createRouter();

      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/hapi/shipping_services"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');

      element.data!._embedded['fx:shipping_services'].forEach((_, index) => {
        expect(items[index]).to.not.have.attribute('international-allowed');
      });

      element.internationalAllowed = true;
      await element.requestUpdate();

      element.data!._embedded['fx:shipping_services'].forEach((_, index) => {
        expect(items[index]).to.have.attribute('international-allowed');
      });
    });

    it('is enabled by default', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/hapi/shipping_services"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.not.have.attribute('disabled'));
    });

    it('is disabled when element is disabled', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          gift-card-item-categories="https://demo.api/hapi/gift_card_item_categories?gift_card_id=0"
          gift-card="https://demo.api/hapi/gift_cards/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          disabled
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.have.attribute('disabled'));
    });

    it('is editable by default', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/hapi/shipping_services"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.not.have.attribute('readonly'));
    });

    it('is readonly when element is readonly', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          gift-card-item-categories="https://demo.api/hapi/gift_card_item_categories?gift_card_id=0"
          gift-card="https://demo.api/hapi/gift_cards/0"
          group="test"
          href="https://demo.api/hapi/item_categories?limit=5"
          lang="es"
          ns="foo"
          readonly
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const items = await getByTestClass(element, 'item');
      items.forEach(item => expect(item).to.have.attribute('readonly'));
    });

    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/virtual/stall"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ busy: 'fetching' }));
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('infer', '');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/virtual/empty?status=500"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in('fail'));
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('infer', '');
    });

    it('hides spinner once loaded', async () => {
      const router = createRouter();
      const element = await fixture<Page>(html`
        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri="https://demo.api/hapi/store_shipping_services"
          shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
          href="https://demo.api/hapi/shipping_services"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('infer', '');
    });
  });
});
