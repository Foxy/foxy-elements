import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../index';
import './index';

import { InternalStoreShippingMethodFormServicesPageItemContent as Content } from './InternalStoreShippingMethodFormServicesPageItemContent';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../../server/index';
import { getByTestId } from '../../../../../testgen/getByTestId';
import { stub } from 'sinon';

describe('StoreShippingMethodForm', () => {
  describe('InternalStoreShippingMethodFormServicesPage', () => {
    describe('InternalStoreShippingMethodFormServicesPageItem', () => {
      describe('InternalStoreShippingMethodFormServicesPageItemContent', () => {
        it('imports and defines vaadin-checkbox', () => {
          expect(customElements.get('vaadin-checkbox')).to.exist;
        });

        it('imports and defines itself as foxy-internal-store-shipping-method-form-services-page-item-content', () => {
          const localName = 'foxy-internal-store-shipping-method-form-services-page-item-content';
          const element = customElements.get(localName);
          expect(element).to.equal(Content);
        });

        it('extends NucleonElement', () => {
          expect(new Content()).to.be.instanceOf(NucleonElement);
        });

        it('has a reactive property "shippingServiceUri"', () => {
          expect(new Content()).to.have.property('shippingServiceUri', null);
          expect(Content).to.have.nested.property('properties.shippingServiceUri');
          expect(Content).to.not.have.nested.property('properties.shippingServiceUri.type');
          expect(Content).to.have.nested.property(
            'properties.shippingServiceUri.attribute',
            'shipping-service-uri'
          );
        });

        it('has a reactive property "shippingMethodUri"', () => {
          expect(new Content()).to.have.property('shippingMethodUri', null);
          expect(Content).to.have.nested.property('properties.shippingMethodUri');
          expect(Content).to.not.have.nested.property('properties.shippingMethodUri.type');
          expect(Content).to.have.nested.property(
            'properties.shippingMethodUri.attribute',
            'shipping-method-uri'
          );
        });

        it("renders unchecked vaadin-checkbox element if store shipping service doesn't exist", async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          const slot = checkbox.querySelector('slot:not([name])');

          expect(checkbox).to.be.instanceOf(customElements.get('vaadin-checkbox'));
          expect(checkbox).to.not.have.attribute('checked');
          expect(slot).to.exist;
        });

        it('renders checked vaadin-checkbox element if store shipping service exists', async () => {
          const router = createRouter();
          const createMatchRequest = new Request('https://demo.api/hapi/store_shipping_services', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({}),
          });

          const matchResponse = await router.handleRequest(createMatchRequest)?.handlerPromise;
          const matchLink = (await matchResponse.json())._links.self.href;
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              href=${matchLink}
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'snapshot' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          const slot = checkbox.querySelector('slot:not([name])');

          expect(checkbox).to.be.instanceOf(customElements.get('vaadin-checkbox'));
          expect(checkbox).to.have.attribute('checked');
          expect(slot).to.exist;
        });

        it('deletes store shipping service once unchecked', async () => {
          const router = createRouter();
          const createMatchRequest = new Request('https://demo.api/hapi/store_shipping_services', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({}),
          });

          const matchResponse = await router.handleRequest(createMatchRequest)?.handlerPromise;
          const matchLink = (await matchResponse.json())._links.self.href;
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              href=${matchLink}
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'snapshot' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as CheckboxElement;
          const deleteMethod = stub(element, 'delete');

          checkbox.checked = false;
          checkbox.dispatchEvent(new CustomEvent('change'));

          expect(deleteMethod).to.have.been.called;

          deleteMethod.restore();
        });

        it('creates store shipping service once checked', async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              shipping-service-uri="https://demo.api/hapi/shipping_services/0"
              shipping-method-uri="https://demo.api/hapi/shipping_methods/0"
              parent="https://demo.api/hapi/store_shipping_services"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as CheckboxElement;
          const submitMethod = stub(element, 'submit');

          checkbox.checked = true;
          checkbox.dispatchEvent(new CustomEvent('change'));

          expect(element).to.have.nested.property(
            'form.shipping_service_uri',
            element.shippingServiceUri
          );

          expect(element).to.have.nested.property(
            'form.shipping_method_uri',
            element.shippingMethodUri
          );

          expect(submitMethod).to.have.been.called;

          submitMethod.restore();
        });

        it('is enabled by default', async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.not.have.attribute('disabled');
        });

        it('is disabled when element is disabled', async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              disabled
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.have.attribute('disabled');
        });

        it('is disabled when element is loading data', async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              href="https://demo.api/virtual/stall"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ busy: 'fetching' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.have.attribute('disabled');
        });

        it('is editable by default', async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.not.have.attribute('readonly');
        });

        it('is readonly when element is readonly', async () => {
          const router = createRouter();
          const element = await fixture<Content>(html`
            <foxy-internal-store-shipping-method-form-services-page-item-content
              readonly
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-store-shipping-method-form-services-page-item-content>
          `);

          await waitUntil(() => element.in({ idle: 'template' }));
          const checkbox = (await getByTestId(element, 'checkbox')) as HTMLElement;
          expect(checkbox).to.have.attribute('readonly');
        });
      });
    });
  });
});
