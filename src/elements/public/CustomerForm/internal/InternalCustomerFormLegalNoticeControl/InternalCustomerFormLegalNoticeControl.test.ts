import { InternalCustomerFormLegalNoticeControl as Control } from './InternalCustomerFormLegalNoticeControl';
import { expect, fixture, html } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { CustomerForm } from '../../CustomerForm';
import { getByKey } from '../../../../../testgen/getByKey';

import '../../index';
import './index';

const portalSettings = {
  _links: { self: { href: '' } },
  allowed_origins: [],
  subscriptions: {
    allow_frequency_modification: [],
    allow_next_date_modification: false,
  },
  session_lifespan_in_minutes: 40320,
  tos_checkbox_settings: {
    usage: 'optional' as const,
    url: 'https://foxy.io/terms-of-service/',
    initial_state: 'unchecked' as const,
    is_hidden: false,
  },
  sign_up: {
    verification: { type: 'hcaptcha' as const, site_key: '123' },
    enabled: true,
  },
  sso: true,
  date_created: '',
  date_modified: '',
};

describe('CustomerForm', () => {
  describe('InternalCustomerFormLegalNoticeControl', () => {
    it('imports and defines foxy-internal-control element', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-i18n element', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-customer-form-legal-notice-control element', () => {
      expect(customElements.get('foxy-internal-customer-form-legal-notice-control')).to.exist;
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(InternalControl);
    });

    it('renders translatable legal notice', async () => {
      const control = await fixture<Control>(new Control());
      const i18n = await getByKey(control, 'text');

      expect(i18n).to.exist;
      expect(i18n).to.have.attribute('infer', '');
    });

    it('renders translatable link text', async () => {
      const control = await fixture<Control>(new Control());
      const i18n = await getByKey(control, 'link');

      expect(i18n).to.exist;
      expect(i18n).to.have.attribute('infer', '');
      expect(i18n?.closest('a')).to.exist;
    });

    it('renders link to tos_checkbox_settings.url', async () => {
      const form = await fixture<CustomerForm>(html`
        <foxy-customer-form .settings=${portalSettings}></foxy-customer-form>
      `);

      const control = form.renderRoot.querySelector('[infer="legal-notice"]') as Control;
      await control.requestUpdate();
      const link = control.renderRoot.querySelector('a') as HTMLAnchorElement;

      expect(link).to.exist;
      expect(link).to.have.attribute('target', '_blank');
      expect(link).to.have.attribute('href', portalSettings.tos_checkbox_settings.url);
      expect(link).to.have.attribute('rel', 'noopener noreferrer');
    });
  });
});
