import { createMachine } from 'xstate';
import { AdminNavigationTopGroupLink } from './AdminNavigationTopGroupLink';
import { createModel } from '@xstate/test';
import { fixture, expect } from '@open-wc/testing';
import { I18N } from '../../../../../private/index';

customElements.define('x-admin-navigation-top-group-link', AdminNavigationTopGroupLink);

const samples = {
  active: { default: false, custom: true },
  label: { default: '', custom: 'test.label' },
  icon: { default: '', custom: 'test:icon' },
  href: { default: '', custom: '/test' },
};

function getRefs(element: AdminNavigationTopGroupLink) {
  return {
    link: element.shadowRoot!.querySelector('a') as HTMLAnchorElement,
    i18n: element.shadowRoot!.querySelector('[data-testid=i18n]') as I18N,
  };
}

async function testDefault(element: AdminNavigationTopGroupLink) {
  await element.updateComplete;

  expect(element.active, '.active must be false by default').to.equal(samples.active.default);
  expect(element.label, '.label must be empty by default').to.equal(samples.label.default);
  expect(element.href, '.href must be empty by default').to.equal(samples.href.default);
}

async function testActive(element: AdminNavigationTopGroupLink) {
  await element.updateComplete;

  const refs = getRefs(element);
  const activeClass = 'md:text-primary';

  expect(refs.i18n.className, 'must be highlighted when active').to.contain(activeClass);
}

async function testHref(element: AdminNavigationTopGroupLink) {
  await element.updateComplete;
  const href = getRefs(element).link.getAttribute('href');
  expect(href, 'must have href').to.contain(samples.href.custom);
}

async function testLabel(element: AdminNavigationTopGroupLink) {
  await element.updateComplete;
  const label = getRefs(element).i18n.key;
  expect(label, 'must have label').to.contain(samples.label.custom);
}

const machine = createMachine({
  initial: 'default',
  states: {
    active: { meta: { test: testActive } },
    default: { meta: { test: testDefault } },
    withHref: { meta: { test: testHref } },
    withLabel: { meta: { test: testLabel } },
  },
  on: {
    SET_ACTIVE: '.active',
    SET_LABEL: '.withLabel',
    SET_HREF: '.withHref',
  },
});

const model = createModel<AdminNavigationTopGroupLink>(machine).withEvents({
  SET_ACTIVE: { exec: element => void (element.active = samples.active.custom) },
  SET_LABEL: { exec: element => void (element.label = samples.label.custom) },
  SET_HREF: { exec: element => void (element.href = samples.href.custom) },
});

describe('Admin >>> AdminNavigationTopGroupLink', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-admin-navigation-top-group-link></x-admin-navigation-top-group-link>';
          const element = await fixture<AdminNavigationTopGroupLink>(layout);

          await path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
