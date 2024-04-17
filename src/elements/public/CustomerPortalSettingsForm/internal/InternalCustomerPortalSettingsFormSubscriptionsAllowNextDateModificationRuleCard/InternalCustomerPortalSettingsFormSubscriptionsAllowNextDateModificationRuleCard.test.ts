import type { Data } from './types';

import './index';

import { InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleCard as Card } from './InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleCard';
import { expect, fixture, html } from '@open-wc/testing';

describe('CustomerPortalSettingsForm', () => {
  describe('InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleCard', () => {
    it('imports foxy-internal-card', () => {
      expect(customElements.get('foxy-internal-card')).to.exist;
    });

    it('imports foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card', () => {
      expect(
        customElements.get(
          'foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card'
        )
      ).to.equal(Card);
    });

    it('extends foxy-internal-card', () => {
      expect(new Card()).to.be.instanceOf(customElements.get('foxy-internal-card'));
    });

    it('has an empty i18n namespace', () => {
      expect(Card.defaultNS).to.be.empty;
      expect(new Card().ns).to.be.empty;
    });

    it('renders a special line 1 text for a rule that matches all subscriptions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_1_all"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { query: '*' });
    });

    it('renders a special line 1 text for a rule that matches some subscriptions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '$contains(frequency, "w")',
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_1_matching"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { query: '$contains(frequency, "w")' });
    });

    it('renders a special line 2 text for a rule with no range restrictions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_2"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { from: 'any', to: 'any' });
    });

    it('renders a special line 2 text for a rule with range restrictions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        min: '1w',
        max: '2m',
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_2"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { from: 'unit_w', to: 'unit_m' });
    });

    it('renders a special line 3 text for a rule with no day/date restrictions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_3_any"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { list: undefined });
    });

    it('renders a special line 3 text for a rule with date of month restrictions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        allowedDays: { type: 'month', days: [1, 15] },
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_3_month"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { list: '1, 15' });
    });

    it('renders a special line 3 text for a rule with day of week restrictions', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        allowedDays: { type: 'day', days: [1, 2, 3] },
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_3_day"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { list: 'day_1, day_2, day_3' });
    });

    it('renders a special line 4 text for a rule with no disallowed dates', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_4_none"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', { list: undefined });
    });

    it('renders a special line 4 text for a rule with some disallowed dates', async () => {
      const data: Data = {
        _links: { self: { href: 'https://example.com' } },
        jsonataQuery: '*',
        disallowedDates: ['2021-01-01', '2021-01-02..2021-01-03'],
      };

      const card = await fixture<Card>(
        html`
          <foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card
            .data=${data}
          >
          </foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card>
        `
      );

      const text = card.renderRoot.querySelector('foxy-i18n[key="line_4_some"]')!;

      expect(text).to.exist;
      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', {
        list: 'single_date, date_range',
      });
    });
  });
});
