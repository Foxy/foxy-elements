import { expect, fixture } from '@open-wc/testing';

import { CheckboxMachine } from '../Checkbox/CheckboxMachine';
import { Machine } from 'xstate';
import { Switch } from './Switch';
import cloneDeep from 'lodash-es/cloneDeep';
import { createModel } from '@xstate/test';

/**
 * @param element
 */
function getInput(element: Switch) {
  return element.shadowRoot!.querySelector('input')!;
}

/**
 * @param element
 * @param value
 */
function testChecked(element: Switch, value: boolean) {
  expect(getInput(element).checked).to.equal(value);
}

/**
 * @param element
 * @param value
 */
function testDisabled(element: Switch, value: boolean) {
  expect(getInput(element).disabled).to.equal(value);
}

/**
 *
 */
function createSwitchModel() {
  const config = cloneDeep(CheckboxMachine.config);

  config.states!.checked.meta = {
    test: (element: Switch) => testChecked(element, true),
  };

  config.states!.checked.states!.enabled.meta = {
    test: (element: Switch) => testDisabled(element, false),
  };

  config.states!.checked.states!.disabled.meta = {
    test: (element: Switch) => testDisabled(element, true),
  };

  config.states!.unchecked.meta = {
    test: (element: Switch) => testChecked(element, false),
  };

  config.states!.unchecked.states!.enabled.meta = {
    test: (element: Switch) => testDisabled(element, false),
  };

  config.states!.unchecked.states!.disabled.meta = {
    test: (element: Switch) => testDisabled(element, true),
  };

  return createModel<Switch>(Machine(config)).withEvents({
    DISABLE: { exec: element => void (element.disabled = true) },
    ENABLE: { exec: element => void (element.disabled = false) },
    TOGGLE: { exec: element => getInput(element).click() },
    FORCE_TOGGLE: { exec: element => void (element.checked = !element.checked) },
  });
}

const model = createSwitchModel();
customElements.define('x-switch', Switch);

describe('Switch', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-switch></x-switch>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
