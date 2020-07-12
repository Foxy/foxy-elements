import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { sample } from 'lodash-es';
import { Machine } from 'xstate/dist/xstate.web.js';
import { Choice } from './Choice';
import { ChoiceEvent } from './ChoiceMachine';

customElements.define('x-choice', Choice);

function getRadios(element: Choice) {
  const radios = element.shadowRoot!.querySelectorAll('[data-testid^=item-]');
  return Array.from(radios) as HTMLInputElement[];
}

function getNamedSlots(element: Choice) {
  const slots = element.shadowRoot!.querySelectorAll('slot[name]');
  return Array.from(slots) as HTMLSlotElement[];
}

function testContent(element: Choice) {
  const radios = getRadios(element);
  const namedSlots = getNamedSlots(element);

  expect(radios.length).to.equal(element.items.length);
  expect(namedSlots.length).to.equal(element.items.length);

  element.items.forEach((item, index) => {
    const radio = radios[index];
    const namedSlot = namedSlots[index];

    expect(radio).to.exist;
    expect(radio.value).to.equal(item);
    expect(radio.checked).to.equal(item === element.value);
    expect(radio.textContent?.trim()).to.equal(element.getText(item));

    expect(namedSlot).to.exist;
    expect(namedSlot.innerHTML?.trim()).to.equal('');
  });
}

function testDisabled(element: Choice) {
  getRadios(element).forEach(radio => expect(radio.disabled).to.be.true);
}

function testEnabled(element: Choice) {
  getRadios(element).forEach(radio => expect(radio.disabled).to.be.false);
}

function testMultiple(...tests: ((element: Choice) => void)[]) {
  return (element: Choice) => tests.forEach(test => test(element));
}

function testFirstSelected(element: Choice) {
  if (element.items.length > 0) expect(element.value).to.equal(element.items[0]);
}

function testLastSelected(element: Choice) {
  if (element.items.length > 0) {
    expect(element.value).to.equal(element.items[element.items.length - 1]);
  }
}

const sutMachine = Machine({
  initial: 'enabled',
  states: {
    disabled: {
      on: {
        ENABLE: 'enabled',
        INIT: '.initializedWithProps',
      },
      meta: { test: testDisabled },
      initial: 'any',
      states: {
        any: {
          meta: { test: testContent },
        },
        initializedWithProps: {
          meta: { test: testContent },
        },
      },
    },
    enabled: {
      on: {
        DISABLE: 'disabled',
        INIT: '.initializedWithProps',
      },
      meta: { test: testEnabled },
      initial: 'any',
      states: {
        any: {
          meta: { test: testContent },
        },
        selected: {
          meta: { test: testContent },
        },
        selectedPreviousWithKeyboard: {
          meta: { test: testMultiple(testContent, testFirstSelected) },
        },
        selectedNextWithKeyboard: {
          meta: { test: testMultiple(testContent, testLastSelected) },
        },
        initializedWithProps: {
          meta: { test: testContent },
          on: {
            CHOOSE_PREVIOUS: 'selectedPreviousWithKeyboard',
            CHOOSE_NEXT: 'selectedNextWithKeyboard',
            CHOOSE: 'selected',
          },
        },
      },
    },
  },
});

const sutModel = createModel<Choice>(sutMachine).withEvents({
  CHOOSE_PREVIOUS: {
    exec: (element, event) => {
      if (element.items.length < 1) return;
      const { key } = (event as unknown) as { key: string };
      const kbEvent = new KeyboardEvent('keydown', { key });
      getRadios(element)[1].dispatchEvent(kbEvent);
    },
    cases: [{ key: 'ArrowUp' }, { key: 'ArrowLeft' }],
  },
  CHOOSE_NEXT: {
    exec: (element, event) => {
      if (element.items.length < 1) return;
      const { key } = (event as unknown) as { key: string };
      const kbEvent = new KeyboardEvent('keydown', { key });
      getRadios(element)[element.items.length - 2].dispatchEvent(kbEvent);
    },
    cases: [{ key: 'ArrowDown' }, { key: 'ArrowRight' }],
  },
  DISABLE: {
    exec: element => void (element.disabled = true),
  },
  ENABLE: {
    exec: element => void (element.disabled = false),
  },
  CHOOSE: {
    exec: element => {
      if (element.items.length === 0) return;
      const index = element.items.indexOf(sample(element.items)!);
      getRadios(element)[index].click();
    },
  },
  INIT: {
    exec: (element, event) => {
      const evt = event as ChoiceEvent;
      if (evt.type !== 'INIT') return;

      if (evt.value) element.value = evt.value;
      if (evt.items) element.items = evt.items;
      if (evt.getText) element.getText = evt.getText;
    },
    cases: [
      {},
      { value: 'foo' },
      { items: ['foo', 'bar'] },
      { getText: (v: string) => v.toUpperCase() },
      { value: 'foo', items: ['foo', 'bar'] },
      { value: 'foo', getText: (v: string) => v.toUpperCase() },
      { items: ['foo', 'bar'], getText: (v: string) => v.toUpperCase() },
      { value: 'foo', items: ['foo', 'bar'], getText: (v: string) => v.toUpperCase() },
    ],
  },
});

describe('Choice', () => {
  sutModel.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-choice></x-choice>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => sutModel.testCoverage());
  });
});
