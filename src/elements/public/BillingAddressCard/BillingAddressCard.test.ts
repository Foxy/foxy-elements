import type { Data } from './types';

import './index';

import { BillingAddressCard as Card } from './BillingAddressCard';
import { expect, fixture, html } from '@open-wc/testing';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';

describe('BillingAddressCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-billing-address-card', () => {
    expect(customElements.get('foxy-billing-address-card')).to.equal(Card);
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace of billing-address-card', () => {
    expect(Card).to.have.property('defaultNS', 'billing-address-card');
    expect(new Card()).to.have.property('ns', 'billing-address-card');
  });

  it('renders full name when loaded', async () => {
    const data = await getTestData<Data>('./hapi/customer_addresses/0');
    const layout = html`<foxy-billing-address-card .data=${data}></foxy-billing-address-card>`;
    const element = await fixture<Card>(layout);
    const label = await getByKey(element, 'full_name');

    expect(label).to.have.attribute('infer', '');
    expect(label).to.have.deep.property('options', element.data);
  });

  it('renders full address when loaded', async () => {
    const data = await getTestData<Data>('./hapi/customer_addresses/0');
    const layout = html`<foxy-billing-address-card .data=${data}></foxy-billing-address-card>`;
    const element = await fixture<Card>(layout);
    const label = await getByKey(element, 'full_address');

    expect(label).to.have.attribute('infer', '');
    expect(label).to.have.deep.property('options', element.data);
  });
});
