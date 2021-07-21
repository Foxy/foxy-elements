import './index';
import { elementUpdated, expect, fixture, html, waitUntil } from '@open-wc/testing';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TaxesTable } from './TaxesTable';
import { composeCollection } from '../../../server/admin/composers/composeCollection';
import { composeTax } from '../../../server/admin/composers/composeTax';
import { router } from '../../../server/admin';

const taxesUrl = 'https://demo.foxycart.com/s/admin/stores/0/taxes';

/**
 *
 */
function taxesTableHtml() {
  return html`
    <foxy-taxes-table
      href=${taxesUrl}
      @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
    ></foxy-taxes-table>
  `;
}

describe('Show relevant tax information', function () {
  it('Should show columns in order', async function () {
    const el = await fixture(taxesTableHtml());
    await shouldGetReady(el as TaxesTable);
    const firstRow = el.shadowRoot!.querySelector('tbody tr');
    const firstRowData = firstRow!.querySelectorAll('td>*');
    const columnNames = ['name', 'mode', 'scope', 'options', 'actions'];
    for (let i = 0; i++; i < firstRowData.length) {
      expect(firstRowData[i].getAttribute('data-testclass')).to.equal(columnNames[i]);
    }
  });

  it('Should hide options column for small screens', async function () {
    const el = await fixture(taxesTableHtml());
    await shouldGetReady(el as TaxesTable);
    const optionsEl = el.shadowRoot!.querySelector('[data-testclass="options"]');
    expect(optionsEl).to.exist;
    const optionsCol = optionsEl!.parentElement;
    expect(Array.from(optionsCol!.classList)).to.include('hidden');
  });
});

describe('Scope hierarchy', function () {
  const defaultTax = {
    apply_to_shipping: true,
    city: '',
    country: 'US',
    date_created: '2013-08-19T10:58:39-0700',
    date_modified: '2013-08-19T10:58:39-0700',
    exempt_all_customer_tax_ids: true,
    id: 0,
    is_live: true,
    name: 'Beverage tax',
    rate: 1,
    region: 'TN',
    service_provider: 'avalara',
    store: 0,
    type: 'region',
    use_origin_rates: false,
  };
  const cases = {
    'city': {
      absent: ['origin', 'union', 'global'],
      changes: { type: 'local' },
      present: ['city', 'region', 'country'],
    },
    'country': {
      absent: ['region', 'city', 'union', 'global', 'origin'],
      changes: { type: 'country' },
      present: ['country'],
    },
    'global': {
      absent: ['union', 'country', 'region', 'city', 'origin'],
      changes: {
        type: 'global',
      },
      present: ['global'],
    },
    'region': {
      absent: ['union', 'global', 'city', 'origin'],
      changes: { type: 'region' },
      present: ['region'],
    },
    'union': {
      absent: ['global', 'region', 'city', 'country', 'origin'],
      changes: { type: 'union' },
      present: ['union'],
    },
    'union-with-origin': {
      absent: ['global', 'region', 'city'],
      changes: { type: 'union', use_origin_rates: true },
      present: ['union', 'origin'],
    },
  };
  for (const [k, v] of Object.entries(cases)) {
    it(`Should not show ${v.absent.join(', ')} for ${k} mode`, async function () {
      arbitraryResponse([{ ...defaultTax, ...v.changes }], k);
      const el = await fixture(mockedTable(k));
      await shouldGetReady(el as TaxesTable);
      const intruder = el.shadowRoot!.querySelector(
        v.absent.map(i => `[data-testclass="${i}"]`).join(',')
      );
      expect(intruder).not.to.exist;
    });
    it(`Should show ${v.present.join(', ')} for ${k} mode`, async function () {
      arbitraryResponse([{ ...defaultTax, ...v.changes }], k);
      const el = await fixture(mockedTable(k));
      await shouldGetReady(el as TaxesTable);
      for (const expected of v.present) {
        const expectedEl = el.shadowRoot!.querySelector(`[data-testclass="${expected}"]`);
        expect(expectedEl).to.exist;
      }
    });
  }
});

/**
 * @param el
 */
async function shouldGetReady(el: TaxesTable) {
  await waitUntil(() => el.in('idle'), 'Element should become idle');
  await elementUpdated(el);
  const firstRow = el.shadowRoot?.querySelector('tbody tr');
  expect(firstRow, `there should be a row of data`).to.exist;
  const firstRowData = firstRow!.querySelectorAll('td>*');
  expect(firstRowData, `there should be columns in the row ${firstRow}`).to.exist;
}

const mockedUrl = 'https://demo.foxycart.com/s/mocked-url';

/**
 * @param items
 * @param suffix
 */
function arbitraryResponse(items: any, suffix: string) {
  router.get('/s/mocked-url/' + suffix, async function () {
    const body = composeCollection({
      composeItem: composeTax,
      count: 1,
      items,
      rel: 'fx:taxes',
      url: taxesUrl,
    });
    return new Response(JSON.stringify(body));
  });
}

/**
 * @param suffix
 */
function mockedTable(suffix: string) {
  return html`
    <foxy-taxes-table
      href="${mockedUrl}/${suffix}"
      @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
    >
    </foxy-taxes-table>
  `;
}
