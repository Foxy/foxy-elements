import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductLogCard } from './ProductLogCard';
import { Data } from './types';
import { InternalCard } from '../../internal/InternalCard/InternalCard';

describe('ProductLogCard', () => {
  const log = (overrides: Partial<Data> = {}) =>
    ({
      _links: { self: { href: 'https://demo.api/hapi/product_logs/4127' } },
      id: 4127,
      transaction_id: null,
      type: 'updated',
      source: 'mit_admin',
      changes: { 'definition.price': { before: 17.25, after: 18.75 } },
      error_message: null,
      details: null,
      date_created: '2026-11-18T15:34:17-0800',
      ...overrides,
    } as unknown as Data);

  async function render(data: Data): Promise<ProductLogCard> {
    const element = await fixture<ProductLogCard>(html`
      <foxy-product-log-card lang="en" .data=${data}></foxy-product-log-card>
    `);
    await waitUntil(() => element.isBodyReady);
    return element;
  }

  const part = (element: ProductLogCard, id: string) =>
    element.renderRoot.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  const keys = (node: Element | null) =>
    Array.from(node?.querySelectorAll('foxy-i18n') ?? []).map(i18n => i18n.getAttribute('key'));
  const text = (node: Element) => node.textContent!.replace(/\s+/g, ' ').trim();

  it('registers as foxy-product-log-card, an internal card with its own namespace', () => {
    expect(customElements.get('foxy-product-log-card')).to.equal(ProductLogCard);
    expect(new ProductLogCard()).to.be.instanceOf(InternalCard);
    expect(ProductLogCard.defaultNS).to.equal('product-log-card');
  });

  it('says what happened, when and who did it', async () => {
    const element = await render(log());
    expect(keys(part(element, 'type'))).to.deep.equal(['type_updated']);
    expect(keys(part(element, 'source'))).to.deep.equal(['source_mit_admin']);
    const date = part(element, 'date')!.querySelector('foxy-i18n') as HTMLElement & {
      options: { value: string };
    };
    expect(date.options.value).to.equal('2026-11-18T15:34:17-0800');
  });

  it('lists each changed field with its value before and after', async () => {
    const element = await render(
      log({
        changes: {
          'definition.price': { before: 17.25, after: 18.75 },
          'stock_rule': { before: null, after: { multiplier: 2, target_product_id: 102 } },
        },
      } as Partial<Data>)
    );
    const items = Array.from(part(element, 'changes')!.querySelectorAll('li')).map(text);
    expect(items[0]).to.match(/^definition\.price: 17\.25 → .*18\.75$/);
    expect(items[1]).to.match(/^stock_rule: — → .*\{"multiplier":2,"target_product_id":102\}$/);
  });

  it('cuts a long value short', async () => {
    const element = await render(
      log({ changes: { 'definition.description': { before: '', after: 'x'.repeat(500) } } })
    );
    const item = text(part(element, 'changes')!.querySelector('li')!);
    expect(item.endsWith(`${'x'.repeat(120)}…`)).to.be.true;
  });

  it('shows the details of a stock change and the transaction behind it', async () => {
    const element = await render(
      log({
        type: 'stock_adjustment',
        source: 'mit_system',
        transaction_id: 3847261,
        changes: { stock_level: { before: 14, after: 12 } },
        details: { reason: 'purchase', quantity: 2 },
      })
    );
    expect(keys(part(element, 'type'))).to.deep.equal(['type_stock_adjustment']);
    expect(keys(part(element, 'source'))).to.deep.equal(['source_mit_system', 'transaction']);
    const details = Array.from(part(element, 'details')!.querySelectorAll('li')).map(text);
    expect(details).to.deep.equal(['reason: purchase', 'quantity: 2']);
  });

  it('shows a type or source it does not know as the API gives it, and an error if there is one', async () => {
    const element = await render(
      log({
        type: 'archived' as Data['type'],
        source: 'mit_import',
        changes: null,
        error_message: 'Stock could not be changed.',
      })
    );
    expect(keys(part(element, 'type'))).to.deep.equal(['type_other']);
    expect(keys(part(element, 'source'))).to.deep.equal(['source_other']);
    expect(part(element, 'changes')).to.not.exist;
    expect(part(element, 'details')).to.not.exist;
    expect(text(part(element, 'error')!)).to.equal('Stock could not be changed.');
  });
});
