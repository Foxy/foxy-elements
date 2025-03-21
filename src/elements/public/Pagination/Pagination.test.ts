import type { InternalNumberControl } from '../../internal/InternalNumberControl';
import type { InternalSelectControl } from '../../internal/InternalSelectControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { Pagination } from './Pagination';
import { LitElement } from 'lit-element';

type TestData = Resource<Rels.CouponCodes>;
customElements.define('test-page-element', class extends NucleonElement<TestData> {});

describe('Pagination', () => {
  it('extends LitElement', () => {
    expect(new Pagination()).to.be.instanceOf(LitElement);
  });

  it('imports and defines dependencies', () => {
    expect(customElements.get('vaadin-button')).to.exist;
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
    expect(customElements.get('foxy-internal-number-control')).to.exist;
    expect(customElements.get('foxy-internal-select-control')).to.exist;
    expect(customElements.get('foxy-i18n')).to.exist;
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

  it('renders pagination', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const firstLabel = element.renderRoot.querySelector('foxy-i18n[infer=""][key="first"]')!;
    const firstButton = firstLabel.closest('vaadin-button')!;

    const previousLabel = element.renderRoot.querySelector('foxy-i18n[infer=""][key="previous"]')!;
    const previousButton = previousLabel.closest('vaadin-button')!;

    const nextLabel = element.renderRoot.querySelector('foxy-i18n[infer=""][key="next"]')!;
    const nextButton = nextLabel.closest('vaadin-button')!;

    const lastLabel = element.renderRoot.querySelector('foxy-i18n[infer=""][key="last"]')!;
    const lastButton = lastLabel.closest('vaadin-button')!;

    const paginationLabel = element.renderRoot.querySelector(
      'foxy-i18n[infer=""][key="pagination"]'
    )!;

    expect(firstButton).to.exist;
    expect(previousButton).to.exist;
    expect(nextButton).to.exist;
    expect(lastButton).to.exist;

    expect(firstButton).to.have.attribute('disabled');
    expect(previousButton).to.have.attribute('disabled');
    expect(nextButton).to.not.have.attribute('disabled');
    expect(lastButton).to.not.have.attribute('disabled');
    expect(paginationLabel).to.have.deep.property('options', { total: 100, from: 1, to: 20 });

    nextButton.click();
    await element.requestUpdate('__page');
    expect(pageElement).to.have.property(
      'href',
      'https://demo.api/hapi/coupon_codes?limit=20&offset=20'
    );

    await waitUntil(() => pageElement.in('idle'));
    expect(firstButton).to.not.have.attribute('disabled');
    expect(previousButton).to.not.have.attribute('disabled');
    expect(nextButton).to.not.have.attribute('disabled');
    expect(lastButton).to.not.have.attribute('disabled');
    expect(paginationLabel).to.have.deep.property('options', { total: 100, from: 21, to: 40 });

    lastButton.click();
    await element.requestUpdate('__page');
    expect(pageElement).to.have.property(
      'href',
      'https://demo.api/hapi/coupon_codes?limit=20&offset=80'
    );

    await waitUntil(() => pageElement.in('idle'));
    expect(firstButton).to.not.have.attribute('disabled');
    expect(previousButton).to.not.have.attribute('disabled');
    expect(nextButton).to.have.attribute('disabled');
    expect(lastButton).to.have.attribute('disabled');
    expect(paginationLabel).to.have.deep.property('options', { total: 100, from: 81, to: 100 });

    previousButton.click();
    await element.requestUpdate('__page');
    expect(pageElement).to.have.property(
      'href',
      'https://demo.api/hapi/coupon_codes?limit=20&offset=60'
    );

    await waitUntil(() => pageElement.in('idle'));
    expect(firstButton).to.not.have.attribute('disabled');
    expect(previousButton).to.not.have.attribute('disabled');
    expect(nextButton).to.not.have.attribute('disabled');
    expect(lastButton).to.not.have.attribute('disabled');
    expect(paginationLabel).to.have.deep.property('options', { total: 100, from: 61, to: 80 });

    firstButton.click();
    await element.requestUpdate('__page');
    expect(pageElement).to.have.property('href', 'https://demo.api/hapi/coupon_codes?limit=20');

    await waitUntil(() => pageElement.in('idle'));
    expect(firstButton).to.have.attribute('disabled');
    expect(previousButton).to.have.attribute('disabled');
    expect(nextButton).to.not.have.attribute('disabled');
    expect(lastButton).to.not.have.attribute('disabled');
    expect(paginationLabel).to.have.deep.property('options', { total: 100, from: 1, to: 20 });
  });

  it('opens Limit & Offset settings dialog on pagination info click', async () => {
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes">
        <test-page-element></test-page-element>
      </foxy-pagination>
    `);

    const label = element.renderRoot.querySelector('foxy-i18n[infer=""][key="pagination"]')!;
    const button = label.closest('vaadin-button')!;
    const dialog = element.renderRoot.querySelector('dialog')!;
    expect(dialog).to.not.have.attribute('open');

    button.click();
    await element.requestUpdate();
    expect(dialog).to.have.attribute('open');
  });

  it('renders select control with limit options in the dialog', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=10">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const dialog = element.renderRoot.querySelector('dialog')!;
    const select = dialog.querySelector('foxy-internal-select-control') as InternalSelectControl;

    expect(select.getValue()).to.equal(10);
    expect(select).to.have.attribute('placeholder', 'select');
    expect(select).to.have.attribute('helper-text', '');
    expect(select).to.have.attribute('layout', 'summary-item');
    expect(select).to.have.attribute('infer', '');
    expect(select).to.have.attribute('label', 'per_page');
    expect(select)
      .to.have.property('options')
      .that.deep.equals([
        { rawLabel: 10, value: 10 },
        { rawLabel: 20, value: 20 },
        { rawLabel: 50, value: 50 },
        { rawLabel: 100, value: 100 },
        { rawLabel: 150, value: 150 },
        { rawLabel: 200, value: 200 },
      ]);

    select.setValue(20);
    await element.requestUpdate('__limit');
    expect(pageElement).to.have.property('href', 'https://demo.api/hapi/coupon_codes?limit=20');
    expect(select.getValue()).to.equal(20);
  });

  it('renders number control with page number in the dialog', async () => {
    const router = createRouter();
    const handle = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=10">
        <test-page-element @fetch=${handle}></test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const dialog = element.renderRoot.querySelector('dialog')!;
    const number = dialog.querySelector('foxy-internal-number-control') as InternalNumberControl;

    expect(number.getValue()).to.equal(1);
    expect(number).to.have.attribute('placeholder', '1');
    expect(number).to.have.attribute('helper-text', '');
    expect(number).to.have.attribute('layout', 'summary-item');
    expect(number).to.have.attribute('infer', '');
    expect(number).to.have.attribute('label', 'page_number');
    expect(number).to.have.attribute('step', '1');
    expect(number).to.have.attribute('min', '1');
    expect(number).to.have.attribute('max', '10');

    number.setValue(3);
    number.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await element.requestUpdate('__page');
    expect(number.getValue()).to.equal(3);
    expect(pageElement).to.have.property(
      'href',
      'https://demo.api/hapi/coupon_codes?limit=10&offset=20'
    );

    number.setValue(1);
    number.dispatchEvent(new Event('blur'));
    await element.requestUpdate('__page');
    expect(number.getValue()).to.equal(1);
    expect(pageElement).to.have.property('href', 'https://demo.api/hapi/coupon_codes?limit=10');
  });
});
