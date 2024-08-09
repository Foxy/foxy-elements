import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Data } from '../../types';

import { InternalAdminSubscriptionFormError as Control } from './InternalAdminSubscriptionFormError';
import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../../../testgen/getTestData';

import '../../../NucleonElement/index';
import './index';

describe('AdminSubscriptionForm', () => {
  describe('InternalAdminSubscriptionFormError', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('defines itself as foxy-internal-admin-subscription-form-error', () => {
      expect(customElements.get('foxy-internal-admin-subscription-form-error')).to.equal(Control);
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
    });

    it('renders error message from parent form', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data.error_message = 'Test error message';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-error infer="">
          </foxy-internal-admin-subscription-form-error>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      expect(control.renderRoot).to.include.text('Test error message');
    });
  });
});
