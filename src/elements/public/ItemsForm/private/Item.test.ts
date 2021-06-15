import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { ItemInterface } from '../types';
import { Item } from './Item';
import * as sinon from 'sinon';

/**
 * Avoid CustomElementsRegistry collisions
 *
 * not using defineCE because lit-html doesn't support dynamic tags by default.
 */
class TestItem extends Item {}

customElements.define('test-item', TestItem);

let logSpy: sinon.SinonStub;

describe('The item remain always valid', async function () {
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
    let el: TestItem = await fixture(
      html` <test-item name="p1" quantity="1" price="10"></test-item> `
    );
    await elementUpdated(el);
    expect(logSpy.calledWith('The name attribute of an item is required.')).to.be.false;
    expect(logSpy.calledWith('The price attribute of an item is required.')).to.be.false;
    logSpy.reset();
    el = await fixture(html` <test-item name="p2"></test-item> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('The price attribute of an item is required.')).to.be.true;
    logSpy.reset();
    el = await fixture(html` <test-item quantity="1" price="10"></test-item> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('The name attribute of an item is required.')).to.be.true;
  });

  it('Should default quantity to zero', async function () {
    const el: TestItem = await fixture(html` <test-item name="p1" price="10"></test-item> `);
    await elementUpdated(el);
    expect(el.quantity).to.equal(0);
  });

  it('Prices should be zero or positive', async function () {
    let el = await fixture(html` <test-item name="p1" quantity="1" price="10"></test-item> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Item added with negative price.')).to.be.false;
    el = await fixture(html` <test-item name="p1" quantity="1" price="-10"></test-item> `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Item added with negative price.')).to.be.true;
  });

  it('Should validate minimum quantity in attribute', async function () {
    const el = await fixture(html`
      <test-item name="p1" price="10" quantity="1" quantity_min="2"></test-item>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Quantity amount is less than minimum quantity.')).to.be.true;
  });

  it('Should validate maximum quantity in attribute', async function () {
    const el = await fixture(html`
      <test-item name="p1" price="10" quantity="3" quantity_max="2"></test-item>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Quantity amount is more than maximum quantity.')).to.be.true;
  });

  it('Should validate number of chars in a signature', async function () {
    const sig = '0123456789012345678901234567890123456789012345678901234567890123';
    const wrongsig = 'aa';
    await fixture(html`<test-item
      name="p1"
      quantity="1"
      price="10"
      signatures='{ "name":"${sig}", "price":"${sig}", "quantity":"${sig}"}'
    ></test-item> `);
    expect(
      logSpy.calledWith(
        'There is something wrong with the signature. It should have 64 characters.'
      )
    ).to.equal(false);
    logSpy.reset();
    await fixture(html`<test-item
      name="p1"
      quantity="1"
      price="10"
      signatures='{ "name":"${wrongsig}", "price":"${sig}", "quantity":"${sig}"}'
    ></test-item> `);
    expect(
      logSpy.calledWith(
        'There is something wrong with the signature. It should have 64 characters.'
      )
    ).to.equal(true);
  });
});

describe('The item reveals its state to the user', async function () {
  before(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.reset();
  });

  after(function () {
    logSpy.restore();
  });

  it('Should look like removed when quantity is zero', async function () {
    const el = await fixture(html` <test-item name="p1" quantity="1" price="10"></test-item> `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('.removed')).to.be.empty;
    const xNumber = qtyField(el);
    xNumber.value = '0';
    xNumber.dispatchEvent(new CustomEvent('change'));
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('.removed')).to.not.be.empty;
  });

  it('Should look like modified when modified by the user', async function () {
    const el = await fixture(html` <test-item name="p1" quantity="1" price="10"></test-item> `);
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
        <test-item name="p1" quantity="1" price="10">
          <test-item name="p2" price="10" quantity="0"></test-item>
        </test-item>
      `
    );
    const notremoved = await fixture(
      html`
        <test-item name="p1" quantity="1" price="10">
          <test-item name="p2" quantity="1" price="10"></test-item>
        </test-item>
      `
    );
    await elementUpdated(removed);
    await elementUpdated(notremoved);
    const childRemoved = removed.querySelector('[data-bundled]');
    const childNotRemoved = notremoved.querySelector('[data-bundled]');
    await expectSelectorToExist(childRemoved!, childNotRemoved!, 'article.removed');
  });

  it('Should show the quantity when it is child quantity is 2 or more', async function () {
    const withMoreThan1 = await fixture(
      html`
        <test-item name="p1" quantity="1" price="10">
          <test-item name="p2" price="10" quantity="2"></test-item>
        </test-item>
      `
    );
    const withOutMoreThan1 = await fixture(
      html`
        <test-item name="p1" quantity="1" price="10">
          <test-item name="p2" quantity="1" price="10"></test-item>
        </test-item>
      `
    );
    await expectSelectorToExist(
      withMoreThan1.querySelector('[data-bundled]')!,
      withOutMoreThan1.querySelector('[data-bundled]')!,
      'article .quantity'
    );
  });

  it('Should allow value to be retrieved', async function () {
    const el = await fixture(
      html`
        <test-item name="parent" quantity="1" price="10">
          <test-item name="child1" price="10" quantity="2"></test-item>
          <test-item name="child2" price="10" quantity="2"></test-item>
        </test-item>
      `
    );
    await elementUpdated(el);
    const i = el as Item;
    const v = i.value as ItemInterface;
    expect(v.name).to.equal('parent');
    expect(v.items).to.exist;
    expect(v.items![0].name).to.equal('child1');
    expect(v.items![0].name).to.equal('child1');
  });
});

describe('Item provides an interface to set values', async function () {
  before(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.reset();
  });

  after(function () {
    logSpy.restore();
  });

  it('Should accept custom parameters', async function () {
    const el = await fixture(
      html`<test-item name="p1" quantity="1" price="10" material="rubber" size="10"></test-item> `
    );
    await elementUpdated(el);
    const item: ItemInterface & { material?: string; size?: string } = (el as TestItem).value;
    expect(item.price).to.equal('10');
    expect(item.name).to.equal('p1');
    expect(item.material).to.equal('rubber');
    expect(item.size).to.equal('10');
  });

  it('Should create parameters from value object', async function () {
    const el = await fixture(
      html`<test-item name="p1" quantity="1" price="10" material="rubber" size="10"></test-item> `
    );
    await elementUpdated(el);
    const item = el as TestItem;

    item.value = {
      ...item.value,
      color: 'blue',
      strength: 50,
    };
    expect(item.getAttribute('color')).to.equal('blue');
    expect(item.getAttribute('strength')).to.equal('50');
  });
});

describe('Item recognizes its children', async function () {
  before(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.reset();
  });

  after(function () {
    logSpy.restore();
  });

  it('Should recognize children created with slots', async function () {
    const el = await fixture(
      html`
        <test-item name="p1" quantity="1" price="10">
          <div slot="items" class="bundled">
            <test-item name="p2" quantity="1" price="3"></test-item>
            <test-item name="p3" quantity="1" price="4"></test-item>
          </div>
        </test-item>
      `
    );
    await elementUpdated(el);
    expect((el as TestItem).total).to.equal(17);
  });

  it('Should recognize children created items array', async function () {
    const el = await fixture(
      html`
        <test-item
          name="p1"
          quantity="1"
          price="10"
          items='[{"name":"p2","quantity":1, "price":3}, {"name":"p3","price":4,"quantity":1}]'
        ></test-item>
      `
    );
    await elementUpdated(el);
    expect((el as TestItem).total).to.equal(17);
  });

  it('Should recognize children added by setting "value" attribute', async function () {
    const el = await fixture(html` <test-item name="p1" quantity="1" price="10"></test-item> `);
    (el as TestItem).value = { items: [{ name: 'p2', price: 8, quantity: 1 }] };
    await elementUpdated(el);
    expect((el as TestItem).total).to.equal(18);
  });
});

describe('Item builds its signed names', async () => {
  it('Prepends ids to the field names', async function () {
    const layout = html`<test-item name="p1" quantity="1"></test-item>`;
    const element = await fixture<TestItem>(layout);
    expect(element.signedName('quantity')).to.match(/^\d+:quantity.*/);
  });
});

describe('Item displays price and total amount', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  it('Should display nothing without price and currency', async () => {
    const layout = html`<test-item name="p1" quantity="1"></test-item>`;
    const element = await fixture<TestItem>(layout);
    const totalPrice = element.shadowRoot!.querySelector('.price-total');
    const singlePrice = element.shadowRoot!.querySelector('.price');

    expect(singlePrice).to.not.exist;
    expect(totalPrice).to.not.exist;
  });

  it('Should display only item price with quantity === 1', async () => {
    const layout = html`<test-item name="p1" quantity="1" currency="usd" price="20"></test-item>`;
    const element = await fixture<TestItem>(layout);
    const totalPrice = element.shadowRoot!.querySelector('.price-total');
    const singlePrice = element.shadowRoot!.querySelector('.price');

    expect(singlePrice).to.contain.text('$20.00');
    expect(totalPrice).to.not.exist;
  });

  it('Should display both item and total prices with quantity > 1', async () => {
    const layout = html`<test-item name="p1" quantity="2" currency="usd" price="20"></test-item>`;
    const element = await fixture<TestItem>(layout);
    const totalPrice = element.shadowRoot!.querySelector('.price-total');
    const singlePrice = element.shadowRoot!.querySelector('.price');

    expect(singlePrice).to.contain.text('$20.00');
    expect(totalPrice).to.have.property('key', 'price.total');
    expect(totalPrice).to.have.deep.property('opts', { amount: '$40.00' });
  });

  it('Should combine child prices into total', async () => {
    const layout = html`
      <test-item name="p1" quantity="2" currency="usd" price="0">
        <test-item name="p2" quantity="2" currency="usd" price="2.5"></test-item>
        <test-item name="p3" quantity="1" currency="usd" price="15"></test-item>
      </test-item>
    `;

    const element = await fixture<TestItem>(layout);
    const totalPrice = element.shadowRoot!.querySelector('.price-total');
    const singlePrice = element.shadowRoot!.querySelector('.price');

    expect(singlePrice).to.contain.text('$20.00');
    expect(totalPrice).to.have.property('key', 'price.total');
    expect(totalPrice).to.have.deep.property('opts', { amount: '$40.00' });
  });
});

/** Helper functions */

/**
 * @param el
 */
function qtyField(el: Element): HTMLInputElement {
  const qtyWidget = el.shadowRoot!.querySelector('[name=quantity]');
  expect(qtyWidget).to.exist;
  const xNumber = qtyWidget as HTMLInputElement;
  return xNumber;
}

/**
 * @param elementWith
 * @param elementWithOut
 * @param selector
 * @param shadow
 */
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
