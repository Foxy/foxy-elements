import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { AttributeCard } from './AttributeCard';
import { Data } from './types';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { createRouter } from '../../../server/index';

describe('AttributeCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends NucleonElement', () => {
    expect(new AttributeCard()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-attribute-card', () => {
    expect(customElements.get('foxy-attribute-card')).to.equal(AttributeCard);
  });

  describe('name', () => {
    it('renders attribute name when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_attributes/0';
      const data = { ...(await getTestData<Data>(href)), name: 'Foo' };
      const layout = html`<foxy-attribute-card .data=${data}></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);

      expect(await getByTestId(element, 'name')).to.contain.text('Foo');
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-attribute-card></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByName(element, 'name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const name = 'name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AttributeCard>(html`
        <foxy-attribute-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-attribute-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const layout = html`<foxy-attribute-card></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByName(element, 'name:after')).to.have.property('localName', 'slot');
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const name = 'name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AttributeCard>(html`
        <foxy-attribute-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-attribute-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-attribute-card></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-attribute-card hidden></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes name', async () => {
      const layout = html`<foxy-attribute-card hiddencontrols="name"></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });
  });

  describe('value', () => {
    it('renders attribute value when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_attributes/0';
      const data = { ...(await getTestData<Data>(href)), value: 'Foo' };
      const layout = html`<foxy-attribute-card .data=${data}></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);

      expect(await getByTestId(element, 'value')).to.contain.text('Foo');
    });

    it('renders "value:before" slot by default', async () => {
      const layout = html`<foxy-attribute-card></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByName(element, 'value:before')).to.have.property('localName', 'slot');
    });

    it('replaces "value:before" slot with template "value:before" if available', async () => {
      const name = 'value:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AttributeCard>(html`
        <foxy-attribute-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-attribute-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "value:after" slot by default', async () => {
      const layout = html`<foxy-attribute-card></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByName(element, 'value:after')).to.have.property('localName', 'slot');
    });

    it('replaces "value:after" slot with template "value:after" if available', async () => {
      const name = 'value:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AttributeCard>(html`
        <foxy-attribute-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-attribute-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-attribute-card></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByTestId(element, 'value')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-attribute-card hidden></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByTestId(element, 'value')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes value', async () => {
      const layout = html`<foxy-attribute-card hiddencontrols="value"></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      expect(await getByTestId(element, 'value')).to.not.exist;
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-attribute-card lang="es"></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'attribute-card spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const router = createRouter();

      const layout = html`
        <foxy-attribute-card
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-attribute-card>
      `;

      const element = await fixture<AttributeCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'attribute-card spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-attribute-card href="/" lang="es"></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'attribute-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData('./hapi/customer_attributes/0');
      const layout = html`<foxy-attribute-card .data=${data}></foxy-attribute-card>`;
      const element = await fixture<AttributeCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
