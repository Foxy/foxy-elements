import './index';

import { expect, fixture } from '@open-wc/testing';

import { CountriesList } from './CountriesList';
import { CountryCard } from './CountryCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByTestId } from '../../../testgen/getByTestId';
import { html } from 'lit-html';

customElements.define('test-countries-list', CountriesList);

describe('TemplateConfigForm', () => {
  describe('CountriesList', () => {
    const sampleData = {
      _links: { self: { href: 'test://countries' } },
      message: 'Sample countries',
      values: {
        US: { default: 'United States' },
        CA: { default: 'Canada' },
        AU: { default: 'Australia' },
      },
    };

    it('extends NucleonElement', () => {
      expect(new CountriesList()).to.be.instanceOf(NucleonElement);
    });

    it('has an empty default i18next namespace', () => {
      expect(new CountriesList()).to.have.empty.property('ns');
    });

    it('has an empty countries map by default', () => {
      expect(new CountriesList()).to.have.empty.property('countries');
    });

    it('has an empty fx:regions URL by default', () => {
      expect(new CountriesList()).to.have.empty.property('countries');
    });

    it('renders countries as CountryCard elements', async () => {
      const element = await fixture<CountriesList>(html`
        <test-countries-list
          regions="test://regions"
          lang="es"
          ns="foo"
          .countries=${{ US: ['WA', 'TX'], CA: '*' }}
          .data=${sampleData}
        >
        </test-countries-list>
      `);

      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;

      expect(wrapper.children[0]).to.have.attribute('regions', JSON.stringify(['WA', 'TX']));
      expect(wrapper.children[0]).to.have.attribute('code', 'US');
      expect(wrapper.children[0]).to.have.attribute('href', 'test://regions?country_code=US');
      expect(wrapper.children[0]).to.have.attribute('lang', 'es');
      expect(wrapper.children[0]).to.have.attribute('ns', 'foo');

      expect(wrapper.children[1]).to.have.attribute('regions', JSON.stringify([]));
      expect(wrapper.children[1]).to.have.attribute('code', 'CA');
      expect(wrapper.children[1]).to.have.attribute('href', 'test://regions?country_code=CA');
      expect(wrapper.children[1]).to.have.attribute('lang', 'es');
      expect(wrapper.children[1]).to.have.attribute('ns', 'foo');
    });

    it('can delete a country', async () => {
      const element = await fixture<CountriesList>(html`
        <test-countries-list .countries=${{ US: ['WA', 'TX'], CA: '*' }}> </test-countries-list>
      `);

      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;
      wrapper.children[1].dispatchEvent(new CustomEvent('delete'));

      expect(element).to.have.deep.property('countries', { US: ['WA', 'TX'] });
    });

    it('can update country regions', async () => {
      const element = await fixture<CountriesList>(html`
        <test-countries-list .countries=${{ US: ['WA', 'TX'], CA: '*' }}> </test-countries-list>
      `);

      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;
      const card = wrapper.children[1] as CountryCard;

      card.regions = ['QC'];
      card.dispatchEvent(new CustomEvent('update:regions'));

      expect(element).to.have.deep.property('countries', { US: ['WA', 'TX'], CA: ['QC'] });
    });

    it('can add a country with enter-to-submit', async () => {
      const element = await fixture<CountriesList>(html`
        <test-countries-list .countries=${{ US: ['WA', 'TX'] }}> </test-countries-list>
      `);

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;

      input.value = 'CA';
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(element).to.have.deep.property('countries', { US: ['WA', 'TX'], CA: '*' });
    });

    it('can add a country with click-to-submit', async () => {
      const element = await fixture<CountriesList>(html`
        <test-countries-list .countries=${{ US: ['WA', 'TX'] }}> </test-countries-list>
      `);

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'CA';
      input.dispatchEvent(new InputEvent('input'));
      button.dispatchEvent(new Event('click'));

      expect(element).to.have.deep.property('countries', { US: ['WA', 'TX'], CA: '*' });
    });

    it('renders a datalist with suggestions', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list .data=${sampleData}></test-countries-list>`
      );

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const datalist = element.renderRoot.querySelector('datalist') as HTMLDataListElement;

      expect(input.list).to.equal(datalist);

      expect(datalist.options[0]).to.have.property('value', 'US');
      expect(datalist.options[0]).to.include.text('United States');

      expect(datalist.options[1]).to.have.property('value', 'CA');
      expect(datalist.options[1]).to.include.text('Canada');

      expect(datalist.options[2]).to.have.property('value', 'AU');
      expect(datalist.options[2]).to.include.text('Australia');
    });

    it('is enabled by default', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list></test-countries-list>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(control => {
        expect(control).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when element is disabled', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list disabled></test-countries-list>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('disables Add Country button when New Country input is empty', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list></test-countries-list>`
      );

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = '';
      input.dispatchEvent(new InputEvent('input'));

      await element.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });

    it('enables Add Country button when New Country input has value', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list></test-countries-list>`
      );

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'US';
      input.dispatchEvent(new InputEvent('input'));

      await element.requestUpdate();
      expect(button).to.not.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list></test-countries-list>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(input => {
        expect(input).to.not.have.attribute('readonly');
      });
    });

    it('is readonly when element is readonly', async () => {
      const element = await fixture<CountriesList>(
        html`<test-countries-list></test-countries-list>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(input => {
        expect(input).to.have.attribute('readonly');
      });
    });
  });
});
