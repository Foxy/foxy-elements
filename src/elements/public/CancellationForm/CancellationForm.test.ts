import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CancellationForm } from './CancellationForm';
import { Data } from './types';
import { InternalCalendar } from '../../internal/InternalCalendar';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('CancellationForm', () => {
  it('extends NucleonElement', () => {
    expect(new CancellationForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-cancellation-form', () => {
    expect(customElements.get('foxy-cancellation-form')).to.equal(CancellationForm);
  });

  describe('warning', () => {
    it('renders foxy-i18n with warning message', async () => {
      const layout = html`<foxy-cancellation-form lang="es"></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const warning = await getByTestId(element, 'warning');

      expect(warning).to.have.property('localName', 'foxy-i18n');
      expect(warning).to.have.attribute('lang', 'es');
      expect(warning).to.have.attribute('key', 'end_subscription_explainer');
      expect(warning).to.have.attribute('ns', 'cancellation-form');
    });

    it('renders "warning:before" slot by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByName(element, 'warning:before')).to.have.property('localName', 'slot');
    });

    it('replaces "warning:before" slot with template "warning:before" if available', async () => {
      const name = 'warning:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-cancellation-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "warning:after" slot by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByName(element, 'warning:after')).to.have.property('localName', 'slot');
    });

    it('replaces "warning:after" slot with template "warning:after" if available', async () => {
      const name = 'warning:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-cancellation-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('hidden if form is hidden', async () => {
      const layout = html`<foxy-cancellation-form hidden></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'warning')).not.to.exist;
    });

    it('hidden if hiddencontrols includes "warning"', async () => {
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form hiddencontrols="warning"></foxy-cancellation-form>
      `);

      expect(await getByTestId(element, 'warning')).not.to.exist;
    });
  });

  describe('end-date', () => {
    it('has foxy-i18n label with key "end_date"', async () => {
      const layout = html`<foxy-cancellation-form lang="es"></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const label = await getByTestId(element, 'end-date-label');

      expect(label).to.have.property('localName', 'foxy-i18n');
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('key', 'end_date');
      expect(label).to.have.attribute('ns', 'cancellation-form');
    });

    it('has value of form.end_date', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const value = new Date(Date.now() + 86400000).toISOString();

      element.edit({ end_date: value });

      expect(await getByTestId(element, 'end-date')).to.have.property('value', value);
    });

    it('writes to form.end_date on input', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const control = await getByTestId<InternalCalendar>(element, 'end-date');
      const value = new Date(Date.now() + 86400000).toISOString();

      control!.value = value;
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.end_date', value);
    });

    it('renders "end-date:before" slot by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByName(element, 'end-date:before')).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:before" slot with template "end-date:before" if available', async () => {
      const name = 'end-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-cancellation-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "end-date:after" slot by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByName(element, 'end-date:after')).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:after" slot with template "end-date:after" if available', async () => {
      const name = 'end-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-cancellation-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'end-date')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-cancellation-form readonly></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'end-date')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes phone', async () => {
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form readonlycontrols="end-date"></foxy-cancellation-form>
      `);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('readonly');
    });

    it('is readonly when data.end_date is set', async () => {
      const data = await getTestData<Data>('./s/admin/subscriptions/0');
      data.end_date = new Date(Date.now() + 84600000).toISOString();

      const layout = html`<foxy-cancellation-form .data=${data}></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('readonly');
    });

    it('is disabled by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('is enabled once loaded', async () => {
      const data = await getTestData('./s/admin/subscriptions/0');
      const layout = html`<foxy-cancellation-form .data=${data}></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);

      expect(await getByTestId(element, 'end-date')).not.to.have.attribute('disabled');
    });

    it('once loaded, disabled when element is disabled', async () => {
      const data = await getTestData('./s/admin/subscriptions/0');
      const layout = html`<foxy-cancellation-form .data=${data} disabled></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('once loaded, disabled when disabledcontrols includes "end-date"', async () => {
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form
          .data=${await getTestData('./s/admin/subscriptions/0')}
          disabledcontrols="end-date"
        >
        </foxy-cancellation-form>
      `);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('hidden if form is hidden', async () => {
      const layout = html`<foxy-cancellation-form hidden></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('hidden if hiddencontrols includes "end-date"', async () => {
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form hiddencontrols="end-date"></foxy-cancellation-form>
      `);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });
  });

  describe('submit', () => {
    it('renders with i18n key "end_subscription" for caption', async () => {
      const layout = html`<foxy-cancellation-form lang="es"></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const control = await getByTestId(element, 'submit');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'end_subscription');
      expect(caption).to.have.attribute('ns', 'cancellation-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-cancellation-form disabled></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      element.edit({ end_date: null });
      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);

      element.edit({ end_date: new Date(Date.now() + 84600000).toISOString() });
      element.submit();

      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "submit"', async () => {
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form disabledcontrols="submit"></foxy-cancellation-form>
      `);

      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const data = await getTestData('./s/admin/subscriptions/0');
      const layout = html`<foxy-cancellation-form .data=${data}></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'submit');
      const submitMethod = stub(element, 'submit');

      element.edit({ end_date: new Date(Date.now() + 84600000).toISOString() });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submitMethod).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-cancellation-form hidden></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      expect(await getByTestId(element, 'submit')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "submit"', async () => {
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form hiddencontrols="submit"></foxy-cancellation-form>
      `);

      expect(await getByTestId(element, 'submit')).to.not.exist;
    });

    it('renders with "submit:before" slot by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'submit:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "submit:before" slot with template "submit:before" if available and rendered', async () => {
      const name = 'submit:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-cancellation-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "submit:after" slot by default', async () => {
      const layout = html`<foxy-cancellation-form></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'submit:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "submit:after" slot with template "submit:after" if available and rendered', async () => {
      const name = 'submit:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CancellationForm>(html`
        <foxy-cancellation-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-cancellation-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-cancellation-form href=${href} lang="es"></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'cancellation-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-cancellation-form href=${href} lang="es"></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'cancellation-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./s/admin/subscriptions/0');
      const layout = html`<foxy-cancellation-form .data=${data}></foxy-cancellation-form>`;
      const element = await fixture<CancellationForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
