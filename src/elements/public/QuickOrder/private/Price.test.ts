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

  it('Should not show invalid prices', async () => {
    let el = await fixture(html` <x-price .currency=${'usd'} .quantity=${2}></x-price> `);
    await elementUpdated(el);
    let p = el.shadowRoot?.querySelector('.price');
    expect(p).not.to.exist;
    el = await fixture(html` <x-price .price=${10} .quantity=${2}></x-price> `);
    await elementUpdated(el);
    p = el.shadowRoot?.querySelector('.price');
    expect(p).not.to.exist;
    el = await fixture(html` <x-price .price=${10} .currency=${'usd'}></x-price> `);
    await elementUpdated(el);
    p = el.shadowRoot?.querySelector('.price');
    expect(p).not.to.exist;
  });
});

/** Helper functions */

function trim(str: string): string {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
