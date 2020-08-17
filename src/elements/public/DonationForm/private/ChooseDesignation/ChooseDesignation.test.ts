import { fixture, expect, oneEvent } from '@open-wc/testing';
import { ChooseDesignation } from './ChooseDesignation';
import { html } from 'lit-element';

customElements.define('x-designation', ChooseDesignation);

describe('Choose Designation input', () => {
  it('Should provide a text input to fill the designation', async () => {
    const el = await fixture(html`<x-designation></x-designation>`);
    expect(el.shadowRoot?.querySelectorAll('#select-designations').length).to.equal(1);
    expect(el.shadowRoot?.querySelectorAll('#select-designations[type=text]').length).to.equal(1);
  });

  it('Should provide a select list to choose the designation', async () => {
    const el = await fixture(html`<x-designation
      label="A custom label"
      ?askValueOther="false"
      .designationOptions=${['a', 'b']}
    >
      <slot name="designation"></slot>
    </x-designation>`);
    expect(el.shadowRoot?.querySelectorAll('#select-designations').length).to.equal(1);
    expect(el.shadowRoot?.querySelector('#select-designations')?.childElementCount).to.equal(2);
  });

  it('Should provide a checkbox group to choose the designation', async () => {
    const el = await fixture(
      html`<x-designation
        inputType="select"
        .designationOptions=${['one', 'two', 'three']}
      ></x-designation>`
    );
    expect(el.shadowRoot?.querySelectorAll('#select-designations').length).to.equal(1);
    // Label is a tag in this scenario
    expect(el.shadowRoot?.querySelector('#select-designations')?.childElementCount).to.equal(4);
  });

  it('Should provide an input for including a custom designation checkbox', async () => {
    const el = await fixture(
      html`<x-designation
        askValueOther="true"
        .designationOptions=${['one', 'two', 'three']}
      ></x-designation>`
    );
    expect(el.shadowRoot?.querySelectorAll('#select-designations').length).to.equal(1);
    expect(el.shadowRoot?.querySelector('#select-designations')?.childElementCount).to.equal(4);
    expect((el.shadowRoot?.querySelector('[name=other]') as HTMLInputElement)?.hidden).to.equal(
      true
    );
    // Allow firstUpdated to create event listeners
    (el as ChooseDesignation).requestUpdate();
    const otherValue = el.shadowRoot?.querySelector('[value=other]');
    expect(otherValue?.innerHTML).to.equal('<!---->choosedesignation.other<!---->');
    const listener = oneEvent(el, 'change');
    (otherValue as HTMLInputElement).click();
    await listener;
    expect((el.shadowRoot?.querySelector('[name=other]') as HTMLInputElement)?.hidden).to.equal(
      false
    );
  });

  it('Should provide an input for including a custom designation select', async () => {
    const el = await fixture(
      html`<x-designation
        inputType="select"
        askValueOther="true"
        .designationOptions=${['one', 'two', 'three']}
      ></x-designation>`
    );
    expect(el.shadowRoot?.querySelectorAll('#select-designations').length).to.equal(1);
    expect(el.shadowRoot?.querySelector('#select-designations')?.childElementCount).to.equal(5);
    expect((el.shadowRoot?.querySelector('[name=other]') as HTMLInputElement)?.hidden).to.equal(
      true
    );
    const listener = oneEvent(el, 'change');
    (el.shadowRoot?.querySelector('[value="other"]') as HTMLOptionElement).click();
    await listener;
    expect((el.shadowRoot?.querySelector('[name=other]') as HTMLInputElement)?.hidden).to.equal(
      false
    );
  });
});
