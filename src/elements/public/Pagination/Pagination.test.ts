import type { InternalNumberControl } from '../../internal/InternalNumberControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { createRouter } from '../../../server/index';
import { Pagination } from './Pagination';
import { LitElement } from 'lit-element';

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

  it('renders limit selector', async () => {
    const router = createRouter();
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=3">
        <test-page-element @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const labelI18n = element.renderRoot.querySelector('foxy-i18n[infer=""][key="per_page"]');
    const label = labelI18n?.closest('label');
    const select = label?.htmlFor
      ? element.renderRoot.querySelector<HTMLSelectElement>(`#${label.htmlFor}`)
      : null;

    expect(select).to.exist;
    expect(select?.options.item(0)).to.have.property('value', '3');
    expect(select?.options.item(1)).to.have.property('value', '20');
    expect(select?.options.item(2)).to.have.property('value', '50');
    expect(select?.options.item(3)).to.have.property('value', '100');
    expect(select?.options.item(4)).to.have.property('value', '150');
    expect(select?.options.item(5)).to.have.property('value', '200');
    expect(select?.options.item(6)).to.not.exist;

    select!.value = '20';
    select!.dispatchEvent(new Event('change'));
    await element.requestUpdate('__page');
    expect(pageElement.href).to.equal('https://demo.api/hapi/coupon_codes?limit=20');
  });

  it('renders simple pagination', async () => {
    const router = createRouter();
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=50">
        <test-page-element @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const jumpToLabel = element.renderRoot.querySelector('foxy-i18n[infer=""][key="jump_to"]');
    expect(jumpToLabel).to.exist;

    const buttons = await getByTestClass(element, 'page-link');
    expect(buttons).to.have.length(2);
    expect(buttons[0].textContent?.trim()).to.equal('1');
    expect(buttons[0]).to.have.attribute('disabled');
    expect(buttons[1].textContent?.trim()).to.equal('2');
    expect(buttons[1]).to.not.have.attribute('disabled');

    buttons[1].click();
    await element.requestUpdate('__page');
    expect(pageElement.href).to.equal('https://demo.api/hapi/coupon_codes?limit=50&offset=50');
    expect(buttons[0]).to.not.have.attribute('disabled');
    expect(buttons[1]).to.have.attribute('disabled');
  });

  it('renders complex pagination with overflow', async () => {
    const router = createRouter();
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=10">
        <test-page-element @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const buttons = await getByTestClass(element, 'page-link');
    expect(buttons).to.have.length(7);
    expect(buttons[0].textContent?.trim()).to.equal('1');
    expect(buttons[1].textContent?.trim()).to.equal('2');
    expect(buttons[2].textContent?.trim()).to.equal('3');
    expect(buttons[3].textContent?.trim()).to.equal('4');
    expect(buttons[4].textContent?.trim()).to.equal('5');
    expect(buttons[5].textContent?.trim()).to.equal('...');
    expect(buttons[6].textContent?.trim()).to.equal('10');

    const dialog = element.renderRoot.querySelector('dialog');
    expect(dialog).to.not.have.attribute('open');

    buttons[5].click();
    expect(dialog).to.have.attribute('open');
  });

  it('renders Jump To dialog', async () => {
    const router = createRouter();
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=10">
        <test-page-element @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));
    const dialog = element.renderRoot.querySelector('dialog');
    const input = dialog?.querySelector<InternalNumberControl>('foxy-internal-number-control');

    expect(input).to.exist;
    expect(input).to.have.attribute('placeholder', '1');
    expect(input).to.have.attribute('helper-text', '');
    expect(input).to.have.attribute('label', 'page_number');
    expect(input).to.have.attribute('infer', '');
    expect(input).to.have.attribute('step', '1');
    expect(input).to.have.attribute('min', '1');
    expect(input).to.have.attribute('max', '10');
    expect(input?.getValue()).to.equal(1);

    dialog?.showModal();
    input?.setValue(7);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await element.requestUpdate('__page');
    expect(pageElement.href).to.equal('https://demo.api/hapi/coupon_codes?limit=10&offset=60');
    expect(dialog).to.not.have.attribute('open');

    dialog?.showModal();
    input?.setValue(8);
    const jumpLabel = element.renderRoot.querySelector('foxy-i18n[infer=""][key="jump"]');
    const jumpButton = jumpLabel?.closest('vaadin-button');
    jumpButton?.click();
    await element.requestUpdate('__page');
    expect(pageElement.href).to.equal('https://demo.api/hapi/coupon_codes?limit=10&offset=70');
    expect(dialog).to.not.have.attribute('open');
  });

  it('disables controls when disabled', async () => {
    const router = createRouter();
    const element = await fixture<Pagination>(html`
      <foxy-pagination first="https://demo.api/hapi/coupon_codes?limit=50" disabled>
        <test-page-element @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </test-page-element>
      </foxy-pagination>
    `);

    const pageElement = element.firstElementChild as NucleonElement<TestData>;
    await waitUntil(() => pageElement.in('idle'));

    const buttons = await getByTestClass(element, 'page-link');
    const select = element.renderRoot.querySelector<HTMLSelectElement>('select');

    expect(buttons[0]).to.have.attribute('disabled');
    expect(buttons[1]).to.have.attribute('disabled');
    expect(select).to.have.attribute('disabled');
  });
});
