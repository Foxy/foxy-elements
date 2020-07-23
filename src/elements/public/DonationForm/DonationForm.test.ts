import { fixture, expect, fixtureCleanup } from '@open-wc/testing';
import * as sinon from 'sinon';
import { DonationForm } from './DonationForm';
import { html } from 'lit-element';

customElements.define('x-donation', DonationForm);

describe('Most basic usage', async () => {
  let el = await fixture(html`<x-donation></x-donation>`);

  it('Should provide a simple donation button with default value', async () => {
    const buttons = el.shadowRoot?.querySelectorAll('vaadin-button');
    expect(buttons?.length).to.equal(1);
  });

  it('Should provide default values for name, price and quantity', async () => {
    expect((el.shadowRoot?.querySelector('[name=name]') as HTMLInputElement).value).to.equal(
      'FOXYDONATIONFORM'
    );
    expect((el.shadowRoot?.querySelector('[name=price]') as HTMLInputElement).value).to.equal(
      '100'
    );
    expect((el.shadowRoot?.querySelector('[name=quantity]') as HTMLInputElement).value).to.equal(
      '1'
    );
  });

  it('Should complain about missing Store Subdomain', async () => {
    fixtureCleanup();
    const logSpy = sinon.spy(console, 'error');
    el = await fixture(html`<x-donation storeSubdomain="mystore.foxycart.com"></x-donation>`);
    expect(logSpy.callCount).to.equal(0);
    fixtureCleanup();
    el = await fixture(html`<x-donation></x-donation>`);
    expect(logSpy.callCount).to.equal(1);
  });

  it('Should provide a value widget', async () => {
    expect(true).to.equal(false);
  });

  it('Should provide a designation widget', async () => {
    expect(true).to.equal(false);
  });

  it('Should provide a comment widget', async () => {
    expect(true).to.equal(false);
  });

  it('Should provide a recurrence widget', async () => {
    expect(true).to.equal(false);
  });

  it('Should provide an anonymous donation widget', async () => {
    expect(true).to.equal(false);
  });

  it('Should customize name currency code and image', async () => {
    expect(true).to.equal(false);
  });

  it('Should customize code', async () => {
    expect(true).to.equal(false);
  });
});
