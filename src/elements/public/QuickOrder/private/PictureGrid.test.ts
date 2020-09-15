import { expect, fixture, html, elementUpdated } from '@open-wc/testing';
import { PictureGrid } from './PictureGrid';
import * as sinon from 'sinon';

customElements.define('x-grid', PictureGrid);

let logSpy: sinon.SinonStub;

describe('Display a grid of images', async function () {
  before(function () {
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    logSpy.reset();
  });

  after(function () {
    logSpy.restore();
  });

  it('Should show a single image if only one is provided', async function () {
    const el = await fixture(html` <x-grid images='[{"src":"a.png"}]'> </x-grid> `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    const images = el.shadowRoot!.querySelectorAll('[src]');
    expect(images.length).to.equal(1);
  });

  it('Should show a grid of images if more than one is provided', async function () {
    const el = await fixture(html` <x-grid images='[{"src":"a.png"},{"src":"b.png"}]'> </x-grid> `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    const images = el.shadowRoot!.querySelectorAll('[src]');
    expect(images.length).to.equal(2);
  });

  it('Should show fill up to two empty images with placeholders', async function () {
    let el = await fixture(html` <x-grid images='[{"src":"a.png"},{"src":"b.png"}]'> </x-grid> `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    let slots = el.shadowRoot!.querySelectorAll('div.image-grid > *');
    expect(slots.length).to.equal(4);
    el = await fixture(html`
      <x-grid images='[{"src":"a.png"},{"src":"b.png"},{"src":"c.png"}]'> </x-grid>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    slots = el.shadowRoot!.querySelectorAll('div.image-grid > *');
    expect(slots.length).to.equal(4);
  });

  it('Should not add "null" or "undefined" images', async function () {
    const el = await fixture(html`
      <x-grid images='[{"src":"a.png"},{"src":"undefined"}]'> </x-grid>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    const images = el.shadowRoot!.querySelectorAll('[src]');
    expect(images.length).to.equal(1);
  });
});
