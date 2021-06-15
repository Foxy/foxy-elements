import { Machine } from 'xstate';
import { Dropdown } from './Dropdown';
import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { DropdownChangeEvent } from './DropdownChangeEvent';

customElements.define('x-dropdown', Dropdown);

/**
 * @param elm
 */
function getSelect(elm: Dropdown) {
  const select = elm.shadowRoot!.querySelector('[data-testid=select]');
  return select as HTMLSelectElement & { render: () => void };
}

/**
 * @param elm
 */
function getItems(elm: Dropdown) {
  const selector = 'vaadin-list-box > vaadin-item';
  const vaadinShadow = getSelect(elm).shadowRoot!;
  return vaadinShadow.querySelectorAll(selector) as NodeListOf<HTMLOptionElement>;
}

/**
 * @param elm
 */
async function testDisabled(elm: Dropdown) {
  expect(getSelect(elm).disabled).to.be.true;
}

/**
 * @param elm
 */
async function testEnabled(elm: Dropdown) {
  await elementUpdated(elm);
  expect(getSelect(elm).disabled).to.be.false;
}

/**
 * @param elm
 */
async function testContentLength(elm: Dropdown) {
  let total = 0;
  if (elm.items) {
    elm.items!.forEach(i => {
      if (Array.isArray(i)) {
        total += i[1].length + 1;
      } else {
        total += 1;
      }
    });
    expect(total).to.equal(getItems(elm)?.length ?? 0);
  }
}

/**
 * @param elm
 */
function testContent(elm: Dropdown) {
  expect(getSelect(elm)).to.have.property('label', elm.label);

  if (elm.items) {
    let subItemCount = 0;
    let pendingSubitems = 0;
    // Avoid creating an array from the node list to try to avoid timeout issues
    getItems(elm).forEach((e, i) => {
      // Item is array
      if (Array.isArray(elm.items![i - subItemCount])) {
        // Head item
        if (pendingSubitems == 0) {
          expect(e.value).to.equal(elm.items![i - subItemCount][0]);
          expect(e.textContent).to.equal(elm.getText(elm.items![i][0] as string));
          pendingSubitems += elm.items![i - subItemCount][1].length;
        } else {
          // Other items in item array
          const parentItem = elm.items![i - subItemCount][0];
          const subitem =
            elm.items![i - subItemCount][1][elm.items![i - subItemCount].length - pendingSubitems];
          expect(e.value).to.equal(`${parentItem}: ${subitem}`);
          expect(e.textContent).to.equal(elm.getText(subitem));
          pendingSubitems -= 1;
        }
        // Add a subitem count
        subItemCount += pendingSubitems ? 1 : 0;
      } else {
        expect(e.value).to.equal(elm.items![i - subItemCount]);
        expect(e.textContent).to.equal(elm.getText(elm.items![i - subItemCount] as string));
      }
    });
  }
}

/**
 * @param elm
 */
async function testSelection(elm: Dropdown) {
  const whenFired = new Promise(resolve => elm.addEventListener('change', resolve));
  const select = getSelect(elm);

  select.value = elm.items![0] as string;
  select.dispatchEvent(new CustomEvent('change'));
  let fired;
  try {
    fired = await whenFired;
  } catch (e) {
    throw new Error('Change event did not fire');
  }
  try {
    expect(fired).to.be.instanceOf(DropdownChangeEvent);
  } catch (e) {
    throw new Error('Fired event is not an instance of DropdownChangeEvent');
  }
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
          states: {
            selected: {
              meta: { test: async (el: Dropdown) => testSelection(el) },
            },
          },
        },
      },
    },
    content: {
      initial: 'any',
      meta: {
        test: async (el: Dropdown) => {
          await testContentLength(el);
          await testContent(el);
        },
      },
      states: {
        any: {
          on: { INIT: 'initialized', RERENDER: 'rerendered', TRANSLATE: 'translated' },
          meta: {
            test: async (el: Dropdown) => {
              await testContentLength(el);
              await testContent(el);
            },
          },
        },
        rerendered: {
          meta: {
            test: async (el: Dropdown) => {
              await testContentLength(el);
              await testContent(el);
            },
          },
        },
        initialized: {
          meta: {
            test: async (el: Dropdown) => {
              await testContentLength(el);
              await testContent(el);
            },
          },
        },
        translated: {
          meta: {
            test: async (el: Dropdown) => {
              await testContentLength(el);
              await testContent(el);
            },
          },
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
  TRANSLATE: {
    exec: element => {
      element.getText = (v: string) => `foo-${v}-bar`;
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
    },
    cases: [
      {},
      { value: 'foo' },
      { items: ['foo', 'bar'] },
      { value: 'foo', items: ['foo', 'bar'] },
      { value: 'foo' },
      { value: 'foo', items: ['foo', 'bar'] },
      { value: 'foo', items: ['foo', ['bar', ['baz', 'qux']]] },
      { value: 'bar: qux', items: ['foo', ['bar', ['baz', 'qux']]] },
    ],
  },
});

describe('Dropdown', () => {
  let dropdown: Dropdown;
  beforeEach(async function () {
    dropdown = await fixture('<x-dropdown></x-dropdown>');
    dropdown.getText = (v: string) => v.toUpperCase();
  });
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          await path.test(dropdown);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
