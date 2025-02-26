import type { InternalResourcePickerControl } from '../../../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import type { InternalTextControl } from '../../../../internal/InternalTextControl/InternalTextControl';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalNativeIntegrationFormCodeMapControl as Control } from './InternalNativeIntegrationFormCodeMapControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { createRouter } from '../../../../../server/index';

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

describe('NativeIntegrationForm', () => {
  describe('InternalNativeIntegrationFormCodeMapControl', () => {
    it('registers foxy-internal-resource-picker-control element', () => {
      expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
    });

    it('registers foxy-internal-editable-control element', () => {
      expect(customElements.get('foxy-internal-editable-control')).to.exist;
    });

    it('registers foxy-internal-summary-control element', () => {
      expect(customElements.get('foxy-internal-summary-control')).to.exist;
    });

    it('registers foxy-internal-text-control element', () => {
      expect(customElements.get('foxy-internal-text-control')).to.exist;
    });

    it('registers foxy-item-category-card element', () => {
      expect(customElements.get('foxy-item-category-card')).to.exist;
    });

    it('registers foxy-nucleon element', () => {
      expect(customElements.get('foxy-nucleon')).to.exist;
    });

    it('registers itself as foxy-internal-native-integration-form-code-map-control', () => {
      expect(customElements.get('foxy-internal-native-integration-form-code-map-control')).to.exist;
    });

    it('extends InternalEditableControl', () => {
      expect(new Control()).to.be.instanceOf(InternalEditableControl);
    });

    it('has itemCategoryBase property', () => {
      expect(new Control()).to.have.property('itemCategoryBase').that.equals(null);
    });

    it('has itemCategories property', () => {
      expect(new Control()).to.have.property('itemCategories').that.equals(null);
    });

    it('renders existing mappings with the ability to edit and delete them', async () => {
      let value: Record<string, string> = { '0': 'FOO', '1': 'BAR' };

      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-native-integration-form-code-map-control
          item-category-base="https://demo.api/hapi/item_categories/"
          item-categories="https://demo.api/hapi/item_categories?store_id=0"
          .getValue=${() => value}
          .setValue=${(v: Record<string, string>) => (value = v)}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-native-integration-form-code-map-control>
      `);

      await waitForIdle(control);
      await control.requestUpdate();
      const [textControl0, textControl1] = control.renderRoot.querySelectorAll<InternalTextControl>(
        'foxy-internal-summary-control[infer="existing-mappings"] foxy-internal-text-control'
      );

      expect(textControl0).to.exist;
      expect(textControl0).to.have.attribute('helper-text', '');
      expect(textControl0).to.have.attribute('layout', 'summary-item');
      expect(textControl0).to.have.attribute('label', 'Default Item Category');
      expect(textControl0.getValue()).to.equal('FOO');

      textControl0.setValue('BAZ');
      expect(value['0']).to.equal('BAZ');

      expect(textControl1).to.exist;
      expect(textControl1).to.have.attribute('helper-text', '');
      expect(textControl1).to.have.attribute('layout', 'summary-item');
      expect(textControl1).to.have.attribute('label', 'Test Category 1');
      expect(textControl1.getValue()).to.equal('BAR');

      textControl1.setValue('QUX');
      expect(value['1']).to.equal('QUX');

      const [button0, button1] = control.renderRoot.querySelectorAll<HTMLButtonElement>(
        'foxy-internal-summary-control[infer="existing-mappings"] button[aria-label="delete"]'
      );

      expect(button0).to.exist;
      expect(button1).to.exist;

      button0.click();
      expect(value['0']).to.equal(undefined);

      button1.click();
      expect(value['1']).to.equal(undefined);
    });

    it('allows adding new mappings', async () => {
      let value: Record<string, string> = { '0': 'FOO', '1': 'BAR' };

      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-native-integration-form-code-map-control
          item-category-base="https://demo.api/hapi/item_categories/"
          item-categories="https://demo.api/hapi/item_categories?store_id=0"
          .getValue=${() => value}
          .setValue=${(v: Record<string, string>) => (value = v)}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-native-integration-form-code-map-control>
      `);

      await waitForIdle(control);
      await control.requestUpdate();

      const picker = control.renderRoot.querySelector<InternalResourcePickerControl>(
        'foxy-internal-summary-control[infer="new-mapping"] foxy-internal-resource-picker-control'
      );

      expect(picker).to.exist;
      expect(picker).to.have.attribute('first', 'https://demo.api/hapi/item_categories?store_id=0');
      expect(picker).to.have.attribute('infer', '');
      expect(picker).to.have.attribute('item', 'foxy-item-category-card');
      expect(picker).to.have.attribute('layout', 'summary-item');
      expect(picker?.getValue()).to.equal(undefined);

      picker?.setValue('https://demo.api/hapi/item_categories/2');
      expect(value['2']).to.equal('');
      expect(picker?.getValue()).to.equal(undefined);
    });
  });
});
