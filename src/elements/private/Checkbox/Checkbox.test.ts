import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import cloneDeep from 'lodash-es/cloneDeep';
import { Machine } from 'xstate';
import { Checkbox } from './Checkbox';
import { CheckboxMachine } from './CheckboxMachine';

/**
 * @param element
 */
function getInput(element: Checkbox) {
  return element.shadowRoot!.querySelector('[data-testid=input]') as HTMLInputElement;
}

/**
 * @param element
 * @param value
 */
function testChecked(element: Checkbox, value: boolean) {
  expect(getInput(element).checked).to.equal(value);
}

/**
 * @param element
 * @param value
 */
function testDisabled(element: Checkbox, value: boolean) {
  expect(getInput(element).disabled).to.equal(value);
}

/**
 *
 */
function createCheckboxModel() {
  const config = cloneDeep(CheckboxMachine.config);

  config.states!.checked.meta = {
    test: (element: Checkbox) => testChecked(element, true),
  };

  config.states!.checked.states!.enabled.meta = {
    test: (element: Checkbox) => testDisabled(element, false),
  };

  config.states!.checked.states!.disabled.meta = {
    test: (element: Checkbox) => testDisabled(element, true),
  };

  config.states!.unchecked.meta = {
    test: (element: Checkbox) => testChecked(element, false),
  };

  config.states!.unchecked.states!.enabled.meta = {
    test: (element: Checkbox) => testDisabled(element, false),
  };

  config.states!.unchecked.states!.disabled.meta = {
    test: (element: Checkbox) => testDisabled(element, true),
  };

  return createModel<Checkbox>(Machine(config)).withEvents({
    DISABLE: { exec: element => void (element.disabled = true) },
    ENABLE: { exec: element => void (element.disabled = false) },
    TOGGLE: { exec: element => getInput(element).click() },
    FORCE_TOGGLE: { exec: element => void (element.checked = !element.checked) },
  });
}

const model = createCheckboxModel();
customElements.define('x-checkbox', Checkbox);

describe('Checkbox', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-checkbox></x-checkbox>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
