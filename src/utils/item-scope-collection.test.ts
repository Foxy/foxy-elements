import { expect } from '@open-wc/testing';

import { canReadItemCurrency } from './item-scope-collection';

describe('canReadItemCurrency', () => {
  const link = { href: 'https://demo.api/virtual/denied' };
  const transactionItem = { _links: { 'fx:transaction': link } };
  const cartItem = { _links: { 'fx:cart': link } };
  const subscriptionItem = { _links: { 'fx:subscription': link } };

  it('returns true when the scope does not restrict store collections', () => {
    expect(canReadItemCurrency(null, cartItem, null)).to.be.true;
    expect(canReadItemCurrency('store_full_access', { _links: {} }, null)).to.be.true;
  });

  it('follows the transaction for transaction items', () => {
    expect(canReadItemCurrency('transactions_read', transactionItem, null)).to.be.true;
    expect(canReadItemCurrency('customers_read', transactionItem, null)).to.be.false;
  });

  it('follows the cart and its template set for cart items', () => {
    expect(canReadItemCurrency('transactions_read', cartItem, null)).to.be.false;
    expect(canReadItemCurrency('carts_read', cartItem, null)).to.be.true;
    expect(canReadItemCurrency('carts_read', cartItem, { currency_code: 'USD' })).to.be.true;

    const cart = { currency_code: '', template_set_uri: 'https://demo.api/hapi/template_sets/0' };
    expect(canReadItemCurrency('carts_read', cartItem, cart)).to.be.false;
    expect(canReadItemCurrency('carts_read templates_read', cartItem, cart)).to.be.true;

    const defaultSetCart = { currency_code: '', template_set_uri: '' };
    expect(canReadItemCurrency('carts_read templates_read', cartItem, defaultSetCart)).to.be.false;
    const scope = 'carts_read templates_read stores_read';
    expect(canReadItemCurrency(scope, cartItem, defaultSetCart)).to.be.true;
  });

  it('needs subscriptions and carts for subscription template items', () => {
    expect(canReadItemCurrency('carts_read', subscriptionItem, null)).to.be.false;
    expect(canReadItemCurrency('subscriptions_read', subscriptionItem, null)).to.be.false;
    expect(canReadItemCurrency('subscriptions_read carts_read', subscriptionItem, null)).to.be.true;
  });
});
