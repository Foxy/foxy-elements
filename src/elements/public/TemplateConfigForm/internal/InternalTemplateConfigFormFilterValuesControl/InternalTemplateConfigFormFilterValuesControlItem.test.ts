import './index';

import { InternalTemplateConfigFormFilterValuesControlItem as Item } from './InternalTemplateConfigFormFilterValuesControlItem';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { getByTestId } from '../../../../../testgen/getByTestId';
import { html } from 'lit-html';

describe('TemplateConfigForm', () => {
  describe('InternalTemplateConfigFormFilterValuesControlItem', () => {
    const sampleOptions: Record<string, { n: string; c: string }> = {
      SD: { n: 'South Dakota', c: 'SD' },
      TN: { n: 'Tennessee', c: 'TN' },
      TX: { n: 'Texas', c: 'TX' },
    };

    it('extends InternalControl', () => {
      expect(new Item()).to.be.instanceOf(InternalControl);
    });

    it('has an empty default i18next namespace', () => {
      expect(new Item()).to.have.empty.property('ns');
    });

    it('has an empty regions array by default', () => {
      expect(new Item()).to.have.empty.property('regions');
    });

    it('has an empty options map by default', () => {
      expect(new Item()).to.have.deep.property('options', {});
    });

    it('has an empty country name by default', () => {
      expect(new Item()).to.have.empty.property('name');
    });

    it('has an empty country code by default', () => {
      expect(new Item()).to.have.empty.property('code');
    });

    it('displays country code if available', async () => {
      const element = await fixture<Item>(html`
        <foxy-internal-template-config-form-filter-values-control-item code="US">
        </foxy-internal-template-config-form-filter-values-control-item>
      `);

      const country = await getByTestId(element, 'country');
      expect(country).to.include.text('US');
    });

    it('displays country name if available', async () => {
      const layout = html`
        <foxy-internal-template-config-form-filter-values-control-item
          code="US"
          name="United States"
        >
        </foxy-internal-template-config-form-filter-values-control-item>
      `;

      const element = await fixture<Item>(layout);
      const country = await getByTestId(element, 'country');

      expect(country).to.include.text('United States');
    });

    it('emits "delete" event when Delete Country button is clicked', async () => {
      const layout = html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`;
      const element = await fixture<Item>(layout);
      const country = (await getByTestId(element, 'country')) as HTMLElement;
      const button = country.querySelector('button[aria-label="delete"]') as HTMLButtonElement;
      const deleteEvent = oneEvent(element, 'delete');

      button.click();

      expect(await deleteEvent).to.be.instanceOf(CustomEvent);
    });

    it('renders regions as names when available', async () => {
      const regions = ['SD', 'TX', 'TN'] as const;
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item
            .regions=${regions}
            .options=${sampleOptions}
          >
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const wrapper = (await getByTestId(element, 'regions')) as HTMLElement;
      regions.forEach((code, index) => {
        expect(wrapper.children[index]).to.include.text(sampleOptions[code].n);
      });
    });

    it('can delete a region', async () => {
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item
            .regions=${['AL', 'TX', 'WA']}
            .options=${sampleOptions}
            name="United States"
            code="US"
          >
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const wrapper = (await getByTestId(element, 'regions')) as HTMLElement;
      const regionToDelete = wrapper.children[1];
      const deleteButton = regionToDelete.querySelector('button') as HTMLButtonElement;

      deleteButton.click();
      expect(element).to.have.deep.property('regions', ['AL', 'WA']);
    });

    it('renders a select field with options', async () => {
      const regions = ['AL'] as const;
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item
            .regions=${regions}
            .options=${sampleOptions}
          >
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const select = element.renderRoot.querySelector('select') as HTMLSelectElement;

      expect(select.options[1]).to.have.property('value', 'SD');
      expect(select.options[1]).to.include.text('South Dakota');

      expect(select.options[2]).to.have.property('value', 'TN');
      expect(select.options[2]).to.include.text('Tennessee');
    });

    it('is enabled by default', async () => {
      const element = await fixture<Item>(
        html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`
      );

      element.querySelectorAll('select, button').forEach(control => {
        expect(control).to.not.have.attribute('disabled');
      });
    });

    it('is disabled when element is disabled', async () => {
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item disabled>
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      element.querySelectorAll('select, button').forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });
  });
});
