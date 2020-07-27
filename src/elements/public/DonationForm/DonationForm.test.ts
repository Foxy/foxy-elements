import { fixture, expect, fixtureCleanup, oneEvent } from '@open-wc/testing';
import * as sinon from 'sinon';
import { DonationForm } from './DonationForm';
import { html } from 'lit-element';

async function checkInputValue(
  formElement: Element,
  fieldElement: HTMLInputElement,
  inputName: string,
  value: string
) {
  const listener = oneEvent(fieldElement, 'change');
  fieldElement.value = value;
  fieldElement.dispatchEvent(new CustomEvent('change'));
  await listener;
  expect(
    (formElement.shadowRoot?.querySelector(`input[name=${inputName}]`) as HTMLInputElement).value
  ).to.equal(value);
}

customElements.define('x-donation', DonationForm);

describe('Most basic usage', async () => {
  let el = await fixture(html`<x-donation storeSubdomain="mystore.foxycart.com"></x-donation>`);

  it('Should provide a simple donation button with default value', async () => {
    const button = el.shadowRoot?.querySelector('vaadin-button');
    expect(button).to.exist;
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

  it('Should show the default donation value in the button', async () => {
    expect(el.shadowRoot?.querySelector('vaadin-button')?.innerHTML).to.include('100');
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
});

describe('A form with configurable values', async () => {
  const el = await fixture(
    html`<x-donation
      storeSubdomain="mystore.foxycart.com"
      valueOptions="[3, 20, 30, 40, 50]"
      askValueOther
    ></x-donation>`
  );
  const xvalue = el.shadowRoot?.querySelector('[name=value]')?.parentElement;

  it('Should provide a value widget', async () => {
    expect(xvalue).to.exist;
  });

  it('Should default to the first value of the list', async () => {
    expect((el.shadowRoot?.querySelector('[name=price]') as HTMLInputElement).value).to.equal('3');
    expect(el.shadowRoot?.querySelector('vaadin-button')?.innerHTML).to.include('3');
  });

  it('Should provide an "other value" field', async () => {
    expect(xvalue?.shadowRoot?.querySelector('.other-option')).to.exist;
    const noOther = await fixture(
      html`<x-donation
        storeSubdomain="mystore.foxycart.com"
        valueOptions="[3, 20, 30, 40, 50]"
      ></x-donation>`
    );
    const noOtherXvalue = noOther.shadowRoot?.querySelector('[name=value]')?.parentElement;
    expect(noOtherXvalue?.shadowRoot?.querySelectorAll('.other-option')).to.not.exist;
  });

  it('Should not allow a default value that is not in the list of possible values', async () => {
    const wrongEl = await fixture(
      html`<x-donation
        storeSubdomain="mystore.foxycart.com"
        value="8"
        valueOptions="[3, 20, 30, 40, 50]"
        askValueOther
      ></x-donation>`
    );
    expect(wrongEl.shadowRoot?.querySelector('input[name=price]')).to.exist.and.have.attribute(
      'value',
      '3'
    );
  });
});

describe('A form with configurable designation', async () => {
  const el = await fixture(
    html`<x-donation
      storeSubdomain="mystore.foxycart.com"
      designationOptions='["administrative", "environmental", "social", "religious", "medical"]'
      askDesignationOther
    ></x-donation>`
  );
  const designation = el.shadowRoot?.querySelector('slot[name=designation]')?.parentElement;

  it('Should provide a designation widget', async () => {
    expect(designation).to.exist;
    if (designation) {
      expect(designation.shadowRoot?.querySelectorAll('vaadin-checkbox').length).to.equal(6);
    }
  });

  it('Should provide an "other designation" field', async () => {
    let checkboxes = designation?.shadowRoot?.querySelectorAll(
      '#select-designations vaadin-checkbox'
    );
    expect(checkboxes?.length).to.equal(6);
    let other = false;
    checkboxes?.forEach((e: any) => {
      if (e?.value == 'other') other = true;
    });
    expect(other).to.equal(true);
    const noOther = await fixture(
      html`<x-donation
        storeSubdomain="mystore.foxycart.com"
        designationOptions='["administrative", "environmental", "social", "religious", "medical"]'
      ></x-donation>`
    );
    checkboxes = noOther?.shadowRoot?.querySelectorAll('#select-designations vaadin-checkbox');
    other = false;
    checkboxes?.forEach((e: any) => {
      if (e?.value == 'other') other = true;
    });
    expect(other).to.equal(false);
  });
});

describe('A form with a comment widget', async () => {
  const el = await fixture(
    html`<x-donation
      storeSubdomain="mystore.foxycart.com"
      askComment
      commentLabel="How do you think we can improve?"
    ></x-donation>`
  );

  it('Should provide comment field', async () => {
    const textArea = el?.shadowRoot?.querySelector('vaadin-text-area');
    expect(textArea).to.exist;
    const noComment = await fixture(
      html`<x-donation storeSubdomain="mystore.foxycart.com"></x-donation>`
    );
    expect(noComment.shadowRoot?.querySelector('vaadin-text-area')).to.not.exist;
  });
});

describe('A form with a recurrence widget', async () => {
  const el = await fixture(
    html`<x-donation storeSubdomain="mystore.foxycart.com" askRecurrence></x-donation>`
  );
  const recurr = el.shadowRoot?.querySelector('slot[name=recurrence]');

  it('Should provide a recurrence field', async () => {
    expect(recurr).to.exist;
    const noRecurr = await fixture(
      html`<x-donation storeSubdomain="mystore.foxycart.com"></x-donation>`
    );
    expect(noRecurr.shadowRoot?.querySelector('slot[name=recurrence]')).to.not.exist;
  });
});

describe('A form with an anonymous donation widget', async () => {
  const el = await fixture(
    html`<x-donation storeSubdomain="mystore.foxycart.com" askAnonymous></x-donation>`
  );
  const anon = el.shadowRoot?.querySelector('slot[name=anonymous]');

  it('Should provide a checkbox to remain anonymous', async () => {
    expect(anon).to.exist;
    const noAnon = await fixture(
      html`<x-donation storeSubdomain="mystore.foxycart.com"></x-donation>`
    );
    expect(noAnon.shadowRoot?.querySelector('slot[name=recurrence]')).to.not.exist;
  });
});

describe('A form with customizable parameters', async () => {
  const image = 'http://localhost/save-the-dolphins.jpg';
  const url = 'http://localhost/save-dolphins-campaign';
  const el = await fixture(
    html`<x-donation
      storeSubdomain="mystore.foxycart.com"
      name="Save the Dolphins"
      code="HELPDOLPHINS"
      image="${image}"
      url="${url}"
      currency="ł"
    ></x-donation>`
  );

  it('Should customize name currency code and image', async () => {
    expect(el.shadowRoot?.querySelector('[name=submit]')?.innerHTML).to.include('ł');
  });

  it('Should customize code', async () => {
    expect((el.shadowRoot?.querySelector('input[name=code]') as HTMLInputElement)?.value).to.equal(
      'HELPDOLPHINS'
    );
  });

  it('Should customize image', async () => {
    expect((el.shadowRoot?.querySelector('input[name=image]') as HTMLInputElement)?.value).to.equal(
      image
    );
  });

  it('Should customize url', async () => {
    expect((el.shadowRoot?.querySelector('input[name=url]') as HTMLInputElement)?.value).to.equal(
      url
    );
  });
});

describe('A form with reorderable fields', async () => {
  it('Should sort fields based on weight', async () => {
    const el = await fixture(html`<x-donation
      storeSubdomain="mystore.foxycart.com"
      valueOptions="[10, 30, 50, 100]"
      designationOptions='["Rebuild the School", "Medical Assistance", "Psicological Assistance", "Daily Meals"]'
      askComment
      commentWeight="2"
      designationWeight="1"
      valueWeight="2"
    ></x-donation>`);
    const expectedAfters = ['after-designation', 'after-value', 'after-comment'];
    const actualAfters: Array<string | null> = [];
    const afters = el.shadowRoot?.querySelectorAll('[name^=after-]');
    afters!.forEach(e => {
      actualAfters.push(e?.getAttribute('name'));
    });
    expect(expectedAfters.toString()).to.equal(actualAfters.toString());
  });
});

describe('A form that behaves as a simple HTML form', async () => {
  const el = await fixture(html`<x-donation
    storeSubdomain="mystore.foxycart.com"
    valueOptions="[10, 30, 50, 100]"
    designationOptions='["Rebuild the School", "Medical Assistance", "Psicological Assistance", "Daily Meals"]'
    askComment
    askAnonymous
  ></x-donation>`);

  it('Should fill price inputs', async () => {
    const xvalue = el.shadowRoot?.querySelector('[name=value]')?.parentElement;
    expect(xvalue).to.exist;
    await checkInputValue(el, xvalue as HTMLInputElement, 'price', '10');
  });

  it('Should fill designation input', async () => {
    const xdesignation = el.shadowRoot?.querySelector('[name=designation]')?.parentElement;
    expect(xdesignation).to.exist;
    const listener = oneEvent(xdesignation as Element, 'change');
    const expectedValue = '"Medical Assistance", "Daily Meals"';
    (xdesignation as HTMLInputElement).value = expectedValue;
    xdesignation?.dispatchEvent(new CustomEvent('change'));
    await listener;
    const actualDesignationValue = (el.shadowRoot?.querySelector(
      `input[name=designation]`
    ) as HTMLInputElement).value;
    expect(actualDesignationValue).to.contain('Medical Assistance');
    expect(actualDesignationValue).to.contain('Daily Meals');
  });

  it('Should fill comment input', async () => {
    const x = el.shadowRoot?.querySelector('vaadin-form-layout>vaadin-text-area');
    expect(x).to.exist;
    const listener = oneEvent(x as Element, 'change');
    const expected = 'A random comment';
    (x as HTMLInputElement).value = expected;
    x?.dispatchEvent(new CustomEvent('change'));
    await listener;
    const actual = (el.shadowRoot?.querySelector(`input[name=comment]`) as HTMLInputElement).value;
    expect(expected).to.equal(actual);
  });

  it('Should fill anonymous', async () => {
    const x = el.shadowRoot?.querySelector('vaadin-form-layout>vaadin-checkbox');
    expect(x).to.exist;
    (x as HTMLInputElement).click();
    expect(
      (el.shadowRoot?.querySelector('input[name=anonymous]') as HTMLInputElement)?.value
    ).to.equal('true');
  });
});
