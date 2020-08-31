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
    return new MockProduct(p);
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
    lateProduct.total = 20;
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

  it('Should add new valid products', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item id="first" name="p1" price="10.00"></x-item>
        <x-item id="second" name="p2" price="10.00"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    (el as TestQuickOrder).addProducts([{ name: 'p3', price: 10 }]);
    await elementUpdated(el);
    const products = el.querySelectorAll('[product]');
    expect(products).to.exist;
    expect(products.length).to.equal(3);
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
    const submitBtn = el.shadowRoot?.querySelector('[role=submit]');
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
    const submitBtn = el.shadowRoot?.querySelector('[role=submit]');
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
    el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com" frequencies='[""]'>
        <x-item name="p3" price="10.00" quantity="3"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    expect(logSpy.calledWith('Invalid frequency')).to.be.true;
  });

  interface DateFormatTest {
    it: string;
    dates: string[];
    dateType: string;
    logMessage: string;
    logHappens: boolean;
  }
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().replace(/(-|T.*)/g, '');
  const dateFormatsTests: DateFormatTest[] = [
    {
      it: 'Should accept valid start date formats',
      dates: ['20201010', '20', '2', '1d', '12w', '2y', '10m'],
      logMessage: 'Invalid start date',
      dateType: 'start',
      logHappens: false,
    },
    {
      it: 'Should not accept invalid start date formats',
      dates: ['202010100', '80', '.5m', 'tomorrow', 'today', '-1'],
      logMessage: 'Invalid start date',
      dateType: 'start',
      logHappens: true,
    },
    {
      it: 'Should accept valid end date formats',
      dates: [tomorrowStr, '20', '2', '1d', '12w', '2y', '10m'],
      logMessage: 'Invalid end date',
      dateType: 'end',
      logHappens: false,
    },
    {
      it: 'Should not accept invalid end date formats',
      dates: ['20191010', '219810100', '80', '.5m', 'tomorrow', '-1'],
      dateType: 'end',
      logMessage: 'Invalid end date',
      logHappens: true,
    },
  ];
  for (const t of dateFormatsTests) {
    it(t.it, async () => {
      for (const d of t.dates) {
        const el = await fixture(html`
          <x-form
            currency="usd"
            store="test.foxycart.com"
            frequencies='["5d", "10d"]'
            sub_enddate="${t.dateType == 'end' ? d : ''}"
            sub_startdate="${t.dateType == 'start' ? d : ''}"
          >
            <x-item name="p3" price="10.00"></x-item>
          </x-form>
        `);
        await elementUpdated(el);
        expect(logSpy.calledWith(t.logMessage)).to.equal(t.logHappens);
      }
    });
  }
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
    expect(el.getAttribute('total')).to.equal('70');
  });

  it('Shows the total price of the products added as arrays ', async () => {
    const el = await fixture(html`
      <x-form
        store="test.foxycart.com"
        products='[ {"name": "p1", "price":"10.00"}, {"name": "p2", "price":"10.00"}, {"name": "p3", "price":"10.00", "quantity": "2"}, {"name":"p4","price": "10"} ]'
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
    expect(el.getAttribute('total')).to.equal('70');
    const firstProduct = el.querySelector('[product]');
    expect(firstProduct).to.exist;
    const m = firstProduct as MockProduct;
    m.quantity = 30;
    m.total = m.price * m.quantity;
    const listener = oneEvent(el, 'change');
    m.dispatchEvent(new Event('change'));
    await elementUpdated(firstProduct!);
    await elementUpdated(el);
    await listener;
    expect(el.getAttribute('total')).to.equal('340');
  });
});

describe('The form should add frequency fields', async () => {
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

  it('Should provide field to choose frequencies', async () => {
    expect(true).to.equal(false);
  });

  it('Should add initial and end dates', async () => {
    expect(true).to.equal(false);
  });
});

describe('The form submits a valid POST to forxycart', async () => {
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

  it('Prepends ids to the products', async () => {
    const el = await fixture(html`
      <x-form currency="usd" store="test.foxycart.com">
        <x-item name="p1" price="10.00" quantity="3"></x-item>
        <x-item name="p2" price="10.00" quantity="1"></x-item>
        <x-item name="p3" price="10.00" quantity="2"></x-item>
        <x-item name="p4" price="10.00" quantity="1"></x-item>
      </x-form>
    `);
    await elementUpdated(el);
    const submitBtn = el.shadowRoot?.querySelector('[role=submit]');
    expect(submitBtn).to.exist;
    (submitBtn! as HTMLInputElement).click();
    expect(true).to.equal(false);
  });

  it('Concatenates signatures', async () => {
    expect(true).to.equal(false);
  });

  it('Configure parent_code', async () => {
    expect(true).to.equal(false);
  });

  it('Concatenates open to custom fields', async () => {
    expect(true).to.equal(false);
  });
});

describe('The form reveals its state to the user', async () => {
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

  it('Displays frequency information', async () => {
    expect(true).to.equal(false);
  });

  it('Disables submit button when no product is valid', async () => {
    expect(true).to.equal(false);
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
