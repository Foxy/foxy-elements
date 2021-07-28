import { AnyEventObject, State, createMachine } from 'xstate';
import { TestEventConfig, TestPlan } from '@xstate/test/lib/types';
import { TestModel, createModel } from '@xstate/test';
import { expect, fixture } from '@open-wc/testing';

import { Choice } from './Choice';
import cloneDeep from 'lodash-es/cloneDeep';
import { machine } from './machine';

const config = cloneDeep(machine.config);

class TestChoice extends Choice {
  get whenReady(): Promise<unknown> {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-choice', TestChoice);

function getInputs(element: TestChoice) {
  const inputs = element.shadowRoot!.querySelectorAll('input');
  return Array.from(inputs) as HTMLInputElement[];
}

function whenIdle(exec: Required<TestEventConfig<TestChoice>>['exec']) {
  return async (...args: Parameters<Required<TestEventConfig<TestChoice>>['exec']>) => {
    await args[0].updateComplete;
    return exec(...args);
  };
}

function createMemo() {
  const cache = new Set<string>();
  return (value: any) => {
    const serializedValue = JSON.stringify(value);
    if (cache.has(serializedValue)) return false;
    cache.add(serializedValue);
    return true;
  };
}

function getPlans(model: TestModel<any, any>) {
  const wasStateTested = createMemo();
  const wasChoiceTested = createMemo();
  const filters: ((state: State<any>) => boolean)[] = [
    ({ context, value }) => context.items.length && wasStateTested(value),
    ({ context }) => context.items.length && wasChoiceTested(context),
  ];

  return filters
    .map(filter => model.getSimplePathPlans({ filter }))
    .reduce((plans, plan) => [...plans, ...plan], [] as TestPlan<any, any>[]);
}

config!.states!.interactivity!.states!.enabled.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    expect(element).to.have.property('disabled', false);
    getInputs(element).forEach(input => expect(input).to.have.property('disabled', false));
  },
};

config!.states!.interactivity!.states!.disabled.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    expect(element).to.have.property('disabled', true);
    getInputs(element).forEach(input => expect(input).to.have.property('disabled', true));
  },
};

config!.states!.selection.states!.single.meta = {
  async test(element: TestChoice) {
    await element.whenReady;

    const inputs = getInputs(element);

    element.items.forEach((item, index) => {
      const input = inputs[index];
      expect(input).to.have.property('value', item);
      expect(input).to.have.property('checked', element.value === input.value);
    });

    // testing manual selection when there's at least 2 items
    if (element.items.length > 1) {
      const oldValue = element.value;
      const oldIndex = element.items.indexOf(element.value as string);
      const newIndex = element.items.findIndex(v => v !== element.value);
      const newValue = inputs[newIndex]?.value;

      if (oldIndex !== -1 && newIndex !== -1) {
        inputs[newIndex].checked = true;
        inputs[newIndex].dispatchEvent(new Event('change'));

        await new Promise(r => setTimeout(r, 10));
        await element.updateComplete;

        expect(element.value).to.equal(newValue);
        expect(getInputs(element)[newIndex]).to.have.property('checked', true);

        element.value = oldValue;
      }
    }
  },
};

config!.states!.selection.states!.multiple.meta = {
  async test(element: TestChoice) {
    await element.whenReady;

    let inputs = getInputs(element);

    element.items.forEach((item, index) => {
      const input = inputs[index];
      expect(input).to.have.property('value', item);
      expect(input).to.have.property('checked', element.value?.includes(input.value));
    });

    // testing manual selection when there's at least 1 item and an array value
    if (element.value && element.items.length > 0) {
      const oldStatus = inputs[0].checked;
      const newStatus = !oldStatus;

      inputs[0].checked = newStatus;
      inputs[0].dispatchEvent(new Event('change'));

      await element.updateComplete;
      inputs = getInputs(element);

      if (newStatus) {
        expect(element.value).to.include(element.items[0]);
      } else {
        expect(element.value).not.to.include(element.items[0]);
      }

      expect(inputs[0]).to.have.property('checked', newStatus);

      inputs[0].checked = oldStatus;
      inputs[0].dispatchEvent(new Event('change'));
    }
  },
};

config!.states!.extension.states!.absent.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
    expect(field).to.be.null;
    expect(getInputs(element)).to.have.length(element.items.length);
  },
};

config!.states!.extension.states!.present.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    expect(getInputs(element)).to.have.length(element.items.length + 1);
  },
};

config!.states!.extension.states!.present.states!.available.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
    expect(field).to.be.null;
  },
};

config!.states!.extension.states!.present.states!.selected.meta = {
  async test(element: TestChoice) {
    await element.whenReady;

    const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
    expect(field).to.be.visible;

    const oldElementValue = element.value;
    const newFieldValue = '123';

    field.value = newFieldValue;
    field.dispatchEvent(new Event('change'));

    if (Array.isArray(element.value)) {
      expect(element.value).to.include(newFieldValue);
    } else {
      expect(element.value).to.equal(newFieldValue);
    }

    element.value = oldElementValue;
  },
};

config!.states!.extension.states!.present.states!.selected.states!.text.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
    expect(field.localName).to.equal('vaadin-text-field');
  },
};

config!.states!.extension.states!.present.states!.selected.states!.textarea.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
    expect(field.localName).to.equal('vaadin-text-area');
  },
};

config!.states!.extension.states!.present.states!.selected.states!.integer.meta = {
  async test(element: TestChoice) {
    await element.whenReady;
    const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
    expect(field.localName).to.equal('vaadin-integer-field');
  },
};

config!.states!.extension.states!.present.states!.selected.states!.integer.states!.min.states!.none.meta =
  {
    async test(element: TestChoice) {
      await element.whenReady;
      const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
      expect(field.min).to.be.undefined;
    },
  };

config!.states!.extension.states!.present.states!.selected.states!.integer.states!.min.states!.custom.meta =
  {
    async test(element: TestChoice) {
      await element.whenReady;
      const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
      expect(field.min).to.equal(element.min);
    },
  };

config!.states!.extension.states!.present.states!.selected.states!.integer.states!.max.states!.none.meta =
  {
    async test(element: TestChoice) {
      await element.whenReady;
      const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
      expect(field.max).to.be.undefined;
    },
  };

config!.states!.extension.states!.present.states!.selected.states!.integer.states!.max.states!.custom.meta =
  {
    async test(element: TestChoice) {
      await element.whenReady;
      const field = element.shadowRoot!.querySelector('[data-testid=field]') as HTMLInputElement;
      expect(field.max).to.equal(element.max);
    },
  };

const model = createModel<TestChoice>(createMachine(config, machine.options)).withEvents({
  SET_DISABLED: {
    exec: whenIdle((element, evt) => (element.disabled = (evt as AnyEventObject).data)),
    cases: [{ data: true }, { data: false }],
  },
  SET_CUSTOM: {
    exec: whenIdle((element, evt) => (element.custom = (evt as AnyEventObject).data)),
    cases: [{ data: true }, { data: false }],
  },
  SET_ITEMS: {
    exec: whenIdle((element, evt) => (element.items = (evt as AnyEventObject).data)),
    cases: [{ data: ['foo', 'bar', 'baz'] }],
  },
  SET_VALUE: {
    exec: whenIdle((element, evt) => (element.value = (evt as AnyEventObject).data)),
    cases: [{ data: ['foo', 'bar'] }, { data: ['foo', 'qux'] }, { data: 'foo' }, { data: 'qux' }],
  },
  SET_TYPE: {
    exec: whenIdle((element, evt) => (element.type = (evt as AnyEventObject).data)),
    cases: [{ data: 'integer' }, { data: 'textarea' }],
  },
  SET_MIN: {
    exec: whenIdle((element, evt) => (element.min = (evt as AnyEventObject).data)),
    cases: [{ data: 0 }],
  },
  SET_MAX: {
    exec: whenIdle((element, evt) => (element.max = (evt as AnyEventObject).data)),
    cases: [{ data: 10 }],
  },
});

describe('Choice', () => {
  getPlans(model).forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-choice></x-choice>')));
      });
    });
  });
});
