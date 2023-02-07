import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { Data } from './types';
import { GiftCardCard } from './GiftCardCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { createRouter } from '../../../server/index';

describe('GiftCardCard', () => {
  it('extends NucleonElement', () => {
    expect(new GiftCardCard()).to.be.instanceOf(NucleonElement);
  });

  it('defines a custom element named foxy-gift-card-card', () => {
    expect(customElements.get('foxy-gift-card-card')).to.equal(GiftCardCard);
  });

  it('has a default i18next namespace "gift-card-card"', () => {
    expect(new GiftCardCard()).to.have.property('ns', 'gift-card-card');
  });

  describe('title', () => {
    it('is visible by default', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      expect(await getByTestId(element, 'title')).to.exist;
    });

    it('is hidden when the element is hidden', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      element.setAttribute('hidden', 'hidden');

      expect(await getByTestId(element, 'title')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "title"', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      element.setAttribute('hiddencontrols', 'title');

      expect(await getByTestId(element, 'title')).to.not.exist;
    });

    it('renders gift card name when available', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');

      data.name = 'Test gift card';

      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      const control = await getByTestId(element, 'title');

      expect(control).to.include.text('Test gift card');
    });

    it('renders gift card currency when available', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');

      data.currency_code = 'BYN';

      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      const control = await getByTestId(element, 'title');

      expect(control).to.include.text('BYN');
    });

    it('renders "title:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-card></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      expect(await getByName(element, 'title:before')).to.have.property('localName', 'slot');
    });

    it('replaces "title:before" slot with template "title:before" if available', async () => {
      const name = 'title:before';
      const title = `<p>title of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCard>(html`
        <foxy-gift-card-card>
          <template slot=${name}>${unsafeHTML(title)}</template>
        </foxy-gift-card-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(title);
    });

    it('renders "title:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-card></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      expect(await getByName(element, 'title:after')).to.have.property('localName', 'slot');
    });

    it('replaces "title:after" slot with template "title:after" if available', async () => {
      const name = 'title:after';
      const title = `<p>title of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCard>(html`
        <foxy-gift-card-card>
          <template slot=${name}>${unsafeHTML(title)}</template>
        </foxy-gift-card-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(title);
    });
  });

  describe('status', () => {
    it('is visible by default', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      expect(await getByTestId(element, 'status')).to.exist;
    });

    it('is hidden when the element is hidden', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      element.setAttribute('hidden', 'hidden');

      expect(await getByTestId(element, 'status')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "status"', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      element.setAttribute('hiddencontrols', 'status');

      expect(await getByTestId(element, 'status')).to.not.exist;
    });

    it("renders never_expires label when gift card doesn't have expiration period", async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');

      data.expires_after = null;

      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'status')) as HTMLElement;
      const label = await getByKey(control, 'never_expires');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders expires_after_value label when gift card has expiration period', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');

      data.expires_after = '3w';

      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'status')) as HTMLElement;
      const label = await getByKey(control, 'expires_after_value');

      expect(label).to.exist;
      expect(label).to.have.attribute('options', JSON.stringify({ value: '3w' }));
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders "status:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-card></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      expect(await getByName(element, 'status:before')).to.have.property('localName', 'slot');
    });

    it('replaces "status:before" slot with template "status:before" if available', async () => {
      const name = 'status:before';
      const status = `<p>status of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCard>(html`
        <foxy-gift-card-card>
          <template slot=${name}>${unsafeHTML(status)}</template>
        </foxy-gift-card-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(status);
    });

    it('renders "status:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-card></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      expect(await getByName(element, 'status:after')).to.have.property('localName', 'slot');
    });

    it('replaces "status:after" slot with template "status:after" if available', async () => {
      const name = 'status:after';
      const status = `<p>status of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCard>(html`
        <foxy-gift-card-card>
          <template slot=${name}>${unsafeHTML(status)}</template>
        </foxy-gift-card-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(status);
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-gift-card-card lang="es"></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-card spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-gift-card-card
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-card>
      `;

      const element = await fixture<GiftCardCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-card spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-gift-card-card href="/" lang="es"></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData<Data>('./hapi/gift_cards/0');
      const layout = html`<foxy-gift-card-card .data=${data}></foxy-gift-card-card>`;
      const element = await fixture<GiftCardCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
