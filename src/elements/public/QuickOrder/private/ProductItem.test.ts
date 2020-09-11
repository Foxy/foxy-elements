import { expect, fixture, html, elementUpdated } from '@open-wc/testing';
import { Product } from '../types';
import { ProductItem } from './ProductItem';
import * as sinon from 'sinon';

/**
 * Avoid CustomElementsRegistry collisions
 *
 * not using defineCE because lit-html doesn't support dynamic tags by default.
 */
class TestProductItem extends ProductItem {}

customElements.define('x-productitem', TestProductItem);

let logSpy: sinon.SinonStub;

describe('The product Item remain always valid', async function () {
  before(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.reset();
  });

  after(function () {
    logSpy.restore();
  });

  it('Should require name and price', async function () {
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

  it('Prices should be zero or positive', async function () {
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

  it('Should validate minimum quantity in attribute', async function () {
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

  it('Should validate maximum quantity in attribute', async function () {
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

  it('Should validate number of chars in a signature', async function () {
    const sig = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const wrongsig = 'aa';
    await fixture(html`<x-productitem
      name="p1"
      price="10"
      currency="usd"
      signatures='{
                                      "name":"${sig}",
                                            "price":"${sig}",
                                             "quantity":"${sig}",
                                              }'
    ></x-productitem> `);
    logSpy.reset();
    expect(
      logSpy.calledWith(
        'There is something wrong with the signature. It should have 64 characters.'
      )
    ).to.equal(false);
    await fixture(html`<x-productitem
      name="p1"
      price="10"
      currency="usd"
      signatures='{
                                      "name":"${wrongsig}",
                                            "price":"${sig}",
                                             "quantity":"${sig}",
                                              }'
    ></x-productitem> `);
    expect(
      logSpy.calledWith(
        'There is something wrong with the signature. It should have 64 characters.'
      )
    ).to.equal(true);
  });
});

describe('The product item reveals its state to the user', async function () {
  it('Should look like removed when quantity is zero', async function () {
    const el = await fixture(
      html` <x-productitem name="p1" price="10" currency="usd"></x-productitem> `
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('.removed')).to.be.empty;
    const xNumber = qtyField(el);
    xNumber.value = '0';
    xNumber.dispatchEvent(new CustomEvent('change'));
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('.removed')).to.not.be.empty;
  });

  it('Should look like modified when modified by the user', async function () {
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

  it('Should look like removed when it is child and has zero quantity', async function () {
    const removed = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <x-productitem name="p2" price="10" currency="usd" quantity="0"></x-productitem>
        </x-productitem>
      `
    );
    const notremoved = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <x-productitem name="p2" price="10" currency="usd"></x-productitem>
        </x-productitem>
      `
    );
    await elementUpdated(removed);
    await elementUpdated(notremoved);
    const childRemoved = removed.querySelector('[combined]');
    const childNotRemoved = notremoved.querySelector('[combined]');
    await expectSelectorToExist(childRemoved!, childNotRemoved!, 'article.removed');
  });

  it('Should show the description when it is child and a description is provided', async function () {
    const withDescription = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <x-productitem
            name="p2"
            price="10"
            currency="usd"
            description="Lorem Ipsum"
          ></x-productitem>
        </x-productitem>
      `
    );
    const withOutDescription = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <x-productitem name="p2" price="10" currency="usd"></x-productitem>
        </x-productitem>
      `
    );
    await expectSelectorToExist(
      withDescription.querySelector('[combined]')!,
      withOutDescription.querySelector('[combined]')!,
      '.description p'
    );
  });

  it('Should show the quantity when it is child quantity is 2 or more', async function () {
    const withMoreThan1 = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <x-productitem name="p2" price="10" quantity="2" currency="usd"></x-productitem>
        </x-productitem>
      `
    );
    const withOutMoreThan1 = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <x-productitem name="p2" price="10" currency="usd"></x-productitem>
        </x-productitem>
      `
    );
    await expectSelectorToExist(
      withMoreThan1.querySelector('[combined]')!,
      withOutMoreThan1.querySelector('[combined]')!,
      'article .quantity'
    );
  });
});

describe('Product item provides an interface to set values', async function () {
  it('Should accept custom parameters', async function () {
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
    const product: Product & { material?: string; size?: string } = (el as TestProductItem).value;
    expect(product.price).to.equal('10');
    expect(product.name).to.equal('p1');
    expect(product.material).to.equal('rubber');
    expect(product.size).to.equal('10');
  });

  it('Should create parameters from value object', async function () {
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
    const product = el as TestProductItem;

    product.value = {
      ...product.value,
      color: 'blue',
      strength: 50,
    };
    expect(product.getAttribute('color')).to.equal('blue');
    expect(product.getAttribute('strength')).to.equal('50');
  });
});

describe('Product item recognizes its children', async function () {
  it('Should recognize children created with slots', async function () {
    const el = await fixture(
      html`
        <x-productitem name="p1" price="10" currency="usd">
          <div slot="product" class="bundled">
            <x-productitem name="p2" price="3"></x-productitem>
            <x-productitem name="p3" price="4"></x-productitem>
          </div>
        </x-productitem>
      `
    );
    await elementUpdated(el);
    expect((el as TestProductItem).total).to.equal(17);
  });

  it('Should recognize children created products array', async function () {
    const el = await fixture(
      html`
        <x-productitem
          name="p1"
          price="10"
          currency="usd"
          products='[{"name":"p2","price":3}, {"name":"p3","price":4}]'
        ></x-productitem>
      `
    );
    await elementUpdated(el);
    expect((el as TestProductItem).total).to.equal(17);
  });

  it('Should recognize children added by setting "value" attribute', async function () {
    const el = await fixture(
      html` <x-productitem name="p1" price="10" currency="usd"></x-productitem> `
    );
    (el as TestProductItem).value = { products: [{ name: 'p2', price: 8 }] };
    await elementUpdated(el);
    expect((el as TestProductItem).total).to.equal(18);
  });
});

/** Helper functions */

function qtyField(el: Element): HTMLInputElement {
  const qtyWidget = el.shadowRoot!.querySelector('[name=quantity]');
  expect(qtyWidget).to.exist;
  const xNumber = qtyWidget as HTMLInputElement;
  return xNumber;
}

async function expectSelectorToExist(
  elementWith: Element,
  elementWithOut: Element,
  selector: string,
  shadow = true
) {
  expect(elementWith).to.exist;
  expect(elementWithOut).to.exist;
  await elementUpdated(elementWith);
  await elementUpdated(elementWithOut);
  if (shadow) {
    expect(elementWith.shadowRoot!.querySelector(selector)).to.exist;
    expect(elementWithOut.shadowRoot!.querySelector(selector)).not.to.exist;
  } else {
    expect(elementWith.querySelector(selector)).to.exist;
    expect(elementWithOut.querySelector(selector)).not.to.exist;
  }
}
