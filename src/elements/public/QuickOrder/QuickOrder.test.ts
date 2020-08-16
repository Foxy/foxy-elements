import { fixture, fixtureCleanup, oneEvent, expect, html } from '@open-wc/testing';
import * as sinon from 'sinon';
import { QuickOrder } from './QuickOrder';
import { ProductItem } from './ProductItem';

customElements.define('x-form', QuickOrder);
customElements.define('x-item', ProductItem);

let xhr: sinon.SinonFakeXMLHttpRequestStatic;
let requests;

beforeEach(function () {
  xhr = sinon.useFakeXMLHttpRequest();
  requests = [];
  xhr.onCreate = function (req) {
    requests.push(req);
  };
});

afterEach(function () {
  xhr.restore();
});

describe('The form should allow new products to be added', async () => {
  it('Should recognize new products added as JS array', async () => {
    const el = await fixture(html`
      <x-form products='[{name: "p1", price: "1"}, {name: "p2", price: "2"}]'> </x-form>
    `);
    const products = el.shadowRoot?.querySelectorAll('data-product');
    expect(products).to.have.lengthOf(2);
  });

  it('Should recognize new products added as product item tags', async () => {
    const el = await fixture(html`
      <x-form>
        <x-item price="10.00"></x-item>
        <x-item price="10.00"></x-item>
        <x-item price="10.00"></x-item>
      </x-form>
    `);
    const products = el.shadowRoot?.querySelectorAll('data-product');
    expect(products).to.have.lengthOf(3);
  });

  it('Should recognize custom products as well', async () => {
    const el = await fixture(html`
      <x-form>
        <article data-product data-price="10.00" data-name="p1"></article>
        <article data-product data-price="10.00" data-name="p2"></article>
        <article data-product data-price="10.00" data-name="p3"></article>
      </x-form>
    `);
    const products = el.shadowRoot?.querySelectorAll('data-product');
    expect(products).to.have.lengthOf(3);
  });

  it('Should recognize changes to JS array', async () => {
    const el = await fixture(html`
      <x-form products='[{name: "p1", price: "1"}, {name: "p2", price: "2"}]'> </x-form>
    `);
    const products = el.shadowRoot?.querySelectorAll('data-product');
    (el as QuickOrder).products.push({ name: 'p3', price: 3 });
    expect(products).to.have.lengthOf(3);
  });

  it('Should recognize new producs late added as product item tags', async () => {
    const el = await fixture(html`
      <x-form>
        <x-item name="p1" price="10.00"></x-item>
        <x-item name="p2" price="10.00"></x-item>
      </x-form>
    `);
    const lateProduct = new ProductItem();
    lateProduct.price = 10;
    lateProduct.name = '3';
    el.appendChild(lateProduct);
    expect(el.getAttribute('total-price')).to.equal(30);
  });

  it('Should recognize child products removed from the DOM', async () => {
    const el = await fixture(html`
      <x-form>
        <x-item id="first" name="p1" price="10.00"></x-item>
        <x-item id="second" name="p2" price="10.00"></x-item>
      </x-form>
    `);
    const toRemove = el.shadowRoot?.querySelector('#first');
    if (toRemove) {
      el.removeChild(toRemove);
    }
    expect(el.getAttribute('total-price')).to.equal('10.00');
  });
});

describe('The form should remain valid', async () => {
  it('Should print an error message if no store is provided', async () => {
    const logSpy = sinon.spy(console, 'error');
    await fixture(html` <x-form store-subdomain="test.foxycart.com"></x-form> `);
    expect(logSpy.callCount).to.equal(0);
    fixtureCleanup();
    await fixture(html`<x-form></x-form>`);
    expect(logSpy.callCount).to.equal(1);
  });

  it('Should not send a new order with empty products', async () => {
    const logSpy = sinon.spy(console, 'error');
    await fixture(html` <x-form store-subdomain="test.foxycart.com"></x-form> `);
    expect(logSpy.callCount).to.equal(0);
    fixtureCleanup();
    await fixture(html`<x-form></x-form>`);
    expect(logSpy.callCount).to.equal(1);
    expect(true).to.equal(false);
  });

  // TODO: check if the form should be used to edit orders (it seems that it is so)
  it('Should not send an unmodified order if already sent', async () => {
    const el = await fixture(html` <x-form store-subdomain="test.foxycart.com"></x-form> `);
    const submitEl = el.shadowRoot?.querySelector('[type=submit]');
    const submit = submitEl as HTMLInputElement;
    expect(submit).to.exist;
    const listener = oneEvent(submit as HTMLInputElement, 'click');
    if (submit) {
      (submit as HTMLInputElement).click();
      await listener;
      expect(requests.length).to.equal(0);
    }
    expect(true).to.equal(false);
  });

  it('Should not allow negative quantities', async () => {
    expect(true).to.equal(false);
  });

  it('Should not allow negative prices', async () => {
    expect(true).to.equal(false);
  });
});
