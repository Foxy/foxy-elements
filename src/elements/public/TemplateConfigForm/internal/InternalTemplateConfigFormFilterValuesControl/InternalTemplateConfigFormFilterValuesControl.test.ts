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

async function waitForIdle(element: Control) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

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

    it('renders countries as InternalTemplateConfigFormFilterValuesControlItem elements', async () => {
      const router = createRouter();
      const element = await fixture<Control>(html`
        <foxy-internal-template-config-form-filter-values-control
          countries="https://demo.api/hapi/property_helpers/3"
          .getValue=${() => ({ US: ['WA', 'TX'], CA: '*' })}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-template-config-form-filter-values-control>
      `);

      await waitForIdle(element);
      const wrapper = (await getByTestId(element, 'countries')) as HTMLElement;

      expect(wrapper.children[0]).to.have.attribute('code', 'US');
      expect(wrapper.children[0]).to.have.attribute('infer', '');
      expect(wrapper.children[0]).to.have.attribute('regions', JSON.stringify(['WA', 'TX']));
      expect(wrapper.children[0]).to.have.attribute(
        'options',
        JSON.stringify({
          SD: { n: 'South Dakota', c: 'SD', alt: [], boost: 1, active: true },
          TN: { n: 'Tennessee', c: 'TN', alt: [], boost: 1, active: true },
          TX: { n: 'Texas', c: 'TX', alt: [], boost: 1, active: true },
        })
      );

      expect(wrapper.children[1]).to.have.attribute('code', 'CA');
      expect(wrapper.children[1]).to.have.attribute('infer', '');
      expect(wrapper.children[1]).to.have.attribute('regions', JSON.stringify([]));
      expect(wrapper.children[1]).to.have.attribute('options', JSON.stringify({}));
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

      element.querySelectorAll('select, [data-testid="countries"] > *').forEach(control => {
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

      element.querySelectorAll('select, [data-testid="countries"] > *').forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('is editable by default', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
      );

      element.querySelectorAll('select, [data-testid="countries"] > *').forEach(input => {
        expect(input).to.not.have.attribute('readonly');
      });
    });

    it('is readonly when element is readonly', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-template-config-form-filter-values-control></foxy-internal-template-config-form-filter-values-control>`
      );

      element.querySelectorAll('select, [data-testid="countries"] > *').forEach(input => {
        expect(input).to.have.attribute('readonly');
      });
    });
  });
});
