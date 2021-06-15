import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { WeekdayPicker } from './WeekdayPicker';
import { WeekdayPickerChangeEvent } from './WeekdayPickerChangeEvent';
import { translateWeekday } from '../../../utils/translate-weekday';

class TestWeekdayPicker extends WeekdayPicker {
  public get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-weekday-picker', TestWeekdayPicker);

const samples = {
  value: [1, 4, 6],
};

/**
 * @param element
 */
function testItems(element: TestWeekdayPicker) {
  const items = new Array(7).fill(0).map((_, i) => i);
  const labels = element.shadowRoot!.querySelectorAll('label');

  expect(labels.length).to.equal(items.length);

  Array.from(labels).every((label, index) => {
    const input = label.querySelector('input');
    const item = items[index];

    expect(label.textContent).to.contain(translateWeekday(item, element.lang, 'short'));
    expect(input?.checked).to.equal(samples.value.includes(item));
  });
}

/**
 * @param element
 */
function testEnabled(element: TestWeekdayPicker) {
  expect(element).to.have.property('disabled', false);
  const inputs = element.shadowRoot!.querySelectorAll('input');
  Array.from(inputs).every(input => expect(input).to.have.property('disabled', false));
}

/**
 * @param element
 */
function testDisabled(element: TestWeekdayPicker) {
  expect(element).to.have.property('disabled', true);
  const inputs = element.shadowRoot!.querySelectorAll('input');
  Array.from(inputs).every(input => expect(input).to.have.property('disabled', true));
}

/**
 * @param element
 */
async function testToggling(element: TestWeekdayPicker) {
  const input = element.shadowRoot!.querySelector('input');

  if (element.disabled) {
    expect(input?.disabled).to.be.true;
  } else {
    expect(element.value).to.deep.equal([]);

    let whenChanged = new Promise<Event>(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    input?.click();

    expect(await whenChanged).to.be.instanceOf(WeekdayPickerChangeEvent);
    expect(element.value).to.deep.equal([0]);

    whenChanged = new Promise<Event>(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    input?.click();

    expect(await whenChanged).to.be.instanceOf(WeekdayPickerChangeEvent);
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

const model = createModel<TestWeekdayPicker>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_ITEMS: { exec: element => void (element.value = samples.value) },
  TOGGLE_ITEM: { exec: element => void (element.value = []) },
});

describe('WeekdayPicker', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestWeekdayPicker>('<x-weekday-picker></x-weekday-picker>');
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
