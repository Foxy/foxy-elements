import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalTemplateConfigFormFilterValuesControlItem as Item } from './InternalTemplateConfigFormFilterValuesControlItem';
import { InternalTemplateConfigFormFilterValuesControl as Control } from './InternalTemplateConfigFormFilterValuesControl';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { createRouter } from '../../../../../server';
import { getByTestId } from '../../../../../testgen/getByTestId';
import { html } from 'lit-html';

describe('TemplateConfigForm', () => {
  describe('InternalTemplateConfigFormFilterValuesControl', () => {
    it('extends InternalEditableControl', () => {
      expect(new Control()).to.be.instanceOf(InternalEditableControl);
    });

    it('has an empty default i18next namespace', () => {
      expect(new Control()).to.have.empty.property('ns');
    });

    it('has an empty countries map by default', () => {
      expect(new Control()).to.have.empty.property('countries');
    });

    it('has an empty regions URL by default', () => {
      expect(new Control()).to.have.empty.property('regions');
    });

    it('renders countries as InternalTemplateConfigFormFilterValuesControlItem elements', async () => {
      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          countries="https://demo.api/hapi/property_helpers/3"
          regions="https://demo.api/hapi/property_helpers/4"
          .getValue=${() => ({ US: ['WA', 'TX'], CA: '*' })}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;

      expect(wrapper.children[0]).to.have.attribute('regions', JSON.stringify(['WA', 'TX']));
      expect(wrapper.children[0]).to.have.attribute('infer', '');
      expect(wrapper.children[0]).to.have.attribute('code', 'US');
      expect(wrapper.children[0]).to.have.attribute(
        'href',
        'https://demo.api/hapi/property_helpers/4?country_code=US'
      );

      expect(wrapper.children[1]).to.have.attribute('regions', JSON.stringify([]));
      expect(wrapper.children[1]).to.have.attribute('infer', '');
      expect(wrapper.children[1]).to.have.attribute('code', 'CA');
      expect(wrapper.children[1]).to.have.attribute(
        'href',
        'https://demo.api/hapi/property_helpers/4?country_code=CA'
      );
    });

    it('can delete a country', async () => {
      let value: Record<string, string[] | '*'> = { US: ['WA', 'TX'], CA: '*' };

      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[] | '*'>) => (value = newValue)}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;
      wrapper.children[1].dispatchEvent(new CustomEvent('delete'));

      expect(value).to.deep.equal({ US: ['WA', 'TX'] });
    });

    it('can update country regions', async () => {
      let value: Record<string, string[] | '*'> = { US: ['WA', 'TX'], CA: '*' };

      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[] | '*'>) => (value = newValue)}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;
      const card = wrapper.children[1] as Item;

      card.regions = ['QC'];
      card.dispatchEvent(new CustomEvent('update:regions'));

      expect(value).to.deep.equal({ US: ['WA', 'TX'], CA: ['QC'] });
    });

    it('can add a country with enter-to-submit', async () => {
      let value: Record<string, string[] | '*'> = { US: ['WA', 'TX'] };

      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[] | '*'>) => (value = newValue)}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;

      input.value = 'CA';
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(value).to.deep.equal({ US: ['WA', 'TX'], CA: '*' });
    });

    it('can add a country with click-to-submit', async () => {
      let value: Record<string, string[] | '*'> = { US: ['WA', 'TX'] };

      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[] | '*'>) => (value = newValue)}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      const wrapper = (await getByTestId(element, 'new-country')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'CA';
      input.dispatchEvent(new InputEvent('input'));
      button.dispatchEvent(new Event('click'));

      expect(value).to.deep.equal({ US: ['WA', 'TX'], CA: '*' });
    });

    it('renders a select field with options', async () => {
      const router = createRouter();
      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          countries="https://demo.api/hapi/property_helpers/3"
          regions="https://demo.api/hapi/property_helpers/4"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      await waitUntil(
        () => {
          const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
          return [...nucleons].every(nucleon => !!nucleon.data);
        },
        undefined,
        { timeout: 5000 }
      );

      const select = element.renderRoot.querySelector('select') as HTMLSelectElement;

      expect(select.options[1]).to.have.property('value', 'GB');
      expect(select.options[1]).to.include.text('United Kingdom');

      expect(select.options[2]).to.have.property('value', 'US');
      expect(select.options[2]).to.include.text('United States');

      expect(select.options[3]).to.have.property('value', 'UM');
      expect(select.options[3]).to.include.text('United States Minor Outlying Islands');
    });

    it('is enabled by default', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(control => {
        expect(control).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when element is disabled', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-template-config-form-filter-values-control disabled>
          </foxy-internal-template-config-form-filter-values-control>
        `
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('disables Add Country button when New Country input is empty', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
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
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
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
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(input => {
        expect(input).to.not.have.attribute('readonly');
      });
    });

    it('is readonly when element is readonly', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
      );

      element.querySelectorAll('input, [data-testid="countries"] > *').forEach(input => {
        expect(input).to.have.attribute('readonly');
      });
    });
  });
});
