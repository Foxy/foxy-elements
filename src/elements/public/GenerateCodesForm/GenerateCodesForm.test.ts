import type { InternalSourceControl } from '../../internal/InternalSourceControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { GenerateCodesForm } from './GenerateCodesForm';
import { InternalForm } from '../../internal/InternalForm';

describe('GenerateCodesForm', () => {
  it('imports and defines foxy-internal-integer-control', () => {
    expect(customElements.get('foxy-internal-integer-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-generate-codes-form', () => {
    expect(customElements.get('foxy-generate-codes-form')).to.equal(GenerateCodesForm);
  });

  it('extends InternalForm', () => {
    expect(new GenerateCodesForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of "generate-codes-form"', () => {
    expect(GenerateCodesForm).to.have.property('defaultNS', 'generate-codes-form');
    expect(new GenerateCodesForm()).to.have.property('ns', 'generate-codes-form');
  });

  it("produces a generic error:invalid_form when form parameters don't allow code generation", () => {
    const element = new GenerateCodesForm();
    expect(element.errors).to.not.include('error:invalid_form');

    element.edit({ prefix: 'ABC-', length: 2 });
    expect(element.errors).to.include('error:invalid_form');

    element.edit({ prefix: 'AB C-', length: 100 });
    expect(element.errors).to.include('error:invalid_form');

    element.edit({ prefix: 'ABC-', length: 6 });
    expect(element.errors).to.not.include('error:invalid_form');
  });

  it('always keeps "example" control readonly', () => {
    const element = new GenerateCodesForm();
    expect(element.readonlySelector.matches('example', true)).to.be.true;
  });

  it('makes "length", "number-of-codes", "current-balance", and "prefix" controls readonly when href is set', () => {
    const element = new GenerateCodesForm();

    expect(element.readonlySelector.matches('length', true)).to.be.false;
    expect(element.readonlySelector.matches('number-of-codes', true)).to.be.false;
    expect(element.readonlySelector.matches('current-balance', true)).to.be.false;
    expect(element.readonlySelector.matches('prefix', true)).to.be.false;

    element.href = 'https://demo.api/virtual/stall';

    expect(element.readonlySelector.matches('length', true)).to.be.true;
    expect(element.readonlySelector.matches('number-of-codes', true)).to.be.true;
    expect(element.readonlySelector.matches('current-balance', true)).to.be.true;
    expect(element.readonlySelector.matches('prefix', true)).to.be.true;
  });

  it('always hides "delete" and "timestamps" controls', () => {
    const element = new GenerateCodesForm();
    expect(element.hiddenSelector.matches('delete', true)).to.be.true;
    expect(element.hiddenSelector.matches('timestamps', true)).to.be.true;
  });

  it('hides "example" control when form is invalid', () => {
    const element = new GenerateCodesForm();
    expect(element.hiddenSelector.matches('example', true)).to.be.false;

    element.edit({ prefix: 'ABC-', length: 2 });
    expect(element.hiddenSelector.matches('example', true)).to.be.true;
  });

  it('hides "example" control when href is set', () => {
    const element = new GenerateCodesForm();
    expect(element.hiddenSelector.matches('example', true)).to.be.false;

    element.href = 'https://demo.api/virtual/stall';
    expect(element.hiddenSelector.matches('example', true)).to.be.true;
  });

  it('renders text control for prefix', async () => {
    const element = await fixture<GenerateCodesForm>(
      html`<foxy-generate-codes-form></foxy-generate-codes-form>`
    );
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer=prefix]');

    expect(control).to.exist;
  });

  it('renders integer control for length', async () => {
    const element = await fixture<GenerateCodesForm>(
      html`<foxy-generate-codes-form></foxy-generate-codes-form>`
    );
    const control = element.renderRoot.querySelector('foxy-internal-integer-control[infer=length]');

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '1');
  });

  it('renders integer control for number of codes', async () => {
    const element = await fixture<GenerateCodesForm>(
      html`<foxy-generate-codes-form></foxy-generate-codes-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-integer-control[infer=number-of-codes]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '1');
  });

  it('renders number control for current balance', async () => {
    const element = await fixture<GenerateCodesForm>(
      html`<foxy-generate-codes-form></foxy-generate-codes-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer=current-balance]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
  });

  it('renders source control for example', async () => {
    const element = await fixture<GenerateCodesForm>(
      html`<foxy-generate-codes-form></foxy-generate-codes-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-source-control[infer=example]'
    ) as InternalSourceControl;

    expect(control).to.exist;
    expect(control.getValue()).to.equal('1V3BJ3\nP4YNSW\n7DGT4Q');

    element.edit({ prefix: 'ABC-', length: 6 });
    expect(control.getValue()).to.equal('ABC-1V\nABC-P4\nABC-7D');
  });

  it('sets form status after successful submission', async () => {
    const element = await fixture<GenerateCodesForm>(
      html`
        <foxy-generate-codes-form
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
        </foxy-generate-codes-form>
      `
    );

    expect(element).to.have.property('status', null);

    element.edit({ prefix: 'ABC-', length: 6, number_of_codes: 3, current_balance: 10 });
    element.submit();
    await waitUntil(() => element.in('idle'));

    expect(element).to.have.deep.property('status', { key: 'success' });
  });
});
