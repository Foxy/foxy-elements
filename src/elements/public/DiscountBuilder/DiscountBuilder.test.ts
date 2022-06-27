import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit-element';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { DiscountBuilder } from './index';

describe('DiscountBuilder', () => {
  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('extends LitElement', () => {
    expect(new DiscountBuilder()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-discount-builder', () => {
    expect(customElements.get('foxy-discount-builder')).to.equal(DiscountBuilder);
  });

  it('has a default i18next namespace of "discount-builder"', () => {
    expect(new DiscountBuilder()).to.have.property('ns', 'discount-builder');
  });

  it('is enabled by default', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    // editing to render some rules
    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{allunits|1-2|3-4|5-6}'],
    ]).toString();

    const interactiveControls = await getByTestClass(element, 'interactive');

    interactiveControls.forEach(input => {
      expect(input).to.not.have.attribute('disabled');
    });
  });

  it('is disabled when disabled property is true', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    // editing to render some rules
    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{allunits|1-2|3-4|5-6}'],
    ]).toString();

    element.disabled = true;

    const interactiveControls = await getByTestClass(element, 'interactive');

    interactiveControls.forEach(input => {
      expect(input).to.have.attribute('disabled');
    });
  });

  it('is editable by default', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    // editing to render some rules
    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{allunits|1-2|3-4|5-6}'],
    ]).toString();

    const inputs = await getByTestClass(element, 'editable');
    inputs.forEach(input => expect(input).to.not.have.attribute('readonly'));
  });

  it('is readonly when readonly property is true', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    // editing to render some rules
    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{allunits|1-2|3-4|5-6}'],
    ]).toString();

    element.readonly = true;

    const inputs = await getByTestClass(element, 'editable');
    inputs.forEach(input => expect(input).to.have.attribute('disabled'));
  });

  it('renders tiers', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{allunits|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    let labels = [...tiers[0].querySelectorAll('label')];
    let from = labels.find(v => !!v.querySelector('[key="from"]'));
    let reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
    let increase = labels.find(v => !!v.querySelector('[key="increase"]'));
    let adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));

    expect(from?.control).to.have.value('1');
    expect(reduce?.control).to.have.attribute('checked');
    expect(increase?.control).to.not.have.attribute('checked');
    expect(adjustment?.control).to.have.value('2');

    labels = [...tiers[1].querySelectorAll('label')];
    from = labels.find(v => !!v.querySelector('[key="from"]'));
    reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
    increase = labels.find(v => !!v.querySelector('[key="increase"]'));
    adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));

    expect(from?.control).to.have.value('3');
    expect(reduce?.control).to.not.have.attribute('checked');
    expect(increase?.control).to.have.attribute('checked');
    expect(adjustment?.control).to.have.value('4');
  });

  it('supports "allunits" discount method', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{allunits|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const target = labels.find(v => !!v.querySelector('[key="target"]'));
      expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'allunits');
    }
  });

  it('supports "incremental" discount method', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{incremental|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const target = labels.find(v => !!v.querySelector('[key="target"]'));
      expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'incremental');
    }
  });

  it('supports "repeat" discount method', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([['discount_price_amount', 'Test{repeat|1-2}']]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(1);

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const target = labels.find(v => !!v.querySelector('[key="target"]'));
      expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'repeat');
    }
  });

  it('supports "single" discount method', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const target = labels.find(v => !!v.querySelector('[key="target"]'));
      expect(target?.control).to.have.nested.property('selectedOptions[0].value', 'single');
    }
  });

  it('supports "quantity_percentage" discount type', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_quantity_percentage', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const price = labels.find(v => !!v.querySelector('[key="total"]'));
      const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

      expect(price?.control).to.not.have.attribute('checked');
      expect(quantity?.control).to.have.attribute('checked');

      const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
      const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

      expect(amount?.control).to.not.have.attribute('checked');
      expect(percentage?.control).to.have.attribute('checked');
    }
  });

  it('supports "quantity_amount" discount type', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_quantity_amount', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const price = labels.find(v => !!v.querySelector('[key="total"]'));
      const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

      expect(price?.control).to.not.have.attribute('checked');
      expect(quantity?.control).to.have.attribute('checked');

      const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
      const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

      expect(amount?.control).to.have.attribute('checked');
      expect(percentage?.control).to.not.have.attribute('checked');
    }
  });

  it('supports "price_percentage" discount type', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_price_percentage', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const price = labels.find(v => !!v.querySelector('[key="total"]'));
      const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

      expect(price?.control).to.have.attribute('checked');
      expect(quantity?.control).to.not.have.attribute('checked');

      const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
      const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

      expect(amount?.control).to.not.have.attribute('checked');
      expect(percentage?.control).to.have.attribute('checked');
    }
  });

  it('supports "price_amount" discount type', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_price_amount', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    for (const tier of tiers) {
      const labels = [...tier.querySelectorAll('label')];
      const price = labels.find(v => !!v.querySelector('[key="total"]'));
      const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));

      expect(price?.control).to.have.attribute('checked');
      expect(quantity?.control).to.not.have.attribute('checked');

      const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
      const percentage = labels.find(v => !!v.querySelector('[key="%"]'));

      expect(amount?.control).to.have.attribute('checked');
      expect(percentage?.control).to.not.have.attribute('checked');
    }
  });

  it('can edit discount method', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_quantity_percentage', 'Test{single|1-2|3+4}'],
    ]).toString();

    const anyTier = (await getByTestClass<HTMLElement>(element, 'rules:tier'))[0];
    const labels = [...anyTier.querySelectorAll('label')];
    const target = labels.find(v => !!v.querySelector('[key="target"]')) as HTMLLabelElement;
    const select = target.control as HTMLSelectElement;

    ['incremental', 'allunits', 'repeat', 'single'].forEach((method, index) => {
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change'));

      expect(element).to.have.property(
        'value',
        new URLSearchParams([
          ['discount_quantity_percentage', `Test{${method}|1-2|3+4}`],
        ]).toString()
      );
    });
  });

  it('can edit discount type', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_quantity_amount', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tier = (await getByTestClass<HTMLElement>(element, 'rules:tier'))[0];
    const labels = [...tier.querySelectorAll('label')];

    const price = labels.find(v => !!v.querySelector('[key="total"]'));
    const priceControl = price?.control as HTMLInputElement;

    const quantity = labels.find(v => !!v.querySelector('[key="quantity"]'));
    const quantityControl = quantity?.control as HTMLInputElement;

    const amount = labels.find(v => !!v.querySelector('[key="¤"]'));
    const amountControl = amount?.control as HTMLInputElement;

    const percentage = labels.find(v => !!v.querySelector('[key="%"]'));
    const percentageControl = percentage?.control as HTMLInputElement;

    priceControl.checked = true;
    priceControl.dispatchEvent(new Event('change'));
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_price_amount', 'Test{single|1-2|3+4}']]).toString()
    );

    percentageControl.checked = true;
    percentageControl.dispatchEvent(new Event('change'));
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_price_percentage', 'Test{single|1-2|3+4}']]).toString()
    );

    quantityControl.checked = true;
    quantityControl.dispatchEvent(new Event('change'));
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_quantity_percentage', 'Test{single|1-2|3+4}']]).toString()
    );

    amountControl.checked = true;
    amountControl.dispatchEvent(new Event('change'));
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_quantity_amount', 'Test{single|1-2|3+4}']]).toString()
    );
  });

  it('can edit tiers', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_quantity_amount', 'Test{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    const labels = [...tiers[1].querySelectorAll('label')];
    const from = labels.find(v => !!v.querySelector('[key="from"]'));
    const fromInput = from?.control as HTMLInputElement;
    const reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
    const reduceInput = reduce?.control as HTMLInputElement;
    const adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));
    const adjustmentInput = adjustment?.control as HTMLInputElement;

    fromInput.value = '7';
    fromInput.dispatchEvent(new Event('input'));
    await element.updateComplete;

    reduceInput.checked = true;
    reduceInput.dispatchEvent(new Event('change'));
    await element.updateComplete;

    adjustmentInput.value = '9';
    adjustmentInput.dispatchEvent(new Event('input'));
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_quantity_amount', 'Test{single|1-2|7-9}']]).toString()
    );
  });

  it('can add tiers', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);
    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');

    expect(tiers).to.have.length(1); // 1 placeholder

    const labels = [...tiers[0].querySelectorAll('label')];
    const from = labels.find(v => !!v.querySelector('[key="from"]'));
    const fromInput = from?.control as HTMLInputElement;
    const reduce = labels.find(v => !!v.querySelector('[key="reduce"]'));
    const reduceInput = reduce?.control as HTMLInputElement;
    const adjustment = labels.find(v => !!v.querySelector('[key="adjustment"]'));
    const adjustmentInput = adjustment?.control as HTMLInputElement;

    fromInput.value = '1';
    fromInput.dispatchEvent(new Event('input'));
    await element.updateComplete;

    reduceInput.checked = true;
    reduceInput.dispatchEvent(new Event('change'));
    await element.updateComplete;

    adjustmentInput.value = '2';
    adjustmentInput.dispatchEvent(new Event('input'));
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_quantity_amount', 'Discount{single|1-2}']]).toString()
    );
  });

  it('can delete tiers', async () => {
    const layout = html`<foxy-discount-builder></foxy-discount-builder>`;
    const element = await fixture<DiscountBuilder>(layout);

    element.value = new URLSearchParams([
      ['discount_quantity_amount', 'Discount{single|1-2|3+4}'],
    ]).toString();

    const tiers = await getByTestClass<HTMLElement>(element, 'rules:tier');
    expect(tiers).to.have.length(3); // 2 tiers + 1 placeholder

    tiers[0].querySelector<HTMLElement>('button[aria-label="delete"]')?.click();
    await element.updateComplete;

    expect(element).to.have.property(
      'value',
      new URLSearchParams([['discount_quantity_amount', 'Discount{single|3+4}']]).toString()
    );
  });
});
