import type { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { CouponCodesForm } from './CouponCodesForm';
import { InternalForm } from '../../internal/InternalForm/InternalForm';

describe('CouponCodesForm', () => {
  it('imports and defines foxy-internal-editable-list-control', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-coupon-codes-form', () => {
    expect(customElements.get('foxy-coupon-codes-form')).to.equal(CouponCodesForm);
  });

  it('extends InternalForm', () => {
    expect(new CouponCodesForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of "coupon-codes-form"', () => {
    expect(CouponCodesForm).to.have.property('defaultNS', 'coupon-codes-form');
    expect(new CouponCodesForm()).to.have.property('ns', 'coupon-codes-form');
  });

  it('produces coupon-codes:v8n_required v8n error when code list is empty', () => {
    const element = new CouponCodesForm();
    expect(element.errors).to.include('coupon-codes:v8n_required');

    element.edit({ coupon_codes: ['a', 'b'] });
    expect(element.errors).to.not.include('coupon-codes:v8n_required');
  });

  it('makes "coupon-codes" control readonly when href is set', () => {
    const element = new CouponCodesForm();
    expect(element.readonlySelector.matches('coupon-codes', true)).to.be.false;

    element.href = 'https://demo.api/virtual/stall';
    expect(element.readonlySelector.matches('coupon-codes', true)).to.be.true;
  });

  it('always hides "delete" and "timestamps" controls', () => {
    const element = new CouponCodesForm();
    expect(element.hiddenSelector.matches('delete', true)).to.be.true;
    expect(element.hiddenSelector.matches('timestamps', true)).to.be.true;
  });

  it('renders editable list control for coupon codes', async () => {
    const element = await fixture<CouponCodesForm>(
      html`<foxy-coupon-codes-form></foxy-coupon-codes-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-editable-list-control[infer=coupon-codes]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control.getValue()).to.deep.equal([]);

    element.edit({ coupon_codes: ['a', 'b'] });
    expect(control.getValue()).to.deep.equal([{ value: 'a' }, { value: 'b' }]);

    control.setValue([{ value: 'c' }]);
    expect(element.form.coupon_codes).to.deep.equal(['c']);

    control.setValue([{ value: 'a' }, { value: 'a' }]);
    expect(element.form.coupon_codes).to.deep.equal(['a']);

    control.setValue([{ value: 'a b c' }, { value: 'b' }]);
    expect(element.form.coupon_codes).to.deep.equal(['a', 'b', 'c']);
  });

  it('sets form status after successful submission', async () => {
    const element = await fixture<CouponCodesForm>(
      html`
        <foxy-coupon-codes-form
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
        </foxy-coupon-codes-form>
      `
    );

    expect(element).to.have.property('status', null);

    element.edit({ coupon_codes: ['a', 'b'] });
    element.submit();
    await waitUntil(() => element.in('idle'));

    expect(element).to.have.deep.property('status', { key: 'success' });
  });
});
