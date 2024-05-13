import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { LitElement } from 'lit-element';
import { createRouter } from '../../../server/index';
import { getByKey } from '../../../testgen/getByKey';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Pagination } from './index';

type TestData = Resource<Rels.CouponCodes>;
customElements.define('test-page-element', class extends NucleonElement<TestData> {});

describe('Pagination', () => {
  it('extends LitElement', () => {
    expect(new Pagination()).to.be.instanceOf(LitElement);
  });

  it('has default i18n namespace "pagination"', () => {
    expect(new Pagination()).to.have.property('ns', 'pagination');
  });

  it('has an empty "first" URL by default', () => {
    expect(Pagination).to.have.nested.property('properties.first');
    expect(new Pagination()).to.have.property('first', '');
  });

  it('registers as "foxy-pagination"', () => {
    expect(customElements.get('foxy-pagination')).to.equal(Pagination);
  });

  it('sets "first" URL as "href" on the page element', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    expect(element.firstElementChild).to.have.property(
      'href',
      'https://demo.api/hapi/coupon_codes'
    );
  });

  (['next', 'last', 'prev', 'first'] as const).forEach(rel => {
    it(`sets "${rel}" URL as "href" on the page element when "${rel}" button is clicked`, async () => {
      const router = createRouter();
      const handle = (evt: FetchEvent) => router.handleEvent(evt);
      const element = await fixture(html`
        <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=1&offset=2">
          <test-page-element @fetch=${handle}></test-page-element>
        </foxy-pagination>
      `);

      const page = element.firstElementChild as NucleonElement<TestData>;
      await waitUntil(() => page.in({ idle: 'snapshot' }));

      const newHref = page.data?._links[rel].href;
      const button = await getByTestId(element, rel);
      button?.click();

      expect(page).to.have.property('href', newHref);
    });
  });

  it('disables "prev" and "first" buttons on first page', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    expect(await getByTestId(element, 'first')).to.have.attribute('disabled');
    expect(await getByTestId(element, 'prev')).to.have.attribute('disabled');
  });

  it('disables "last" and "next" buttons on last page', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const data = await getTestData<TestData>('./hapi/coupon_codes');

    const element = await fixture(html`
      <foxy-pagination first=${data._links.last.href}>
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    expect(await getByTestId(element, 'last')).to.have.attribute('disabled');
    expect(await getByTestId(element, 'next')).to.have.attribute('disabled');
  });

  it('hides all buttons while loading', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination first="https://demo.api/virtual/stall">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in('busy'));

    expect(await getByTestId(element, 'first')).to.not.exist;
    expect(await getByTestId(element, 'prev')).to.not.exist;
    expect(await getByTestId(element, 'last')).to.not.exist;
    expect(await getByTestId(element, 'next')).to.not.exist;
  });

  it('hides all buttons if collection length is less than limit', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination first="https://demo.api/hapi/transactions">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in('idle'));

    expect(await getByTestId(element, 'first')).to.not.exist;
    expect(await getByTestId(element, 'prev')).to.not.exist;
    expect(await getByTestId(element, 'last')).to.not.exist;
    expect(await getByTestId(element, 'next')).to.not.exist;
  });

  it('disables all buttons when disabled is true', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes" disabled>
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    expect(await getByTestId(element, 'first')).to.have.attribute('disabled');
    expect(await getByTestId(element, 'prev')).to.have.attribute('disabled');
    expect(await getByTestId(element, 'last')).to.have.attribute('disabled');
    expect(await getByTestId(element, 'next')).to.have.attribute('disabled');
  });

  it('enables all buttons when navigation is available in any direction', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=1&offset=2">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));

    expect(await getByTestId(element, 'first')).to.not.have.attribute('disabled');
    expect(await getByTestId(element, 'prev')).to.not.have.attribute('disabled');
    expect(await getByTestId(element, 'last')).to.not.have.attribute('disabled');
    expect(await getByTestId(element, 'next')).to.not.have.attribute('disabled');
  });

  it('renders current page in a label', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture(html`
      <foxy-pagination
        first="https://demo.api/hapi/coupon_codes?limit=2&offset=2"
        lang="es"
        ns="foo"
      >
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const page = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => page.in({ idle: 'snapshot' }));
    const label = await getByKey(element, 'pagination');

    expect(label).to.have.attribute('ns', 'foo');
    expect(label).to.have.attribute('lang', 'es');
    expect(label).to.have.attribute(
      'options',
      JSON.stringify({
        total: page.data?.total_items,
        from: 3,
        to: 4,
      })
    );
  });
});
