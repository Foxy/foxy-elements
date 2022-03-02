import { expect, fixture, waitUntil } from '@open-wc/testing';

import { CouponCard } from './index';
import { Data } from './types';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('CouponCard', () => {
  it('extends NucleonElement', () => {
    expect(new CouponCard()).to.be.instanceOf(NucleonElement);
  });

  it('defines a custom element named foxy-coupon-card', () => {
    expect(customElements.get('foxy-coupon-card')).to.equal(CouponCard);
  });

  describe('title', () => {
    it('is visible by default', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      expect(await getByTestId(element, 'title')).to.exist;
    });

    it('is hidden when the element is hidden', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.setAttribute('hidden', 'hidden');

      expect(await getByTestId(element, 'title')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "title"', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.setAttribute('hiddencontrols', 'title');

      expect(await getByTestId(element, 'title')).to.not.exist;
    });

    it('renders coupon name when available', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.name = 'Test coupon';

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      const control = await getByTestId(element, 'title');

      expect(control).to.include.text('Test coupon');
    });

    it("renders just the total number of uses when the number of uses isn't limited", async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.number_of_uses_to_date = 4;
      data.number_of_uses_allowed = 0;

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'title')) as HTMLElement;
      const label = await getByKey(control, 'uses_count');

      expect(label).to.have.attribute('options', JSON.stringify({ count: 4, total: 0 }));
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders the total number of uses next to the allowed number of uses when limits are in place', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.number_of_uses_to_date = 3;
      data.number_of_uses_allowed = 9;

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'title')) as HTMLElement;
      const label = await getByKey(control, 'uses_to_total_count');

      expect(label).to.have.attribute('options', JSON.stringify({ count: 3, total: 9 }));
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders "title:before" slot by default', async () => {
      const layout = html`<foxy-coupon-card></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      expect(await getByName(element, 'title:before')).to.have.property('localName', 'slot');
    });

    it('replaces "title:before" slot with template "title:before" if available', async () => {
      const name = 'title:before';
      const title = `<p>title of the "${name}" template.</p>`;
      const element = await fixture<CouponCard>(html`
        <foxy-coupon-card>
          <template slot=${name}>${unsafeHTML(title)}</template>
        </foxy-coupon-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(title);
    });

    it('renders "title:after" slot by default', async () => {
      const layout = html`<foxy-coupon-card></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      expect(await getByName(element, 'title:after')).to.have.property('localName', 'slot');
    });

    it('replaces "title:after" slot with template "title:after" if available', async () => {
      const name = 'title:after';
      const title = `<p>title of the "${name}" template.</p>`;
      const element = await fixture<CouponCard>(html`
        <foxy-coupon-card>
          <template slot=${name}>${unsafeHTML(title)}</template>
        </foxy-coupon-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(title);
    });
  });

  describe('description', () => {
    it('is visible by default', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      expect(await getByTestId(element, 'description')).to.exist;
    });

    it('is hidden when the element is hidden', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.setAttribute('hidden', 'hidden');

      expect(await getByTestId(element, 'description')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "description"', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.setAttribute('hiddencontrols', 'description');

      expect(await getByTestId(element, 'description')).to.not.exist;
    });

    it('renders discount summary when available', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.coupon_discount_details = '2-25|4-50';
      data.coupon_discount_type = 'quantity_amount';

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'description')) as HTMLElement;
      const label = await getByKey(control, 'discount_summary');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
      expect(label).to.have.attribute(
        'options',
        JSON.stringify({
          params: {
            details: '2-25|4-50',
            type: 'quantity_amount',
          },
        })
      );
    });

    it('renders "description:before" slot by default', async () => {
      const layout = html`<foxy-coupon-card></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      expect(await getByName(element, 'description:before')).to.have.property('localName', 'slot');
    });

    it('replaces "description:before" slot with template "description:before" if available', async () => {
      const name = 'description:before';
      const description = `<p>description of the "${name}" template.</p>`;
      const element = await fixture<CouponCard>(html`
        <foxy-coupon-card>
          <template slot=${name}>${unsafeHTML(description)}</template>
        </foxy-coupon-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(description);
    });

    it('renders "description:after" slot by default', async () => {
      const layout = html`<foxy-coupon-card></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      expect(await getByName(element, 'description:after')).to.have.property('localName', 'slot');
    });

    it('replaces "description:after" slot with template "description:after" if available', async () => {
      const name = 'description:after';
      const description = `<p>description of the "${name}" template.</p>`;
      const element = await fixture<CouponCard>(html`
        <foxy-coupon-card>
          <template slot=${name}>${unsafeHTML(description)}</template>
        </foxy-coupon-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(description);
    });
  });

  describe('status', () => {
    it('is visible by default', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      expect(await getByTestId(element, 'status')).to.exist;
    });

    it('is hidden when the element is hidden', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.setAttribute('hidden', 'hidden');

      expect(await getByTestId(element, 'status')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "status"', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.setAttribute('hiddencontrols', 'status');

      expect(await getByTestId(element, 'status')).to.not.exist;
    });

    it('renders date_range_any label when no date constraints are present', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.start_date = null;
      data.end_date = null;

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'status')) as HTMLElement;
      const label = await getByKey(control, 'date_range_any');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders date_range_from label when only start date constraint is present', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.start_date = '2022-01-01';
      data.end_date = null;

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'status')) as HTMLElement;
      const label = await getByKey(control, 'date_range_from');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
      expect(label).to.have.attribute(
        'options',
        JSON.stringify({
          start: '2022-01-01',
          end: null,
        })
      );
    });

    it('renders date_range_until label when only end date constraint is present', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.start_date = null;
      data.end_date = '2022-01-01';

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'status')) as HTMLElement;
      const label = await getByKey(control, 'date_range_until');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
      expect(label).to.have.attribute(
        'options',
        JSON.stringify({
          start: null,
          end: '2022-01-01',
        })
      );
    });

    it('renders date_range_complete label when both date constraints are present', async () => {
      const data = await getTestData<Data>('./hapi/coupons/0');

      data.start_date = '2022-01-01';
      data.end_date = '2024-01-01';

      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'status')) as HTMLElement;
      const label = await getByKey(control, 'date_range_complete');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
      expect(label).to.have.attribute(
        'options',
        JSON.stringify({
          start: '2022-01-01',
          end: '2024-01-01',
        })
      );
    });

    it('renders "status:before" slot by default', async () => {
      const layout = html`<foxy-coupon-card></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      expect(await getByName(element, 'status:before')).to.have.property('localName', 'slot');
    });

    it('replaces "status:before" slot with template "status:before" if available', async () => {
      const name = 'status:before';
      const status = `<p>status of the "${name}" template.</p>`;
      const element = await fixture<CouponCard>(html`
        <foxy-coupon-card>
          <template slot=${name}>${unsafeHTML(status)}</template>
        </foxy-coupon-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(status);
    });

    it('renders "status:after" slot by default', async () => {
      const layout = html`<foxy-coupon-card></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      expect(await getByName(element, 'status:after')).to.have.property('localName', 'slot');
    });

    it('replaces "status:after" slot with template "status:after" if available', async () => {
      const name = 'status:after';
      const status = `<p>status of the "${name}" template.</p>`;
      const element = await fixture<CouponCard>(html`
        <foxy-coupon-card>
          <template slot=${name}>${unsafeHTML(status)}</template>
        </foxy-coupon-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(status);
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-coupon-card lang="es"></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-card spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const layout = html`<foxy-coupon-card href="/" lang="es"></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-card spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-coupon-card href="/" lang="es"></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'coupon-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData('./hapi/coupons/0');
      const layout = html`<foxy-coupon-card .data=${data}></foxy-coupon-card>`;
      const element = await fixture<CouponCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
