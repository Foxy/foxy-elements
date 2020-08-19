import { expect, fixture, html, elementUpdated } from '@open-wc/testing';
import { ProductItem } from './ProductItem';
import * as sinon from 'sinon';

/**
 * Avoid CustomElementsRegistry collisions
 *
 * not using defineCE because lit-html doesn't support dynamic tags by default.
 */
class TestProductItem extends ProductItem {}

customElements.define('x-productitem', TestProductItem);

describe('The product Item remain always valid', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  it('Prices should be zero or positive', async () => {
    let el = await fixture(html` <x-productitem name="p1" price="10"></x-productitem> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Product added with negative price')).to.be.false;
    el = await fixture(html` <x-productitem name="p1" price="-10"></x-productitem> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Product added with negative price')).to.be.true;
  });

  it('Should validade zero quantity on adding to form', async () => {
    const el = await fixture(html`
      <x-productitem name="p1" price="10" quantity="0"></x-productitem>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Product added with zero quantity')).to.be.true;
  });

  it('Should validate minimum quantity in attribute', async () => {
    const el = await fixture(html`
      <x-productitem name="p1" price="10" quantity="1" quantity_min="2"></x-productitem>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Quantity amount is less than minimum quantity')).to.be.true;
  });

  it('Should validate maximum quantity in attribute', async () => {
    const el = await fixture(html`
      <x-productitem name="p1" price="10" quantity="3" quantity_max="2"></x-productitem>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Quantity amount is more than maximum quantity')).to.be.true;
  });
});
