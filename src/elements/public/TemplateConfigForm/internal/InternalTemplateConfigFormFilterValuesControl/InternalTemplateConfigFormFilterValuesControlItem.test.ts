import './index';

import { InternalTemplateConfigFormFilterValuesControlItem as Item } from './InternalTemplateConfigFormFilterValuesControlItem';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { getByTestId } from '../../../../../testgen/getByTestId';
import { html } from 'lit-html';

describe('TemplateConfigForm', () => {
  describe('InternalTemplateConfigFormFilterValuesControlItem', () => {
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
      expect(new Item()).to.be.instanceOf(NucleonElement);
    });

    it('has an empty default i18next namespace', () => {
      expect(new Item()).to.have.empty.property('ns');
    });

    it('has an empty regions array by default', () => {
      expect(new Item()).to.have.empty.property('regions');
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

    it('renders regions as codes when available', async () => {
      const layout = html`
        <foxy-internal-template-config-form-filter-values-control-item
          .regions=${['AL', 'TX', 'WA']}
        >
        </foxy-internal-template-config-form-filter-values-control-item>
      `;

      const element = await fixture<Item>(layout);
      const regions = (await getByTestId(element, 'regions')) as HTMLElement;

      element.regions.forEach((code, index) => {
        expect(regions.children[index]).to.include.text(code);
      });
    });

    it('renders regions as names when available', async () => {
      const regions = ['AL', 'TX', 'WA'] as const;
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item
            .regions=${regions}
            .data=${sampleData}
          >
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const wrapper = (await getByTestId(element, 'regions')) as HTMLElement;
      regions.forEach((code, index) => {
        expect(wrapper.children[index]).to.include.text(sampleData.values[code].default);
      });
    });

    it('can delete a region', async () => {
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item
            .regions=${['AL', 'TX', 'WA']}
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

    it('can add a region with enter-to-submit', async () => {
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item .regions=${['AL', 'WA']}>
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;

      input.value = 'TX';
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(element).to.have.deep.property('regions', ['AL', 'WA', 'TX']);
    });

    it('can add a region with click-to-submit', async () => {
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item .regions=${['AL', 'WA']}>
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'TX';
      input.dispatchEvent(new InputEvent('input'));
      button.dispatchEvent(new Event('click'));

      expect(element).to.have.deep.property('regions', ['AL', 'WA', 'TX']);
    });

    it('renders a select field with options', async () => {
      const regions = ['AL'] as const;
      const element = await fixture<Item>(
        html`
          <foxy-internal-template-config-form-filter-values-control-item
            .regions=${regions}
            .data=${sampleData}
          >
          </foxy-internal-template-config-form-filter-values-control-item>
        `
      );

      const select = element.renderRoot.querySelector('select') as HTMLSelectElement;

      expect(select.options[1]).to.have.property('value', 'TX');
      expect(select.options[1]).to.include.text('Texas');

      expect(select.options[2]).to.have.property('value', 'WA');
      expect(select.options[2]).to.include.text('Washington');
    });

    it('is enabled by default', async () => {
      const element = await fixture<Item>(
        html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`
      );

      element.querySelectorAll('input, button[aria-label="delete"]').forEach(control => {
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

      element.querySelectorAll('input, button[aria-label="delete"]').forEach(control => {
        expect(control).to.have.attribute('disabled');
      });
    });

    it('disables Add Region button when New Region input is empty', async () => {
      const element = await fixture<Item>(
        html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = '';
      input.dispatchEvent(new InputEvent('input'));

      await element.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });

    it('enables Add Region button when New Region input has value', async () => {
      const element = await fixture<Item>(
        html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`
      );

      const wrapper = (await getByTestId(element, 'new-region')) as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;
      const button = wrapper.querySelector('button') as HTMLButtonElement;

      input.value = 'WA';
      input.dispatchEvent(new InputEvent('input'));

      await element.requestUpdate();
      expect(button).to.not.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const element = await fixture<Item>(
        html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`
      );

      element.querySelectorAll('input').forEach(input => {
        expect(input).to.not.have.attribute('readonly');
      });
    });

    it('is readonly when element is readonly', async () => {
      const element = await fixture<Item>(
        html`<foxy-internal-template-config-form-filter-values-control-item></foxy-internal-template-config-form-filter-values-control-item>`
      );

      element.querySelectorAll('input').forEach(input => {
        expect(input).to.have.attribute('readonly');
      });
    });
  });
});
