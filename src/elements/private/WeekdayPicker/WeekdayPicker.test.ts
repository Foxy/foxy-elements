import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { WeekdayPicker } from './WeekdayPicker';
import { WeekdayPickerChangeEvent } from './WeekdayPickerChangeEvent';
import { translateWeekday } from '../../../utils/translate-weekday';

customElements.define('x-weekday-picker', WeekdayPicker);

const samples = {
  value: [1, 4, 6],
};

function testItems(element: WeekdayPicker) {
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

function testEnabled(element: WeekdayPicker) {
  expect(element.disabled).to.be.false;
  const inputs = element.shadowRoot!.querySelectorAll('input');
  Array.from(inputs).every(input => expect(input.disabled).to.be.false);
}

function testDisabled(element: WeekdayPicker) {
  expect(element.disabled).to.be.true;
  const inputs = element.shadowRoot!.querySelectorAll('input');
  Array.from(inputs).every(input => expect(input.disabled).to.be.true);
}

async function testToggling(element: WeekdayPicker) {
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

const model = createModel<WeekdayPicker>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_ITEMS: { exec: element => void (element.value = samples.value) },
  TOGGLE_ITEM: { exec: element => void (element.value = []) },
});

describe('WeekdayPicker', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-weekday-picker></x-weekday-picker>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
