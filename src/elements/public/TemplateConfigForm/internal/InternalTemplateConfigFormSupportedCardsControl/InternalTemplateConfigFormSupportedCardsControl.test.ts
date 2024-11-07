import './index';

import { InternalTemplateConfigFormSupportedCardsControl as Control } from './InternalTemplateConfigFormSupportedCardsControl';
import { InternalEditableControl } from '../../../../internal/InternalEditableControl';
import { expect, fixture, html } from '@open-wc/testing';
import { getByTestId } from '../../../../../testgen/getByTestId';

describe('TemplateConfigForm', () => {
  describe('InternalTemplateConfigFormSupportedCardsControl', () => {
    it('extends InternalEditableControl', () => {
      expect(new Control()).to.be.instanceOf(InternalEditableControl);
    });

    const typeToName: Record<string, string> = {
      amex: 'American Express',
      diners: 'Diners Club',
      discover: 'Discover',
      jcb: 'JCB',
      maestro: 'Maestro',
      mastercard: 'Mastercard',
      unionpay: 'UnionPay',
      visa: 'Visa',
    };

    Object.entries(typeToName).forEach(([type, name]) => {
      it(`renders ${name} card`, async () => {
        let value: string[] = [type];

        const control = await fixture<Control>(html`
          <foxy-internal-template-config-form-supported-cards-control
            .getValue=${() => value}
            .setValue=${(v: string[]) => (value = v)}
          >
          </foxy-internal-template-config-form-supported-cards-control>
        `);

        const card = await getByTestId(control, type);
        const label = card?.querySelector('label');
        const input = label?.querySelector('input');

        expect(label).to.include.text(name);
        expect(input).to.have.attribute('type', 'checkbox');
        expect(input).to.have.attribute('checked');

        input!.checked = false;
        input!.dispatchEvent(new Event('change'));
        expect(value).to.not.include(type);

        input!.checked = true;
        input!.dispatchEvent(new Event('change'));
        expect(value).to.include(type);
      });
    });

    it('disables inputs when disabled', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-template-config-form-supported-cards-control>
        </foxy-internal-template-config-form-supported-cards-control>
      `);

      control.renderRoot.querySelectorAll('input').forEach(input => {
        expect(input).to.not.have.attribute('disabled');
      });

      control.disabled = true;
      await control.requestUpdate();

      control.renderRoot.querySelectorAll('input').forEach(input => {
        expect(input).to.have.attribute('disabled');
      });
    });

    it('makes inputs readonly when readonly', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-template-config-form-supported-cards-control>
        </foxy-internal-template-config-form-supported-cards-control>
      `);

      control.renderRoot.querySelectorAll('input').forEach(input => {
        expect(input).to.not.have.attribute('readonly');
      });

      control.readonly = true;
      await control.requestUpdate();

      control.renderRoot.querySelectorAll('input').forEach(input => {
        expect(input).to.have.attribute('readonly');
      });
    });
  });
});
