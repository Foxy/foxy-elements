import { expect, fixture, html, elementUpdated } from '@open-wc/testing';
import { QuickOrderProduct } from './types';
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

  it('Should require name and price', async () => {
    let el: TestProductItem = await fixture(
      html` <x-productitem name="p1" price="10" currency="usd"></x-productitem> `
    );
    await elementUpdated(el);
    expect(logSpy.calledWith('The name attribute of a product is required.')).to.be.false;
    expect(logSpy.calledWith('The price attribute of a product is required.')).to.be.false;
    logSpy.reset();
    el = await fixture(html` <x-productitem name="p2" currency="usd"></x-productitem> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('The price attribute of a product is required.')).to.be.true;
    logSpy.reset();
    el = await fixture(html` <x-productitem price="10" currency="usd"></x-productitem> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('The name attribute of a product is required.')).to.be.true;
  });

  it('Prices should be zero or positive', async () => {
    let el = await fixture(
      html` <x-productitem name="p1" price="10" currency="usd"></x-productitem> `
    );
    await elementUpdated(el);
    expect(logSpy.calledWith('Product added with negative price.')).to.be.false;
    el = await fixture(
      html` <x-productitem name="p1" price="-10" currency="usd"></x-productitem> `
    );
    await elementUpdated(el);
    expect(logSpy.calledWith('Product added with negative price.')).to.be.true;
  });

  it('Should validate minimum quantity in attribute', async () => {
    const el = await fixture(html`
      <x-productitem
        name="p1"
        price="10"
        quantity="1"
        quantity_min="2"
        currency="usd"
      ></x-productitem>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Quantity amount is less than minimum quantity.')).to.be.true;
  });

  it('Should validate maximum quantity in attribute', async () => {
    const el = await fixture(html`
      <x-productitem
        name="p1"
        price="10"
        quantity="3"
        quantity_max="2"
        currency="usd"
      ></x-productitem>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Quantity amount is more than maximum quantity.')).to.be.true;
  });
});

describe('The product item reveals its state to the user', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  it('Should look like removed when quantity is zero', async () => {
    const el = await fixture(
      html` <x-productitem name="p1" price="10" currency="usd"></x-productitem> `
    );
    await elementUpdated(el);
    const xNumber = qtyField(el);
    xNumber.value = '0';
    xNumber.dispatchEvent(new CustomEvent('change'));
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('.removed')).to.not.be.empty;
  });

  it('Should look like modified when modified by the user', async () => {
    const el = await fixture(
      html` <x-productitem name="p1" price="10" currency="usd"></x-productitem> `
    );
    const modified = (e: Element) => e.shadowRoot!.querySelectorAll('.modified');
    expect(modified(el).length).to.equal(0);
    const xNumber = qtyField(el);
    xNumber.value = '2';
    xNumber.dispatchEvent(new CustomEvent('change'));
    await elementUpdated(el);
    expect(modified(el).length).to.equal(1);
  });
});

describe('The product item accepts custom parameters', async () => {
  it('Should accept custom parameters', async () => {
    const el = await fixture(
      html`<x-productitem
        name="p1"
        price="10"
        material="rubber"
        size="10"
        currency="usd"
      ></x-productitem> `
    );
    await elementUpdated(el);
    const product: QuickOrderProduct = (el as ProductItem).value;
    expect(product.price).to.equal('10');
    expect(product.name).to.equal('p1');
    expect(product.material).to.equal('rubber');
    expect(product.size).to.equal('10');
  });
});

/** Helper functions */

function qtyField(el: Element): HTMLInputElement {
  const qtyWidget = el.shadowRoot!.querySelector('[name=quantity]');
  expect(qtyWidget).to.exist;
  const xNumber = qtyWidget as HTMLInputElement;
  return xNumber;
}
