import { fixture, expect, html, elementUpdated } from '@open-wc/testing';
import * as sinon from 'sinon';
import { Price } from './Price';

/**
 * Avoid CustomElementsRegistry collisions
 *
 * not using defineCE because lit-html doesn't support dynamic tags by default.
 */
class TestPrice extends Price {}

customElements.define('x-price', TestPrice);

describe('Price shows the combined price of bundled products', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  it('Should show a simple price', async () => {
    const el = await fixture(html`
      <x-price .price=${10} .prices=${[]} .currency=${'usd'} .quantity=${2}> </x-price>
    `);
    await elementUpdated(el);
    const elPriceTotal = el.shadowRoot?.querySelector('.price.total');
    expect(elPriceTotal).to.exist;
    expect(trim(elPriceTotal!.textContent!)).to.equal('$20.00');
  });

  it('Should add child prices', async () => {
    const el = await fixture(html`
      <x-price .price=${10} .prices=${[3, 2]} .currency=${'usd'} .quantity=${2}> </x-price>
    `);
    await elementUpdated(el);
    const elPriceTotal = el.shadowRoot?.querySelector('.price.total');
    expect(elPriceTotal).to.exist;
    expect(trim(elPriceTotal!.textContent!)).to.equal('$30.00');
  });
});

describe('Price is clear about price composition', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  const el = await fixture(html`
    <x-price .price=${10} .prices=${[3, 2]} .currency=${'usd'} .quantity=${2}> </x-price>
  `);

  it('Should show quantity if it is greater than 1', async () => {
    await elementUpdated(el);
    const elQuantity = el.shadowRoot?.querySelector('.quantity.times');
    expect(elQuantity).to.exist;
    expect(trim(elQuantity!.textContent!)).to.equal('×2');
  });

  it('Should show unit price if quantity is greater than 1', async () => {
    await elementUpdated(el);
    const elUnitPrice = el.shadowRoot?.querySelector('.price.each');
    expect(elUnitPrice).to.exist;
    expect(trim(elUnitPrice!.textContent!)).to.equal('$10.00');
  });

  it('Should show component prices', async () => {
    await elementUpdated(el);
    const elPartsPrice = el.shadowRoot?.querySelector('.price.parts');
    expect(elPartsPrice).to.exist;
    expect(trim(elPartsPrice!.textContent!)).to.contain('$3.00 + $2.00');
  });

  it('Should aggregate component prices if there are more than 3', async () => {
    const el = await fixture(html`
      <x-price .price=${10} .prices=${[3, 2, 1, 9, 8]} .currency=${'usd'} .quantity=${2}> </x-price>
    `);
    await elementUpdated(el);
    const elPartsPrice = el.shadowRoot?.querySelector('.price.parts');
    expect(elPartsPrice).to.exist;
    expect(trim(elPartsPrice!.textContent!)).to.contain('$23.00');
  });
});

describe('Price respond to changes', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  const el = await fixture(html`
    <x-price .price=${10} .prices=${[3, 2]} .currency=${'usd'} .quantity=${2}> </x-price>
  `);

  it('Should update quantity', async () => {
    await elementUpdated(el);
    let elQuantity = el.shadowRoot?.querySelector('.quantity.times');
    expect(elQuantity).to.exist;
    expect(trim(elQuantity!.textContent!)).to.equal('×2');
    (el as TestPrice).quantity = 1;
    await elementUpdated(el);
    elQuantity = el.shadowRoot?.querySelector('.quantity.times');
    expect(elQuantity).not.to.exist;
  });

  it('Should update price', async () => {
    await elementUpdated(el);
    const elUnitPrice = el.shadowRoot?.querySelector('.price.each');
    (el as TestPrice).price = 11;
    await elementUpdated(el);
    expect(elUnitPrice).to.exist;
    expect(trim(elUnitPrice!.textContent!)).to.equal('$11.00');
  });

  it('Should update parts', async () => {
    await elementUpdated(el);
    let elPartsPrice = el.shadowRoot?.querySelector('.price.parts');
    expect(elPartsPrice).to.exist;
    (el as TestPrice).prices = null;
    await elementUpdated(el);
    elPartsPrice = el.shadowRoot?.querySelector('.price.parts');
    expect(elPartsPrice).not.to.exist;
  });

  it('Should update aggregation', async () => {
    const el = await fixture(html`
      <x-price .price=${10} .prices=${[3, 2]} .currency=${'usd'} .quantity=${2}> </x-price>
    `);
    await elementUpdated(el);
    let elPartsPrice = el.shadowRoot?.querySelector('.price.parts');
    expect(elPartsPrice).to.exist;
    expect(trim(elPartsPrice!.textContent!)).to.contain('$3.00 + $2.00');
    (el as TestPrice).prices = [3, 2, 1, 9, 8];
    await elementUpdated(el);
    elPartsPrice = el.shadowRoot?.querySelector('.price.parts');
    expect(trim(elPartsPrice!.textContent!)).to.contain('$23.00');
  });
});
/** Helper functions */

function trim(str: string): string {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
