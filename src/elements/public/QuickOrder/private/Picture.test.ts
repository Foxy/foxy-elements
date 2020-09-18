import { expect, fixture, html, elementUpdated } from '@open-wc/testing';
import { Picture } from './Picture';
import * as sinon from 'sinon';

customElements.define('x-picture', Picture);

let logSpy: sinon.SinonStub;

describe('Display an image for a product', async function () {
  before(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.reset();
  });

  after(function () {
    logSpy.restore();
  });

  it('Should accept alt, height width and src attributes', async function () {
    const el = await fixture(html`
      <x-picture alt="an alternative text" height="50" width="50" src="mysrc"> </x-picture>
    `);
    await elementUpdated(el);
    expect((el as Picture).alt).to.equal('an alternative text');
    expect((el as Picture).height).to.equal(50);
    expect((el as Picture).width).to.equal(50);
    expect((el as Picture).src).to.equal('mysrc');
  });

  it('Should set "multiple" class if quantity is greater than 1', async function () {
    const el = await fixture(html` <x-picture src="mysrc" quantity="2"> </x-picture> `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    const prod = el.shadowRoot!.querySelector('.product');
    expect(prod).to.exist;
    expect(prod!.classList.contains('multiple')).to.be.true;
  });

  it('Should display a underlying rotated image if quantity is greater than 1', async function () {
    const el = await fixture(html` <x-picture src="mysrc" quantity="2"> </x-picture> `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    const images = el.shadowRoot!.querySelectorAll('img');
    expect(images.length).to.equal(2);
    expect(images[0].classList.contains('back')).to.be.true;
    expect(
      getComputedStyle(images[0])
        .getPropertyValue('transform')
        .match(/matrix/)
    ).to.exist;
    expect(images[1].classList.contains('front')).to.be.true;
    expect(
      getComputedStyle(images[1])
        .getPropertyValue('transform')
        .match(/matrix/)
    ).not.to.exist;
    expect(images[1].src).to.equal(images[0].src);
  });
});
