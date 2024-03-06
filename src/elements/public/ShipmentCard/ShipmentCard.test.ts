import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { ShipmentCard } from './ShipmentCard';
import { getByKey } from '../../../testgen/getByKey';
import { html } from 'lit-html';

describe('ShipmentCard', () => {
  it('imports and defines foxy-internal-card', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-shipment-card', () => {
    expect(customElements.get('foxy-shipment-card')).to.equal(ShipmentCard);
  });

  it('renders shipping address', async () => {
    const router = createRouter();
    const element = await fixture<ShipmentCard>(html`
      <foxy-shipment-card
        href="https://demo.api/hapi/shipments/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipment-card>
    `);

    await waitUntil(() => element.isBodyReady);
    const address = await getByKey(element, 'full_address');
    const { address_name, address1, address2, city, region, postal_code } = element.data!;

    expect(address).to.exist;
    expect(address).to.have.attribute('infer', '');
    expect(address).to.have.deep.property('options', {
      address_name,
      address1,
      address2,
      city,
      region,
      postal_code,
    });
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

    await waitUntil(() => element.isBodyReady);

    element.data!.shipping_service_description = 'Test service';
    element.data = { ...element.data! };
    await element.requestUpdate();

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

    await waitUntil(() => element.isBodyReady);

    element.data!.total_shipping = 123;
    element.data = { ...element.data! };

    await element.requestUpdate();
    const price = element.renderRoot.querySelector('foxy-i18n[key="price"]');

    expect(price).to.exist;
    expect(price).to.have.property('infer', '');
    expect(price).to.have.deep.property('options', {
      amount: '123 USD',
      currencyDisplay: 'code',
    });
  });

  it('renders items if they are present', async () => {
    const router = createRouter();
    const element = await fixture<ShipmentCard>(html`
      <foxy-shipment-card
        href="https://demo.api/hapi/shipments/0?zoom=items:item_category"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipment-card>
    `);

    await waitUntil(() => element.isBodyReady);
    const count = await getByKey(element, 'item');

    expect(count).to.exist;
    expect(count).to.have.attribute('infer', '');
    expect(count).to.have.deep.property('options', {
      count: element.data!._embedded['fx:items'].length,
    });

    const table = element.renderRoot.querySelector('table');

    element.data?._embedded['fx:items'].forEach((item, i) => {
      expect(table!.rows.item(i)!.cells.item(0)).to.include.text(item.code);
      expect(table!.rows.item(i)!.cells.item(1)).to.include.text(item.name);
      expect(table!.rows.item(i)!.cells.item(2)).to.include.text(
        `${item.width}×${item.height}×${item.length} IN`
      );

      expect(table!.rows.item(i)!.cells.item(3)).to.include.text(`${item.weight} LBS`);

      const quantityCell = table!.rows.item(i)!.cells.item(4);
      const quantityLabel = quantityCell!.querySelector('foxy-i18n');

      expect(quantityLabel).to.exist;
      expect(quantityLabel).to.have.attribute('infer', '');
      expect(quantityLabel).to.have.deep.property('options', { count: item.quantity });
    });
  });
});
