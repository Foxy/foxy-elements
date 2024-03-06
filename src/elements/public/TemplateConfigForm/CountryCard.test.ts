import './index';

import { expect, fixture, oneEvent } from '@open-wc/testing';

import { CountryCard } from './CountryCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByTestId } from '../../../testgen/getByTestId';
import { html } from 'lit-html';

customElements.define('test-country-card', CountryCard);

describe('TemplateConfigForm', () => {
  describe('CountryCard', () => {
    const sampleData = {
      _links: { self: { href: 'test://regions' } },
      message: 'Sample regions',
      values: {
        AL: { default: 'Alabama', code: 'AL' },
        TX: { default: 'Texas', code: 'TX' },
        WA: { default: 'Washington', code: 'WA' },
      },
    };

    it('extends NucleonElement', () => {
      expect(new CountryCard()).to.be.instanceOf(NucleonElement);
    });

    it('has an empty default i18next namespace', () => {
      expect(new CountryCard()).to.have.empty.property('ns');
    });

    it('has an empty regions array by default', () => {
      expect(new CountryCard()).to.have.empty.property('regions');
    });

    it('has an empty country name by default', () => {
      expect(new CountryCard()).to.have.empty.property('name');
    });

    it('has an empty country code by default', () => {
      expect(new CountryCard()).to.have.empty.property('code');
    });

    it('displays country code if available', async () => {
      const layout = html`<test-country-card code="US"></test-country-card>`;
      const element = await fixture<CountryCard>(layout);
      const country = await getByTestId(element, 'country');

      expect(country).to.include.text('US');
    });

    it('displays both country name and code if available', async () => {
      const layout = html`<test-country-card code="US" name="United States"></test-country-card>`;
      const element = await fixture<CountryCard>(layout);
      const country = await getByTestId(element, 'country');

      expect(country).to.include.text('United States');
      expect(country).to.include.text('US');
    });

    it('emits "delete" event when Delete Country button is clicked', async () => {
      const layout = html`<test-country-card></test-country-card>`;
      const element = await fixture<CountryCard>(layout);
      const country = (await getByTestId(element, 'country')) as HTMLElement;
      const button = country.querySelector('button[aria-label="delete"]') as HTMLButtonElement;
      const deleteEvent = oneEvent(element, 'delete');

      button.click();

      expect(await deleteEvent).to.be.instanceOf(CustomEvent);
    });

    it('renders regions as codes when available', async () => {
      const layout = html`<test-country-card .regions=${['AL', 'TX', 'WA']}></test-country-card>`;
      const element = await fixture<CountryCard>(layout);
      const regions = (await getByTestId(element, 'regions')) as HTMLElement;

      element.regions.forEach((code, index) => {
        expect(regions.children[index]).to.include.text(code);
      });
    });

    it('renders regions as codes + names when available', async () => {
      const regions = ['AL', 'TX', 'WA'] as const;
      const element = await fixture<CountryCard>(
        html`<test-country-card .regions=${regions} .data=${sampleData}></test-country-card>`
      );

      const wrapper = (await getByTestId(element, 'regions')) as HTMLElement;
      regions.forEach((code, index) => {
        expect(wrapper.children[index]).to.include.text(code);
        expect(wrapper.children[index]).to.include.text(sampleData.values[code].default);
      });
    });

    it('can delete a region', async () => {
      const element = await fixture<CountryCard>(
        html`<test-country-card .regions=${['AL', 'TX', 'WA']}></test-country-card>`
      );

      const wrapper = (await getByTestId(element, 'regions')) as HTMLElement;
      const regionToDelete = wrapper.children[1];
      const deleteButton = regionToDelete.querySelector('button') as HTMLButtonElement;

      deleteButton.click();
      expect(element).to.have.deep.property('regions', ['AL', 'WA']);
    });

    it('can add a region with enter-to-submit', async () => {
      const element = await fixture<CountryCard>(
        html`<test-country-card .regions=${['AL', 'WA']}></test-country-card>`
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;

      input.value = 'TX';
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(element).to.have.deep.property('regions', ['AL', 'WA', 'TX']);
    });

    it('can add a region with click-to-submit', async () => {
      const element = await fixture<CountryCard>(
        html`<test-country-card .regions=${['AL', 'WA']}></test-country-card>`
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'TX';
      input.dispatchEvent(new InputEvent('input'));
      button.dispatchEvent(new Event('click'));

      expect(element).to.have.deep.property('regions', ['AL', 'WA', 'TX']);
    });

    it('renders a datalist with suggestions', async () => {
      const regions = ['AL', 'TX', 'WA'] as const;
      const element = await fixture<CountryCard>(
        html`<test-country-card .regions=${regions} .data=${sampleData}></test-country-card>`
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const datalist = element.renderRoot.querySelector('datalist') as HTMLDataListElement;

      expect(input.list).to.equal(datalist);

      expect(datalist.options[0]).to.have.property('value', 'AL');
      expect(datalist.options[0]).to.include.text('Alabama');

      expect(datalist.options[1]).to.have.property('value', 'TX');
      expect(datalist.options[1]).to.include.text('Texas');

      expect(datalist.options[2]).to.have.property('value', 'WA');
      expect(datalist.options[2]).to.include.text('Washington');
    });

    it('is enabled by default', async () => {
      const element = await fixture<CountryCard>(html`<test-country-card></test-country-card>`);

      element.querySelectorAll('input, button[aria-label="delete"]').forEach(control => {
        expect(control).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when element is disabled', async () => {
      const element = await fixture<CountryCard>(
        html`<test-country-card disabled></test-country-card>`
      );

      element.querySelectorAll('input, button[aria-label="delete"]').forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('disables Add Region button when New Region input is empty', async () => {
      const element = await fixture<CountryCard>(html`<test-country-card></test-country-card>`);

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = '';
      input.dispatchEvent(new InputEvent('input'));

      await element.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });

    it('enables Add Region button when New Region input has value', async () => {
      const element = await fixture<CountryCard>(html`<test-country-card></test-country-card>`);

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'WA';
      input.dispatchEvent(new InputEvent('input'));

      await element.requestUpdate();
      expect(button).to.not.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const element = await fixture<CountryCard>(html`<test-country-card></test-country-card>`);

      element.querySelectorAll('input').forEach(input => {
        expect(input).to.not.have.attribute('readonly');
      });
    });

    it('is readonly when element is readonly', async () => {
      const element = await fixture<CountryCard>(html`<test-country-card></test-country-card>`);

      element.querySelectorAll('input').forEach(input => {
        expect(input).to.have.attribute('readonly');
      });
    });
  });
});
