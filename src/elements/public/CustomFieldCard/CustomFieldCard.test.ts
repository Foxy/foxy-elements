import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { CustomFieldCard } from './CustomFieldCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TwoLineCard } from './TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { html } from 'lit-html';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

const router = createRouter();

describe('CustomFieldCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new CustomFieldCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-custom-field-card', () => {
    expect(customElements.get('foxy-custom-field-card')).to.equal(CustomFieldCard);
  });

  it('has a default i18next namespace of "custom-field-card"', () => {
    expect(new CustomFieldCard()).to.have.property('ns', 'custom-field-card');
  });

  it('renders custom field name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-custom-field-card @fetch=${handleFetch}></foxy-custom-field-card>`;
    const element = await fixture<CustomFieldCard>(layout);

    element.href = 'https://demo.api/hapi/custom_fields/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
  });

  it('renders custom field value in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-custom-field-card @fetch=${handleFetch}></foxy-custom-field-card>`;
    const element = await fixture<CustomFieldCard>(layout);

    element.href = 'https://demo.api/hapi/custom_fields/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'subtitle');

    expect(title).to.include.text(element.data!.value);
  });

  describe('current user scope', () => {
    const create = async (links: Record<string, unknown> = {}) => {
      const element = new CustomFieldCard();
      const data = await getTestData<any>('./hapi/custom_fields/0');
      element.data = { ...data, _links: { ...data._links, ...links } };
      return element;
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const element = await create();

      [null, 'store_full_access'].forEach(scope => {
        element.currentUserScope = scope;
        expect(element.hiddenSelector.toString()).to.equal('');
        expect(element.readonlySelector.toString()).to.equal('');
      });
    });

    it('uses transactions when it belongs to a transaction', async () => {
      const element = await create();
      element.currentUserScope = 'transactions_read customers_read';
      expect(element.scopeCollection).to.equal('transactions');
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
      expect(element.hiddenSelector.matches('delete', true)).to.be.true;
    });

    it('uses carts when it belongs to a cart', async () => {
      const element = await create({ 'fx:cart': { href: 'https://demo.api/hapi/carts/0' } });
      element.currentUserScope = 'transactions_read';
      expect(element.scopeCollection).to.equal('carts');
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;

      element.currentUserScope = 'carts_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
    });
  });
});
