import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { CustomerCard } from './index';
import { Data } from './types';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('CustomerCard', () => {
  it('extends NucleonElement', () => {
    expect(new CustomerCard()).to.be.instanceOf(NucleonElement);
  });

  it('has property+attribute "lang" initialized with empty string', () => {
    expect(CustomerCard.properties).to.have.deep.property('lang', { type: String });
    expect(new CustomerCard()).to.have.property('lang', '');
  });

  it('has property+attribute "ns" initialized with "customer-card"', () => {
    expect(CustomerCard.properties).to.have.deep.property('ns', { type: String });
    expect(new CustomerCard()).to.have.property('ns', 'customer-card');
  });

  describe('name', () => {
    it('renders name once loaded', async () => {
      const data = await getTestData<Data>('https://demo.foxycart.com/s/admin/customers/0');
      const layout = html`<foxy-customer-card .data=${data}></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      const name = await getByTestId(element, 'name');

      expect(name).to.include.text(`${data.first_name} ${data.last_name}`);
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-customer-card></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByName(element, 'name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const name = 'name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerCard>(html`
        <foxy-customer-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const layout = html`<foxy-customer-card></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByName(element, 'name:after')).to.have.property('localName', 'slot');
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const name = 'name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerCard>(html`
        <foxy-customer-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-customer-card></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-customer-card hidden></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "name"', async () => {
      const layout = html`<foxy-customer-card hiddencontrols="name"></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });
  });

  describe('email', () => {
    it('renders email once loaded if provided', async () => {
      const data = await getTestData<Data>('https://demo.foxycart.com/s/admin/customers/0');
      const layout = html`<foxy-customer-card .data=${data}></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      const name = await getByTestId(element, 'email');

      expect(name).to.include.text(data.email);
    });

    it('renders "email:before" slot by default', async () => {
      const layout = html`<foxy-customer-card></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByName(element, 'email:before')).to.have.property('localName', 'slot');
    });

    it('replaces "email:before" slot with template "email:before" if available', async () => {
      const name = 'email:before';
      const email = `<p>email of the "${name}" template.</p>`;
      const element = await fixture<CustomerCard>(html`
        <foxy-customer-card>
          <template slot=${name}>${unsafeHTML(email)}</template>
        </foxy-customer-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(email);
    });

    it('renders "email:after" slot by default', async () => {
      const layout = html`<foxy-customer-card></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByName(element, 'email:after')).to.have.property('localName', 'slot');
    });

    it('replaces "email:after" slot with template "email:after" if available', async () => {
      const name = 'email:after';
      const email = `<p>email of the "${name}" template.</p>`;
      const element = await fixture<CustomerCard>(html`
        <foxy-customer-card>
          <template slot=${name}>${unsafeHTML(email)}</template>
        </foxy-customer-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(email);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-customer-card></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByTestId(element, 'email')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-customer-card hidden></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes email', async () => {
      const layout = html`<foxy-customer-card hiddencontrols="email"></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-customer-card lang="es" ns="foo"></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const layout = html`<foxy-customer-card href="/" lang="es" ns="foo"></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-customer-card href="/" lang="es" ns="foo"></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'));

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData<any>('https://demo.foxycart.com/s/admin/customers/0');
      const layout = html`<foxy-customer-card .data=${data}></foxy-customer-card>`;
      const element = await fixture<CustomerCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
