import { createMachine } from 'xstate';
import { MonthdayPicker } from './MonthdayPicker';
import { expect, fixture } from '@open-wc/testing';
import { WeekdayPicker } from '../WeekdayPicker/WeekdayPicker';
import { createModel } from '@xstate/test';
import { MonthdayPickerChangeEvent } from './MonthdayPickerChangeEvent';

customElements.define('x-monthday-picker', MonthdayPicker);

const samples = {
  value: [4, 16, 31],
};

/**
 * @param element
 */
function testItems(element: MonthdayPicker) {
  const items = Array.from(new Array(31), (_, i) => i + 1);
  const labels = element.shadowRoot!.querySelectorAll('label');

  expect(labels.length).to.equal(items.length);

  Array.from(labels).every((label, index) => {
    const input = label.querySelector('input');
    const item = items[index];

    expect(label.textContent).to.contain(item);
    expect(input?.checked).to.equal(samples.value.includes(item));
  });
}

/**
 * @param element
 */
function testEnabled(element: MonthdayPicker) {
  expect(element.disabled).to.be.false;
  const inputs = element.shadowRoot!.querySelectorAll('input');
  Array.from(inputs).every(input => expect(input.disabled).to.be.false);
}

/**
 * @param element
 */
function testDisabled(element: MonthdayPicker) {
  expect(element.disabled).to.be.true;
  const inputs = element.shadowRoot!.querySelectorAll('input');
  Array.from(inputs).every(input => expect(input.disabled).to.be.true);
}

/**
 * @param element
 */
async function testToggling(element: MonthdayPicker) {
  const input = element.shadowRoot!.querySelector('input');

  if (element.disabled) {
    expect(input?.disabled).to.be.true;
  } else {
    expect(element.value).to.deep.equal([]);

    let whenChanged = new Promise<Event>(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    input?.click();

    expect(await whenChanged).to.be.instanceOf(MonthdayPickerChangeEvent);
    expect(element.value).to.deep.equal([1]);

    whenChanged = new Promise<Event>(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    input?.click();

    expect(await whenChanged).to.be.instanceOf(MonthdayPickerChangeEvent);
    expect(element.value).to.deep.equal([]);
  }
}

const machine = createMachine({
  initial: 'enabled',
  states: {
    enabled: { meta: { test: testEnabled } },
    disabled: { meta: { test: testDisabled } },
    withItems: { meta: { test: testItems } },
    canToggleItems: { meta: { test: testToggling } },
  },
  on: {
    ENABLE: 'enabled',
    DISABLE: 'disabled',
    SET_ITEMS: 'withItems',
    TOGGLE_ITEM: 'canToggleItems',
  },
});

const model = createModel<WeekdayPicker>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_ITEMS: { exec: element => void (element.value = samples.value) },
  TOGGLE_ITEM: { exec: element => void (element.value = []) },
});

describe('MonthdayPicker', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-monthday-picker></x-monthday-picker>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
