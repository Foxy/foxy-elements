import './index';
import { elementUpdated, expect, fixture, html, waitUntil } from '@open-wc/testing';
import { DefaultTests } from '../../../utils/test-utils';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TaxForm } from './TaxForm';
import { router } from '../../../server/admin';

const taxFormUrl = 'https://demo.foxycart.com/s/admin/stores/0/taxes/0';

const taxFormHtml = html`
  <foxy-tax-form
    href=${taxFormUrl}
    @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
  ></foxy-tax-form>
`;

/**
 * @param charNumber
 */
function longText(charNumber: number) {
  return Array(charNumber + 1).join('x');
}

describe('Input Validation', function () {
  // Note: given that combo box will not be filled with unknown value, unknown
  // values err like empty fields
  const cases = [
    { changes: {}, message: 'v8n_required', name: 'name', value: '' },
    { changes: {}, message: 'v8n_too_long', name: 'name', value: longText(31) },
    { changes: {}, message: 'v8n_required', name: 'type', value: 'arbitrary text' },
    { changes: {}, message: 'v8n_required', name: 'type', value: '' },
    { changes: { type: 'country' }, message: 'v8n_required', name: 'country', value: '' },
    { changes: { type: 'country' }, message: 'v8n_unknown', name: 'country', value: longText(3) },
    { changes: { type: 'country' }, message: 'v8n_unknown', name: 'country', value: 'a' },
    { changes: { type: 'region' }, message: 'v8n_required', name: 'region', value: longText(21) },
    { changes: { type: 'region' }, message: 'v8n_required', name: 'region', value: '' },
    { changes: { type: 'local' }, message: 'v8n_required', name: 'city', value: '' },
    { changes: { type: 'local' }, message: 'v8n_too_long', name: 'city', value: longText(51) },
    {
      changes: { is_live: true, type: 'country' },
      message: 'v8n_required',
      name: 'service_provider',
      value: '',
    },
    {
      changes: {
        is_live: true,
        service_provider: 'thomsonreuters',
        type: 'union',
        use_origin_rates: true,
      },
      message: 'v8n_required',
      name: 'country',
      value: '',
    },
    {
      changes: { is_live: false, type: 'country' },
      message: 'v8n_unknown',
      name: 'rate',
      value: 200,
    },
    {
      changes: { is_live: false, type: 'country' },
      message: 'v8n_required',
      name: 'rate',
      value: '',
    },
  ];

  for (const c of cases) {
    it('Validates ' + c.name + ' to' + c.message, async function () {
      const el: TaxForm = await fixture(html`
        <foxy-tax-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-tax-form>
      `);
      await waitUntil(() => el.in('idle'), 'Element should become idle');
      const changes: any = c.changes;
      changes[c.name] = c.value.toString();
      el.edit(changes);
      await waitUntil(() => el.in('idle'), 'Element should become idle');
      const inputEl = el.shadowRoot?.querySelector(`[data-testid="${c.name}"]`);
      expect(inputEl).to.exist;
      await elementUpdated(inputEl as HTMLInputElement);
      const error = inputEl?.getAttribute('error-message');
      expect(error).to.equal(c.message);
    });
  }
});

describe('Tax type', function () {
  let el: TaxForm;

  beforeEach(async () => {
    el = await fixture(html`
      <foxy-tax-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-tax-form>
    `);
  });

  describe('Scope hierarchy', function () {
    it('Should show country, region and city when type is local', async function () {
      el.edit({ type: 'local' });
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector(`[data-testid="country"]`)).to.exist;
      expect(el.shadowRoot?.querySelector(`[data-testid="region"]`)).to.exist;
      expect(el.shadowRoot?.querySelector(`[data-testid="city"]`)).to.exist;
    });

    it('Should show country and region when type is region', async function () {
      el.edit({ type: 'region' });
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector(`[data-testid="country"]`)).to.exist;
      expect(el.shadowRoot?.querySelector(`[data-testid="region"]`)).to.exist;
    });

    it('Should show country when type is country', async function () {
      el.edit({ type: 'country' });
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector(`[data-testid="country"]`)).to.exist;
    });

    it('Should show country when type is union and use origin country is set', async function () {
      el.edit({
        is_live: true,
        service_provider: 'thomsonreuters',
        type: 'union',
        use_origin_rates: true,
      } as any);
      expect(el.shadowRoot?.querySelector(`[data-testid="country"]`)).to.exist;
    });

    it('Should set countries conditionally on union', async function () {
      el.edit({ type: 'country' });
      await elementUpdated(el);
      const combo = el.shadowRoot?.querySelector('[data-testid="country"]');
      expect(combo).to.exist;
      expect(
        !!(combo as any).items.find((e: { value: string }) => e.value == 'CA'),
        'Canada is missing from world list.'
      ).to.be.true;
      el.edit({ type: 'union' } as any);
      await elementUpdated(el);
      expect(
        !!(combo as any).items.find((e: { value: string }) => e.value == 'CA'),
        'Canada is showing in the EU list.'
      ).to.be.false;
    });

    it('Should set regions conditionally on countries', async function () {
      el.edit({ type: 'region' });
      await elementUpdated(el);
      el.edit({ country: 'US' });
      await elementUpdated(el);
      const combo = el.shadowRoot?.querySelector('[data-testid="region"]');
      expect(combo).to.exist;
      expect(
        !!(combo as any).items.find((e: { value: string }) => e.value == 'AK'),
        'Arkansas is missing from the US.'
      ).to.be.true;
      el.edit({ country: 'CA' });
      await elementUpdated(el);
      expect(
        !!(combo as any).items.find((e: { value: string }) => e.value == 'AK'),
        'Arkansas is found in CA'
      ).to.be.false;
    });
  });

  describe('Scope and mode relationship', function () {
    it('Should not be possible to have automatically calculated tax for Global and Local scopes', async function () {
      const cases = {
        country: true,
        global: false,
        local: false,
        region: true,
        union: true,
      };
      for (const [k, v] of Object.entries(cases)) {
        el.edit({ type: k } as any);
        await elementUpdated(el);
        const isLive = el.shadowRoot?.querySelector('[data-testid="is_live"]');
        if (v) {
          expect(isLive, `Live taxes should work with type ${k}`).to.exist;
        } else {
          expect(isLive, `Live taxes should not work with type ${k}`).not.to.exist;
        }
      }
    });
  });
});

describe('Tax mode', function () {
  let el: TaxForm;

  beforeEach(async () => {
    el = await fixture(html`
      <foxy-tax-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-tax-form>
    `);
  });

  it('Should accept a tax rate, exempt customers id and apply to rating for manual taxes', async function () {
    const cases = ['exempt_all_customer_tax_ids', 'rate', 'apply_to_shipping'];
    el.edit({ is_live: false, type: 'country' });
    await elementUpdated(el);
    for (const c of cases) {
      const isLive = el.shadowRoot?.querySelector(`[data-testid="${c}"]`);
      expect(isLive, `${c} should be visible when not using live taxes.`).to.exist;
    }
  });

  it('Should display list of providers if tax mode is automatic', async function () {
    el.edit({ is_live: true, type: 'country' });
    await elementUpdated(el);
    const service_provider = el.shadowRoot?.querySelector(`[data-testid="service_provider"]`);
    expect(service_provider, `Service provider should be visible when using live taxes.`).to.exist;
  });
});

describe('Providers', function () {
  let el: TaxForm;
  const countries = {
    NA: ['US', 'CA'],
    EU: [
      'AT',
      'BE',
      'BG',
      'CY',
      'CZ',
      'DE',
      'DK',
      'EE',
      'ES',
      'FI',
      'FR',
      'GB',
      'GR',
      'HR',
      'HU',
      'IE',
      'IM',
      'IT',
      'LT',
      'LU',
      'LV',
      'MC',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SE',
      'SI',
      'SK',
    ],
    AU: ['AU'],
    any: ['AR', 'CO', 'RU', 'SD'],
  };

  beforeEach(async () => {
    el = await fixture(html`
      <foxy-tax-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-tax-form>
    `);
  });

  /**
   * @param provider
   * @param cases
   * @param combo
   */
  async function expectProvider(provider: string, cases: any, combo: any) {
    for (const [group, result] of Object.entries(cases)) {
      for (const country of (countries as any)[group] as any) {
        el.edit({ country });
        await elementUpdated(el);
        expect(combo, `Service provider should be visible when using live taxes.`).to.exist;
        expect(
          !!(combo as any).items.find((e: { value: string }) => e.value == provider),
          `${provider} should be available for ${country}`
        ).to.equal(result);
      }
    }
  }

  it('Should support OneSource for all countries', async function () {
    el.edit({ is_live: true, type: 'country' });
    const cases = {
      AU: true,
      EU: true,
      NA: true,
      any: true,
    };
    const combo = el.shadowRoot?.querySelector(`[data-testid="service_provider"]`);
    const provider = 'onesource';
    await expectProvider(provider, cases, combo);
  });

  it('Should support Avalara for all countries', async function () {
    el.edit({ is_live: true, type: 'country' });
    const cases = {
      AU: true,
      EU: true,
      NA: true,
      any: true,
    };
    const combo = el.shadowRoot?.querySelector(`[data-testid="service_provider"]`);
    const provider = 'avalara';
    await expectProvider(provider, cases, combo);
  });

  it('Should support TaxJar for US, CA, AU and EU countries.', async function () {
    el.edit({ is_live: true, type: 'country' });
    const cases = {
      AU: true,
      EU: true,
      NA: true,
      any: false,
    };
    const combo = el.shadowRoot?.querySelector(`[data-testid="service_provider"]`);
    const provider = 'taxjar';
    await expectProvider(provider, cases, combo);
  });

  it('Should support default Thomson Reuters for US, CA, EU countries and AU .', async function () {
    el.edit({ is_live: true, type: 'country' });
    const cases = {
      AU: true,
      EU: true,
      NA: true,
      any: false,
    };
    const combo = el.shadowRoot?.querySelector(`[data-testid="service_provider"]`);
    const provider = 'thomsonreuters';
    await expectProvider(provider, cases, combo);
  });

  //it("Should support exempt when provider is TaxJar", async function() {
  //});
  //it("Should not support apply to shipping when provider is TaxJar", async function() {
  //});
  //it("Should not support apply to shipping when provider is Avalara or OneSource and country is US, CA or EU", async function() {
  //});
});

describe('Usability', function () {
  DefaultTests.provideFeedbackOnLoading(taxFormHtml, taxFormUrl);

  DefaultTests.confirmBeforeAction(taxFormHtml);
});

describe('Accessibility', function () {
  //it('passes accessibility test', async () => {
  //  const element = await fixture(taxFormHtml);
  //  await waitUntil(() => (element as TaxForm).in('idle'), 'Element should become idle');
  //  await elementUpdated(element);
  //  await expect(element).to.be.accessible();
  //});
});

describe('Internationalization', function () {
  it('Should have all visible texts translatable.');
  it('Should have all visible dates localizable.');
  it('Should have all visible number formats localizable.');
});