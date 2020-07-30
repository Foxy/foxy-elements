import { createMachine } from 'xstate';
import { AdminNavigationTopLink } from './AdminNavigationTopLink';
import { createModel } from '@xstate/test';
import { fixture, expect } from '@open-wc/testing';
import { I18N } from '../../../../private/index';

customElements.define('x-admin-navigation-top-link', AdminNavigationTopLink);

const samples = {
  active: { default: false, custom: true },
  label: { default: '', custom: 'test.label' },
  icon: { default: '', custom: 'test:icon' },
  href: { default: '', custom: '/test' },
};

function getRefs(element: AdminNavigationTopLink) {
  return {
    link: element.shadowRoot!.querySelector('a') as HTMLAnchorElement,
    icon: element.shadowRoot!.querySelector('iron-icon') as HTMLElement & { icon: string },
    i18n: element.shadowRoot!.querySelector('[data-testid=i18n]') as I18N,
  };
}

async function testDefault(element: AdminNavigationTopLink) {
  await element.updateComplete;

  expect(element.active, '.active must be false by default').to.equal(samples.active.default);
  expect(element.label, '.label must be empty by default').to.equal(samples.label.default);
  expect(element.icon, '.icon must be empty by default').to.equal(samples.icon.default);
  expect(element.href, '.href must be empty by default').to.equal(samples.href.default);
}

async function testActive(element: AdminNavigationTopLink) {
  await element.updateComplete;

  const refs = getRefs(element);
  const activeClass = 'text-primary md:bg-base md:border-contrast-10';

  expect(refs.link.className, 'must be highlighted when active').to.contain(activeClass);
}

async function testIcon(element: AdminNavigationTopLink) {
  await element.updateComplete;
  expect(getRefs(element).icon.icon, 'must have icon').to.contain(samples.icon.custom);
}

async function testHref(element: AdminNavigationTopLink) {
  await element.updateComplete;
  const href = getRefs(element).link.getAttribute('href');
  expect(href, 'must have href').to.contain(samples.href.custom);
}

async function testLabel(element: AdminNavigationTopLink) {
  await element.updateComplete;
  const label = getRefs(element).i18n.key;
  expect(label, 'must have label').to.contain(samples.label.custom);
}

const machine = createMachine({
  initial: 'default',
  states: {
    active: { meta: { test: testActive } },
    default: { meta: { test: testDefault } },
    withIcon: { meta: { test: testIcon } },
    withHref: { meta: { test: testHref } },
    withLabel: { meta: { test: testLabel } },
  },
  on: {
    SET_ACTIVE: '.active',
    SET_LABEL: '.withLabel',
    SET_ICON: '.withIcon',
    SET_HREF: '.withHref',
  },
});

const model = createModel<AdminNavigationTopLink>(machine).withEvents({
  SET_ACTIVE: { exec: element => void (element.active = samples.active.custom) },
  SET_LABEL: { exec: element => void (element.label = samples.label.custom) },
  SET_ICON: { exec: element => void (element.icon = samples.icon.custom) },
  SET_HREF: { exec: element => void (element.href = samples.href.custom) },
});

describe('Admin >>> AdminNavigationTopLink', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-admin-navigation-top-link></x-admin-navigation-top-link>';
          const element = await fixture<AdminNavigationTopLink>(layout);

          await path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
