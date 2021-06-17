import { ErrorScreen, ErrorScreenReloadEvent, FriendlyError } from './ErrorScreen';
import { EventObject, createMachine } from 'xstate';
import { fixture, oneEvent } from '@open-wc/testing-helpers';
import { ButtonElement } from '@vaadin/vaadin-button';
import { I18N } from '../I18N/I18N';
import { createModel } from '@xstate/test';
import { expect } from '@open-wc/testing';

class TestErrorScreen extends ErrorScreen {
  public get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-error-screen', TestErrorScreen);

/**
 * @param type
 */
function testType(type: TestErrorScreen['type']) {
  return async (element: TestErrorScreen) => {
    await element.updateComplete;
    expect(element).to.have.property('type', type);

    const title = element.shadowRoot!.querySelector(`[key="errors.${type}.title"]`);
    const message = element.shadowRoot!.querySelector(`[key="errors.${type}.message"]`);
    const action = element.shadowRoot!.querySelector(`[key="errors.${type}.action"]`);

    expect(title).to.be.instanceOf(I18N);
    expect(message).to.be.instanceOf(I18N);
    expect(action).to.be.instanceOf(I18N);
  };
}

/**
 * @param reload
 */
function testReload(reload: TestErrorScreen['reload']) {
  return async (element: TestErrorScreen) => {
    await element.updateComplete;
    const reloadBtn = element.shadowRoot!.querySelector('[data-testid=reload]') as ButtonElement;
    if (reload) {
      const whenReloadFired = oneEvent(element, 'reload');
      reloadBtn.click();
      expect(await whenReloadFired).to.be.instanceOf(ErrorScreenReloadEvent);
    } else {
      expect(reloadBtn).to.not.exist;
    }
  };
}

const machine = createMachine({
  type: 'parallel',
  states: {
    reload: {
      initial: 'off',
      states: {
        off: {
          on: { ENABLE_RELOAD: 'on' },
          meta: { test: testReload(false) },
        },
        on: {
          meta: { test: testReload(true) },
        },
      },
    },
    type: {
      initial: 'default',
      states: {
        default: {
          on: { CUSTOMIZE_TYPE: 'custom' },
          meta: { test: testType('unknown') },
        },
        custom: {
          meta: { test: (element: TestErrorScreen) => testType(element.type)(element) },
        },
      },
    },
  },
});

const model = createModel<TestErrorScreen>(machine).withEvents({
  ENABLE_RELOAD: {
    exec: element => {
      element.reload = true;
      expect(element).to.have.property('reload', true);
    },
  },
  DISABLE_RELOAD: {
    exec: element => {
      element.reload = false;
      expect(element).to.have.property('reload', false);
    },
  },
  CUSTOMIZE_TYPE: {
    cases: [{ data: 'unauthorized' }, { data: 'setup_needed' }],
    exec: (element, evt) => {
      const type = (evt as EventObject & { data: TestErrorScreen['type'] }).data;
      element.type = type;
      expect(element).to.have.property('type', type);
    },
  },
});

describe('ErrorScreen', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestErrorScreen>('<x-error-screen></x-error-screen>');
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });

  describe('exports FriendlyError helper', () => {
    it('constructing instances with unknown error type by default', () => {
      expect(new FriendlyError()).to.have.property('type', 'unknown');
    });

    it('constructing instances with custom error type', () => {
      expect(new FriendlyError('setup_needed')).to.have.property('type', 'setup_needed');
    });
  });
});
