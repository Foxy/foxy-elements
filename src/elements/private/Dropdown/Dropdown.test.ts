import { Machine } from 'xstate';
import { Dropdown } from './Dropdown';
import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { DropdownChangeEvent } from './DropdownChangeEvent';

customElements.define('x-dropdown', Dropdown as any);

function getSelect(elm: Dropdown) {
  const select = elm.shadowRoot!.querySelector('[data-testid=select]');
  return select as HTMLSelectElement & { render: () => void };
}

function getItems(elm: Dropdown) {
  const selector = 'vaadin-list-box > vaadin-item';
  const vaadinShadow = getSelect(elm).shadowRoot!;
  return vaadinShadow.querySelectorAll(selector) as NodeListOf<HTMLOptionElement>;
}

function testDisabled(elm: Dropdown) {
  expect(getSelect(elm).disabled).to.be.true;
}

function testEnabled(elm: Dropdown) {
  expect(getSelect(elm).disabled).to.be.false;
}

function testContent(elm: Dropdown) {
  const items = Array.from(getItems(elm));

  expect(items.length).to.equal(elm.items.length);

  items.forEach((item, index) => {
    expect(item.value).to.equal(elm.items[index]);
    expect(item.textContent).to.equal(elm.getText(elm.items[index]));
  });
}

async function testSelection(elm: Dropdown) {
  const whenFired = new Promise(resolve => elm.addEventListener('change', resolve));
  const select = getSelect(elm);

  select.value = elm.items[0];
  select.dispatchEvent(new CustomEvent('change'));

  expect(await whenFired).to.be.instanceOf(DropdownChangeEvent);
}

const machine = Machine({
  type: 'parallel',
  states: {
    interactivity: {
      meta: { test: () => true },
      initial: 'enabled',
      states: {
        disabled: {
          on: { ENABLE: 'enabled' },
          meta: { test: testDisabled },
        },
        enabled: {
          on: { DISABLE: 'disabled', SELECT: '.selected' },
          meta: { test: testEnabled },
          initial: 'any',
          states: {
            any: { meta: { test: () => true } },
            selected: { meta: { test: testSelection } },
          },
        },
      },
    },
    content: {
      meta: { test: testContent },
      initial: 'any',
      states: {
        any: {
          on: { INIT: 'initialized', RERENDER: 'rerendered' },
          meta: { test: () => true },
        },
        rerendered: {
          meta: { test: () => true },
        },
        initialized: {
          meta: { test: () => true },
        },
      },
    },
  },
});

const model = createModel<Dropdown>(machine).withEvents({
  DISABLE: {
    exec: element => void (element.disabled = true),
  },
  ENABLE: {
    exec: element => void (element.disabled = false),
  },
  SELECT: {
    exec: element => {
      element.value = 'bar';
      element.items = ['foo', 'bar'];
    },
  },
  RERENDER: {
    exec: async element => {
      const select = getSelect(element);

      element.value = 'foo';
      element.items = ['foo'];
      await element.updateComplete;

      element.items = ['foo', 'bar'];
      await element.updateComplete;
      select.render();

      element.items = ['foo'];
      await element.updateComplete;
      select.render();
    },
  },
  INIT: {
    exec: (element, event) => {
      const evt = event as { value?: string; items?: string[]; getText?: (v: string) => string };

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

describe('Dropdown', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-dropdown></x-dropdown>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
