import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../index';
import './index';

import { InternalStoreShippingMethodFormServicesPageItemContent as Content } from '../InternalStoreShippingMethodFormServicesPageItemContent/InternalStoreShippingMethodFormServicesPageItemContent';
import { InternalStoreShippingMethodFormServicesPageItem as Item } from './InternalStoreShippingMethodFormServicesPageItem';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../../server/index';
import { getByTestId } from '../../../../../testgen/getByTestId';

describe('StoreShippingMethodForm', () => {
  describe('InternalStoreShippingMethodFormServicesPage', () => {
    describe('InternalStoreShippingMethodFormServicesPageItem', () => {
      it('imports and defines foxy-internal-store-shipping-method-form-services-page-item-content', () => {
        const localName = 'foxy-internal-store-shipping-method-form-services-page-item-content';
        const element = customElements.get(localName);
        expect(element).to.equal(Content);
      });

      it('imports and defines itself as foxy-internal-store-shipping-method-form-services-page-item', () => {
        const localName = 'foxy-internal-store-shipping-method-form-services-page-item';
        const element = customElements.get(localName);
        expect(element).to.equal(Item);
      });

      it('extends NucleonElement', () => {
        expect(new Item()).to.be.instanceOf(NucleonElement);
      });

      it('has a reactive property "internationalAllowed"', () => {
        expect(new Item()).to.have.property('internationalAllowed', false);
        expect(Item).to.have.nested.property('properties.internationalAllowed');
        expect(Item).to.have.nested.property('properties.internationalAllowed.type', Boolean);
        expect(Item).to.have.nested.property(
          'properties.internationalAllowed.attribute',
          'international-allowed'
        );
      });

      it('has a reactive property "shippingServiceUri"', () => {
        expect(new Item()).to.have.property('shippingServiceUri', null);
        expect(Item).to.have.nested.property('properties.shippingServiceUri');
        expect(Item).to.not.have.nested.property('properties.shippingServiceUri.type');
        expect(Item).to.have.nested.property(
          'properties.shippingServiceUri.attribute',
          'shipping-service-uri'
        );
      });

      it('has a reactive property "shippingMethodUri"', () => {
        expect(new Item()).to.have.property('shippingMethodUri', null);
        expect(Item).to.have.nested.property('properties.shippingMethodUri');
        expect(Item).to.not.have.nested.property('properties.shippingMethodUri.type');
        expect(Item).to.have.nested.property(
          'properties.shippingMethodUri.attribute',
          'shipping-method-uri'
        );
      });

      it('renders InternalStoreShippingMethodFormServicesPageItemContent element when loaded (match found)', async () => {
        const router = createRouter();
        const createMatchRequest = new Request('https://demo.api/hapi/store_shipping_services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foo: 'bar' }),
        });

        await router.handleRequest(createMatchRequest)?.handlerPromise;

        const element = await fixture<Item>(html`
          <foxy-internal-store-shipping-method-form-services-page-item
            shipping-service-uri="https://demo.api/hapi/shipping_services/0"
            shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
            href="https://demo.api/hapi/store_shipping_services?foo=bar"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-internal-store-shipping-method-form-services-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        const match = element.data!._embedded['fx:store_shipping_services'][0];
        const defaultSlot = content.querySelector('slot:not([name])');
        const suffixSlot = content.querySelector('slot[name="suffix"]');

        expect(content).to.be.instanceOf(Content);

        expect(content).to.have.attribute('shipping-service-uri', element.shippingServiceUri!);
        expect(content).to.have.attribute('shipping-method-uri', element.shippingMethodUri!);
        expect(content).to.have.attribute('infer', '');
        expect(content).to.have.attribute('href', match._links.self.href);

        expect(defaultSlot).to.exist;
        expect(suffixSlot).to.exist;
      });

      it('renders InternalStoreShippingMethodFormServicesPageItemContent element when loaded (match not found)', async () => {
        const router = createRouter();

        const element = await fixture<Item>(html`
          <foxy-internal-store-shipping-method-form-services-page-item
            shipping-service-uri="https://demo.api/hapi/shipping_services/0"
            shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
            href="https://demo.api/hapi/store_shipping_services?foo=bar"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-internal-store-shipping-method-form-services-page-item>
        `);

        await waitUntil(() => element.in({ idle: 'snapshot' }));
        const content = (await getByTestId(element, 'content')) as HTMLElement;
        const defaultSlot = content.querySelector('slot:not([name])');
        const suffixSlot = content.querySelector('slot[name="suffix"]');

        expect(content).to.be.instanceOf(Content);

        expect(content).to.have.attribute('shipping-service-uri', element.shippingServiceUri!);
        expect(content).to.have.attribute('shipping-method-uri', element.shippingMethodUri!);
        expect(content).to.have.attribute('parent', element.href);
        expect(content).to.have.attribute('infer', '');
        expect(content).to.not.have.attribute('href');

        expect(defaultSlot).to.exist;
        expect(suffixSlot).to.exist;
      });
    });
  });
});
