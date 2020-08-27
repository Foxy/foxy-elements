import { fixture, expect, html, elementUpdated, nextFrame, oneEvent } from '@open-wc/testing';
import * as sinon from 'sinon';
import { QuickOrder } from './QuickOrder';
import { Product } from './types';
import { MockProduct } from '../../../mocks/ProductItem';

/**
 * Avoid CustomElementsRegistry collisions
 *
 * not using defineCE because lit-html doesn't support dynamic tags by default.
 */
class TestQuickOrder extends QuickOrder {
  createProduct(p: Product) {
    return new MockProduct();
  }
}

customElements.define('x-form', TestQuickOrder);
customElements.define('x-item', MockProduct);

describe('The form should allow new products to be added', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  it('Should recognize new products added as JS array', async () => {
    const el = await fixture(html`
      <x-form
        store="test.foxycart.com"
        currency="usd"
        products='[{"name":"Cub Puppy","price":"75.95"},{"name":"Bird Dog","price":"64.95"}]'
      >
      </x-form>
    `);
    await elementUpdated(el);
    const products = el.querySelectorAll('[product]');
    expect(products).to.have.lengthOf(2);
  });

  it('Should recognize new products added as product item tags', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="10"></x-item>
        <x-item name="p2" price="10"></x-item>
        <x-item name="p3" price="10"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    // Products will be found in the DOM even if not recognized by QuickOrder
    // So we check if the price was properly updated
    expect((el as QuickOrder).total).to.equal(30);
  });

  it('Should recognize changes to JS array', async () => {
    const el = await fixture(html`
      <x-form
        currency="usd"
        store="test.foxycart.com"
        products='[{"name": "p1", "price": "1"}, {"name": "p2", "price": "2"}]'
      ></x-form>
    `);
    await elementUpdated(el);
    let products = el.querySelectorAll('[product]');
    expect(products).to.have.lengthOf(2);
    // Increase the number of products
    (el as QuickOrder).products = [
      { name: 'p1', price: 1 },
      { name: 'p2', price: 2 },
      { name: 'p3', price: 3 },
    ];
    await elementUpdated(el);
    products = el.querySelectorAll('[product]');
    expect(products).to.have.lengthOf(3);
    // Decrease the number of products
    (el as QuickOrder).products = [(el as QuickOrder).products[0]];
    await elementUpdated(el);
    products = el.querySelectorAll('[product]');
    expect(products).to.have.lengthOf(1);
  });

  it('Should recognize new products added later as product item tags', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="20.00"></x-item>
        <x-item name="p2" price="20.00"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    expect((el as QuickOrder).total).to.equal(40);
    const lateProduct = new MockProduct();
    el.appendChild(lateProduct);
    await elementUpdated(el);
    expect((el as QuickOrder).total).to.equal(60);
  });

  it('Should recognize child products removed from the DOM', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item id="first" name="p1" price="10.00"></x-item>
        <x-item id="second" name="p2" price="10.00"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    const toRemove = el.querySelector('#first');
    if (toRemove) {
      el.removeChild(toRemove);
    }
    await elementUpdated(el);
    expect((el as QuickOrder).total).to.equal(10);
  });
});

describe('The form should remain valid', async () => {
  let xhr: sinon.SinonFakeXMLHttpRequestStatic;
  let requests: sinon.SinonFakeXMLHttpRequest[];
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (xhr: sinon.SinonFakeXMLHttpRequest) => {
      sinon.stub((xhr as unknown) as XMLHttpRequest, 'send');
      requests.push(xhr);
    };
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    xhr.restore();
    logSpy.restore();
  });

  it('Should not send a new order with empty products', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="10.00" quantity="0"></x-item>
        <x-item name="p2" price="10.00" quantity="0"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    const submitBtn = el.shadowRoot?.querySelector('[type=submit]');
    expect(submitBtn).to.exist;
    if (submitBtn) {
      (submitBtn as HTMLInputElement).click();
      expect(requests).to.be.empty;
    }
  });

  it('Should not allow negative prices or quantities', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="-10.00"></x-item>
        <x-item name="p2" price="10.00" quantity="-3"></x-item>
        <x-item name="p3" price="10.00" quantity="3"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    const submitBtn = el.shadowRoot?.querySelector('[type=submit]');
    expect(submitBtn).to.exist;
    if (submitBtn) {
      logSpy.reset();
      (submitBtn as HTMLInputElement).click();
      interface withSend {
        send?: { args: any[] };
      }
      interface FakeRequest extends sinon.SinonFakeXMLHttpRequest, withSend {}
      const r: FakeRequest = requests[0];
      const fd: FormData = r.send!.args[0][0];
      expect(fd).to.exist;
      if (fd) {
        expect(valuesFromField(fd, 'price').every(v => Number(v) >= 0)).to.be.true;
        expect(logSpy.callCount).to.equal(2);
      }
    }
  });

  it('Should validate frequency format', async () => {
    let el = await fixture(html`
      <x-form
        store="test.foxycart.com"
        currency="usd"
        frequencies='["5d", "10d", "15d", "1m", "1y", ".5m"]'
      >
        <x-item name="p3" price="10.00" quantity="3"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Invalid frequency')).to.be.false;
    el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com" frequencies='["5", "10d"]'>
        <x-item name="p3" price="10.00" quantity="3"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Invalid frequency')).to.be.true;
  });

  // TODO: o erro está no uso de __validFrequency ao invés de ValidDate no QuickOrder
  it('Should validate initial date', async () => {
    const validDates = ['20201010', '20', '2', '1d', '12w', '2y', '10m'];
    const invalidDates = ['202010100', '80', '.5m', 'tomorrow', 'today', '-1'];

    for (const list of [
      [validDates, 0],
      [invalidDates, 1],
    ]) {
      for (const dateString of list[0] as string[]) {
        logSpy.reset();
        const el = await fixture(html`
          <x-form
            currency="usd"
            store="test.foxycart.com"
            sub_startdate="${dateString}"
            frequencies='["5d", "10d"]'
          >
            <x-item name="p3" price="10.00" quantity="3"></x-item>
          </x-form>
        `);
        await elementUpdated(el);
        if (list[1]) {
          expect(logSpy.calledWith('Invalid start date')).to.be.true;
        } else {
          expect(logSpy.calledWith('Invalid start date')).to.be.false;
        }
      }
    }
  });

  it('Should validate end date', async () => {
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().replace(/(-|T.*)/g, '');
    const validDates = [tomorrowStr, '20', '2', '1d', '12w', '2y', '10m'];
    const invalidDates = ['20191010', '219810100', '80', '.5m', 'tomorrow', '-1'];

    for (const list of [
      [validDates, 0],
      [invalidDates, 1],
    ]) {
      for (const dateString of list[0] as string[]) {
        logSpy.reset();
        const el = await fixture(html`
          <x-form
            currency="usd"
            store="test.foxycart.com"
            sub_enddate="${dateString}"
            frequencies='["5d", "10d"]'
          >
            <x-item name="p3" price="10.00"></x-item>
          </x-form>
        `);
        await elementUpdated(el);
        if (list[1]) {
          expect(logSpy.calledWith('Invalid end date')).to.be.true;
        } else {
          expect(logSpy.calledWith('Invalid end date')).to.be.false;
        }
      }
    }
  });
});

describe('The form should be aware of its products', async () => {
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.restore();
  });

  it('Shows the total price of the products added as tags', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="10.00" quantity="3"></x-item>
        <x-item name="p2" price="10.00" quantity="1"></x-item>
        <x-item name="p3" price="10.00" quantity="2"></x-item>
        <x-item name="p4" price="10.00" quantity="1"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    expect(el.getAttribute('total-price')).to.equal('70');
  });

  it('Shows the total price of the products added as arrays ', async () => {
    const el = await fixture(html`
      <x-form
        store="test.foxycart.com"
        products='[{"name": "p1", "price":"10.00"},{"name": "p1", "price":"10.00"},{"name": "p1", "price":"10.00", "quantity": "2"},{"name":"p4","price":10}]'
      >
      </x-form>
    `);
    await elementUpdated(el);
    expect((el as TestQuickOrder).total).to.equal(50);
  });

  it('Update the total price as quantities change', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="10.00" quantity="3"></x-item>
        <x-item name="p2" price="10.00"></x-item>
        <x-item name="p3" price="10.00" quantity="2"></x-item>
        <x-item name="p4" price="10.00"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    expect(el.getAttribute('total-price')).to.equal('70');
    const firstProduct = el.querySelector('[product]');
    expect(firstProduct).to.exist;
    firstProduct!.setAttribute('quantity', '30');
    await elementUpdated(firstProduct!);
    await elementUpdated(el);
    expect(el.getAttribute('total-price')).to.equal('340');
  });
});

/** Helper functions **/

/**
 * Returns FormDataEntryValues for fields with a particular name, following
 * FoxyCart convention
 */
function valuesFromField(formData: FormData, name: string): FormDataEntryValue[] {
  const re = new RegExp(`\\d+:${name}(||.*)?`);
  const values: FormDataEntryValue[] = [];
  formData.forEach((value, key) => {
    if (key.match(re)) {
      values.push(value);
    }
  });
  return values;
}
