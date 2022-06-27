import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html } from 'lit-html';
import { stub } from 'sinon';
import { createRouter } from '../../../server/index';
import { InternalAsyncDetailsControl } from '../../internal/InternalAsyncDetailsControl';
import { AddressCard } from '../AddressCard';
import { FormDialog } from '../FormDialog';
import { FormRenderer } from '../FormDialog/types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { ShipmentCard } from './index';

describe('ShipmentCard', () => {
  it('imports and defines foxy-internal-async-details-control', () => {
    expect(customElements.get('foxy-internal-async-details-control')).to.exist;
  });

  it('imports and defines foxy-internal-card', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-address-card', () => {
    expect(customElements.get('foxy-address-card')).to.exist;
  });

  it('imports and defines foxy-item-card', () => {
    expect(customElements.get('foxy-item-card')).to.exist;
  });

  it('imports and defines foxy-item-form', () => {
    expect(customElements.get('foxy-item-form')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-shipment-card', () => {
    expect(customElements.get('foxy-shipment-card')).to.equal(ShipmentCard);
  });

  it('renders shipping address in a foxy-address-card', async () => {
    const router = createRouter();
    const element = await fixture<ShipmentCard>(html`
      <foxy-shipment-card
        href="https://demo.api/hapi/shipments/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipment-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const addressCard = element.renderRoot.querySelector('foxy-address-card') as AddressCard;

    expect(addressCard).to.exist;
    expect(addressCard).to.have.property('infer', 'address');
    expect(addressCard).to.have.property('href', element.data!._links['fx:customer_address'].href);
    expect(addressCard.hiddenSelector.toString()).to.equal('not=full-address');
  });

  it('renders shipping service description', async () => {
    const router = createRouter();
    const element = await fixture<ShipmentCard>(html`
      <foxy-shipment-card
        href="https://demo.api/hapi/shipments/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipment-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.shipping_service_description = 'Test service';
    element.data = { ...element.data! };
    await element.updateComplete;

    expect(element.renderRoot).to.include.text('Test service');
  });

  it('renders shipping price', async () => {
    const router = createRouter();
    const element = await fixture<ShipmentCard>(html`
      <foxy-shipment-card
        href="https://demo.api/hapi/shipments/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipment-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.total_shipping = 123;
    element.data = { ...element.data! };

    await element.updateComplete;
    const price = element.renderRoot.querySelector('foxy-i18n[key="price"]');

    expect(price).to.exist;
    expect(price).to.have.property('infer', '');
    expect(price).to.have.deep.property('options', {
      amount: '123 USD',
      currencyDisplay: 'code',
    });
  });

  it('renders items in an internal control', async () => {
    const router = createRouter();
    const element = await fixture<ShipmentCard>(html`
      <foxy-shipment-card
        href="https://demo.api/hapi/shipments/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipment-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.total_shipping = 123;
    element.data = { ...element.data! };

    await element.updateComplete;
    const details = element.renderRoot.querySelector(
      'foxy-internal-async-details-control'
    ) as InternalAsyncDetailsControl;

    expect(details).to.exist;
    expect(details).to.have.property('infer', 'items');
    expect(details).to.have.property('limit', 5);
    expect(details).to.have.property('open', true);
    expect(details).to.have.property('item', 'foxy-item-card');
    expect(details).to.have.property(
      'first',
      'https://demo.api/hapi/items?shipment_id=0&zoom=item_options'
    );

    const form = details.form as FormRenderer;
    const handleFetch = stub();
    const handleUpdate = stub();
    const renderedForm = await fixture(
      form({
        html,
        dialog: { href: 'test-href', parent: 'test-parent' } as FormDialog,
        handleFetch,
        handleUpdate,
      })
    );

    expect(renderedForm).to.have.property(
      'customerAddresses',
      'https://demo.api/hapi/customer_addresses?customer_id=0'
    );

    expect(renderedForm).to.have.property(
      'itemCategories',
      'https://demo.api/hapi/item_categories?store_id=0'
    );

    expect(renderedForm).to.have.property('coupons', 'https://demo.api/hapi/coupons?store_id=0');
    expect(renderedForm).to.have.property('parent', 'test-parent');
    expect(renderedForm).to.have.property('infer', '');
    expect(renderedForm).to.have.property('href', 'test-href');

    const fetchEvent = new CustomEvent('fetch');
    const updateEvent = new CustomEvent('update');

    renderedForm.dispatchEvent(fetchEvent);
    renderedForm.dispatchEvent(updateEvent);

    expect(handleFetch).to.have.been.calledWith(fetchEvent);
    expect(handleUpdate).to.have.been.calledWith(updateEvent);
  });
});
