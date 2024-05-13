import type { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { GiftCardCodesForm } from './GiftCardCodesForm';
import { InternalForm } from '../../internal/InternalForm';

describe('GiftCardCodesForm', () => {
  it('imports and defines foxy-internal-editable-list-control', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-gift-card-codes-form', () => {
    expect(customElements.get('foxy-gift-card-codes-form')).to.equal(GiftCardCodesForm);
  });

  it('extends InternalForm', () => {
    expect(new GiftCardCodesForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of "gift-card-codes-form"', () => {
    expect(GiftCardCodesForm).to.have.property('defaultNS', 'gift-card-codes-form');
    expect(new GiftCardCodesForm()).to.have.property('ns', 'gift-card-codes-form');
  });

  it('produces gift-card-codes:v8n_required v8n error when code list is empty', () => {
    const element = new GiftCardCodesForm();
    expect(element.errors).to.include('gift-card-codes:v8n_required');

    element.edit({ gift_card_codes: ['a', 'b'] });
    expect(element.errors).to.not.include('gift-card-codes:v8n_required');
  });

  it('makes "gift-card-codes" control readonly when href is set', () => {
    const element = new GiftCardCodesForm();
    expect(element.readonlySelector.matches('gift-card-codes', true)).to.be.false;

    element.href = 'https://demo.api/virtual/stall';
    expect(element.readonlySelector.matches('gift-card-codes', true)).to.be.true;
  });

  it('always hides "delete" and "timestamps" controls', () => {
    const element = new GiftCardCodesForm();
    expect(element.hiddenSelector.matches('delete', true)).to.be.true;
    expect(element.hiddenSelector.matches('timestamps', true)).to.be.true;
  });

  it('renders editable list control for coupon codes', async () => {
    const element = await fixture<GiftCardCodesForm>(
      html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-editable-list-control[infer=gift-card-codes]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control.getValue()).to.deep.equal([]);

    element.edit({ gift_card_codes: ['a', 'b'] });
    expect(control.getValue()).to.deep.equal([{ value: 'a' }, { value: 'b' }]);

    control.setValue([{ value: 'c' }]);
    expect(element.form.gift_card_codes).to.deep.equal(['c']);

    control.setValue([{ value: 'a' }, { value: 'a' }]);
    expect(element.form.gift_card_codes).to.deep.equal(['a']);

    control.setValue([{ value: 'a b c' }, { value: 'b' }]);
    expect(element.form.gift_card_codes).to.deep.equal(['a', 'b', 'c']);
  });

  it('renders number control for current balance', async () => {
    const element = await fixture<GiftCardCodesForm>(
      html`<foxy-gift-card-codes-form></foxy-gift-card-codes-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer=current-balance]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
  });

  it('sets form status after successful submission', async () => {
    const element = await fixture<GiftCardCodesForm>(
      html`
        <foxy-gift-card-codes-form
          @fetch=${(evt: FetchEvent) => {
            evt.respondWith(
              Promise.resolve(
                new Response(
                  JSON.stringify({
                    _links: { self: { href: 'https://demo.api/virtual/stall' } },
                    message: 'OK',
                  })
                )
              )
            );
          }}
        >
        </foxy-gift-card-codes-form>
      `
    );

    expect(element).to.have.property('status', null);

    element.edit({ gift_card_codes: ['a', 'b'] });
    element.submit();
    await waitUntil(() => element.in('idle'));

    expect(element).to.have.deep.property('status', { key: 'success' });
  });
});
