import './index';

import { InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleCard as Card } from './index';
import { expect, fixture, html } from '@open-wc/testing';
import { Data } from './types';

describe('CustomerPortalSettingsForm', () => {
  describe('InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleCard', () => {
    it('imports and defines foxy-internal-card', () => {
      expect(customElements.get('foxy-internal-card')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card', () => {
      expect(
        customElements.get(
          'foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card'
        )
      ).to.equal(Card);
    });

    it('extends foxy-internal-card', () => {
      expect(new Card()).to.be.instanceOf(customElements.get('foxy-internal-card'));
    });

    it('has an empty default i18n namespace', () => {
      expect(Card.defaultNS).to.equal('');
      expect(new Card().ns).to.equal('');
    });

    it('renders a special line 1 text for a rule that applies to all subscriptions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        values: ['.5m', '1m', '2m'],
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card>
        `
      );

      const title = card.renderRoot.querySelector('foxy-i18n[key="title_all"]');

      expect(title).to.exist;
      expect(title).to.have.attribute('infer', '');
      expect(title).to.have.deep.property('options', { query: '*' });
    });

    it('renders a special line 1 text for a rule that applies to some subscriptions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '$contains(frequency, "m")',
        values: ['.5m', '1m', '2m'],
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card>
        `
      );

      const title = card.renderRoot.querySelector('foxy-i18n[key="title_matching"]');

      expect(title).to.exist;
      expect(title).to.have.attribute('infer', '');
      expect(title).to.have.deep.property('options', { query: '$contains(frequency, "m")' });
    });

    it('renders a special line 2 text for a rule that has no values', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        values: [],
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card>
        `
      );

      const subtitle = card.renderRoot.querySelector('foxy-i18n[key="subtitle_empty"]');

      expect(subtitle).to.exist;
      expect(subtitle).to.have.attribute('infer', '');
      expect(subtitle).to.have.deep.property('options', { list: '' });
    });

    it('renders a list of frequencies for a rule that has values', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        values: ['.5m', '1m', '2y'],
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card>
        `
      );

      const subtitle = card.renderRoot.querySelector('foxy-i18n[key="subtitle_list"]');

      expect(subtitle).to.exist;
      expect(subtitle).to.have.attribute('infer', '');
      expect(subtitle).to.have.deep.property('options', {
        list: 'twice_a_week, monthly, yearly',
      });
    });
  });
});
