import './index';

import { InternalStoreTransactionFolderFormColorControl as Control } from './InternalStoreTransactionFolderFormColorControl';
import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { expect, fixture, html } from '@open-wc/testing';

describe('StoreTransactionFolderForm', () => {
  describe('InternalStoreTransactionFolderFormColorControl', () => {
    it('imports and defines dependencies', () => {
      expect(customElements.get('foxy-internal-editable-control')).to.exist;
    });

    it('imports and defines itself as foxy-internal-store-transaction-folder-color-control', () => {
      const localName = 'foxy-internal-store-transaction-folder-color-control';
      expect(customElements.get(localName)).to.exist;
    });

    it('extends InternalEditableControl', () => {
      const control = new Control();
      expect(control).to.be.instanceOf(InternalEditableControl);
    });

    it('has "colors" property with default value', () => {
      const control = new Control();
      expect(Control.properties).to.have.deep.property('colors', { type: Object });
      expect(control.colors).to.deep.equal({});
    });

    it('renders label text', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-store-transaction-folder-color-control label="Select a color">
        </foxy-internal-store-transaction-folder-color-control>
      `);

      expect(control.renderRoot).to.include.text('Select a color');
    });

    it('renders a radio button for each color', async () => {
      const colors: Control['colors'] = {
        'green': 'bg-green-500',
        'blue': 'bg-blue-500',
        'red': 'bg-red-500',
        '': 'bg-gray-500',
      };

      let value = 'red';

      const control = await fixture<Control>(html`
        <foxy-internal-store-transaction-folder-color-control
          .getValue=${() => value}
          .setValue=${(v: string) => (value = v)}
          .colors=${colors}
        >
        </foxy-internal-store-transaction-folder-color-control>
      `);

      const buttons = control.renderRoot.querySelectorAll<HTMLInputElement>(
        'input[type="radio"][name="color"]'
      );

      expect(buttons).to.have.lengthOf(Object.keys(colors).length);

      expect(buttons[0]).to.have.property('value', 'green');
      expect(buttons[1]).to.have.property('value', 'blue');
      expect(buttons[2]).to.have.property('value', 'red');
      expect(buttons[3]).to.have.property('value', '');

      expect(buttons[0]).to.have.property('checked', false);
      expect(buttons[1]).to.have.property('checked', false);
      expect(buttons[2]).to.have.property('checked', true);
      expect(buttons[3]).to.have.property('checked', false);

      expect(buttons[0]).to.have.attribute('aria-label', 'color_green');
      expect(buttons[1]).to.have.attribute('aria-label', 'color_blue');
      expect(buttons[2]).to.have.attribute('aria-label', 'color_red');
      expect(buttons[3]).to.have.attribute('aria-label', 'color_none');

      buttons[0].click();
      expect(value).to.equal('green');
    });

    it('disables radio buttons when control is disabled', async () => {
      const colors: Control['colors'] = {
        'green': 'bg-green-500',
        'blue': 'bg-blue-500',
        'red': 'bg-red-500',
        '': 'bg-gray-500',
      };

      const control = await fixture<Control>(html`
        <foxy-internal-store-transaction-folder-color-control .colors=${colors}>
        </foxy-internal-store-transaction-folder-color-control>
      `);

      const buttons = control.renderRoot.querySelectorAll('input[type="radio"][name="color"]');
      buttons.forEach(button => expect(button).to.have.property('disabled', false));

      control.disabled = true;
      await control.requestUpdate();
      buttons.forEach(button => expect(button).to.have.property('disabled', true));
    });

    it('removes radio buttons when control is readonly', async () => {
      const colors: Control['colors'] = {
        'green': 'bg-green-500',
        'blue': 'bg-blue-500',
        'red': 'bg-red-500',
        '': 'bg-gray-500',
      };

      const control = await fixture<Control>(html`
        <foxy-internal-store-transaction-folder-color-control .colors=${colors}>
        </foxy-internal-store-transaction-folder-color-control>
      `);

      let buttons = control.renderRoot.querySelectorAll('input[type="radio"][name="color"]');
      expect(buttons).to.have.lengthOf(4);

      control.readonly = true;
      await control.requestUpdate();
      buttons = control.renderRoot.querySelectorAll('input[type="radio"][name="color"]');
      expect(buttons).to.have.lengthOf(0);
    });
  });
});
