import { createMachine } from 'xstate';
import { AdminNavigationTopGroup } from './AdminNavigationTopGroup';
import { createModel } from '@xstate/test';
import { fixture, expect } from '@open-wc/testing';
import { I18N } from '../../../../private/index';
import { AdminNavigationTopGroupLink } from './AdminNavigationTopGroupLink/AdminNavigationTopGroupLink';

customElements.define('x-admin-navigation-top-link', AdminNavigationTopGroup);

const samples = {
  active: { default: false, custom: true },
  label: { default: '', custom: 'test.label' },
  route: { default: '', custom: 'items/test0' },
  icon: { default: '', custom: 'test:icon' },
  open: { default: false, custom: true },
  items: {
    default: [],
    custom: [
      { label: 'items.test0', name: 'items-test0', href: 'items/test0' },
      {
        label: 'items.test1',
        children: [
          {
            label: 'items.test1.child',
            name: 'items-test1-child',
            href: 'items/test1/child',
          },
        ],
      },
    ],
  },
};

function getRefs(element: AdminNavigationTopGroup) {
  const root = element.shadowRoot!;
  const itemsNodeList = root.querySelectorAll('[data-testclass=item]');

  return {
    details: root.querySelector('details') as HTMLDetailsElement,
    summary: root.querySelector('summary') as HTMLElement,
    content: root.querySelector('summary > div') as HTMLDivElement,
    items: Array.from(itemsNodeList) as AdminNavigationTopGroupLink[],
    icon: root.querySelector('iron-icon') as HTMLElement & { icon: string },
    link: root.querySelector('a') as HTMLAnchorElement,
    i18n: root.querySelector('[data-testid=i18n]') as I18N,
  };
}

async function testDefault(element: AdminNavigationTopGroup) {
  await element.updateComplete;

  expect(element.active, '.active must be false by default').to.equal(samples.active.default);
  expect(element.label, '.label must be empty by default').to.equal(samples.label.default);
  expect(element.route, '.route must be empty by default').to.equal(samples.route.default);
  expect(element.items, '.items must be empty by default').to.be.empty;
  expect(element.icon, '.icon must be empty by default').to.equal(samples.icon.default);
  expect(element.open, '.label must be false by default').to.equal(samples.open.default);
}

async function testActive(element: AdminNavigationTopGroup) {
  await element.updateComplete;

  const { details, content } = getRefs(element);
  const detailsClass = 'md:bg-base md:border-contrast-10';
  const contentClass = 'text-primary';

  expect(details.className, 'background must be highlighted').to.contain(detailsClass);
  expect(content.className, 'text must be highlighted').to.contain(contentClass);
}

async function testLabel(element: AdminNavigationTopGroup) {
  await element.updateComplete;
  const label = getRefs(element).i18n.key;
  expect(label, 'must have label').to.contain(samples.label.custom);
}

async function testItems(element: AdminNavigationTopGroup) {
  await element.updateComplete;

  const { items } = getRefs(element);

  expect(items[0]).to.be.instanceOf(AdminNavigationTopGroupLink);
  expect(items[0].label).to.equal(samples.items.custom[0].label);
  expect(items[0].href).to.equal(samples.items.custom[0].href);

  items.slice(1).forEach((item, index) => {
    const parent = samples.items.custom[1];

    expect(item).to.be.instanceOf(AdminNavigationTopGroupLink);
    expect(item.label).to.equal(parent.children![index].label);
    expect(item.href).to.equal(parent.children![index].href);
  });
}

async function testRoute(element: AdminNavigationTopGroup) {
  await element.updateComplete;
  const { items } = getRefs(element);

  /* This test is designed to ALWAYS select the first route if rendered. */
  if (items.length > 0) {
    expect(items[0].active).to.be.true;
    items.slice(1).every(item => expect(item.active).to.be.false);
  }
}

async function testOpen(element: AdminNavigationTopGroup) {
  await element.updateComplete;

  const { details, content, summary } = getRefs(element);
  const detailsClass = 'md:bg-base md:border-contrast-10';
  const summaryClass = 'md:rounded-b-none';
  const contentClass = 'text-primary';

  expect(getRefs(element).details.open, 'details must be open').to.be.true;
  expect(details.className, 'background must be highlighted').to.contain(detailsClass);
  expect(summary.className, 'summary must not be rounded at the bottom').to.contain(summaryClass);
  expect(content.className, 'text must be highlighted').to.contain(contentClass);
}

async function testIcon(element: AdminNavigationTopGroup) {
  await element.updateComplete;
  expect(getRefs(element).icon.icon).to.equal(samples.icon.custom);
}

const machine = createMachine({
  initial: 'default',
  states: {
    open: { meta: { test: testOpen } },
    active: { meta: { test: testActive } },
    default: { meta: { test: testDefault } },
    withIcon: { meta: { test: testIcon } },
    withLabel: { meta: { test: testLabel } },
    withItems: { meta: { test: testItems } },
    withRoute: { meta: { test: testRoute } },
  },
  on: {
    SET_ACTIVE: '.active',
    SET_ITEMS: '.withItems',
    SET_LABEL: '.withLabel',
    SET_ROUTE: '.withRoute',
    SET_ICON: '.withIcon',
    SET_OPEN: '.open',
  },
});

const model = createModel<AdminNavigationTopGroup>(machine).withEvents({
  SET_ACTIVE: { exec: element => void (element.active = samples.active.custom) },
  SET_ITEMS: { exec: element => void (element.items = samples.items.custom) },
  SET_ROUTE: { exec: element => void (element.route = samples.route.custom) },
  SET_LABEL: { exec: element => void (element.label = samples.label.custom) },
  SET_ICON: { exec: element => void (element.icon = samples.icon.custom) },
  SET_OPEN: { exec: element => void (element.open = samples.open.custom) },
});

describe('Admin >>> AdminNavigationTopGroup', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-admin-navigation-top-link></x-admin-navigation-top-link>';
          const element = await fixture<AdminNavigationTopGroup>(layout);

          await path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
