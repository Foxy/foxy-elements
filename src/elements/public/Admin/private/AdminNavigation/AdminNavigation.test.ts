import { fixture, expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { AdminNavigation, NavigationTopLink, NavigationTopGroup } from './AdminNavigation';
import { AdminNavigationTopGroup } from './AdminNavigationTopGroup/AdminNavigationTopGroup';
import { AdminNavigationTopLink } from './AdminNavigationTopGroup/AdminNavigationTopLink/AdminNavigationTopLink';

customElements.define('x-admin-navigation', AdminNavigation);

const samples = {
  route: {
    default: '',
    custom: 'test-route-0',
  },
  navigation: {
    default: [],
    custom: [
      { icon: 'test:icon0', label: 'test.label0', name: 'test-route-0', href: '/test-route-0' },
      {
        icon: 'test:icon1',
        label: 'test.label1',
        children: [
          { label: 'test.label0', name: 'test-route-0', href: '/test-route-0' },
          {
            label: 'test.label0',
            children: [{ label: 'test.label0', name: 'test-route-0', href: '/test-route-0' }],
          },
        ],
        slot: 'bottom',
      },
    ] as [NavigationTopLink, NavigationTopGroup],
  },
};

function getRefs(element: AdminNavigation) {
  const itemsList = element.shadowRoot!.querySelectorAll('[data-testclass=item]');

  return {
    items: Array.from(itemsList) as [AdminNavigationTopLink, AdminNavigationTopGroup] | [],
  };
}

async function testDefault(element: AdminNavigation) {
  await element.updateComplete;

  expect(element.route, '.route must be empty').to.equal(samples.route.default);
  expect(element.navigation, '.navigation must be empty').to.be.empty;
}

async function testRoute(element: AdminNavigation) {
  await element.updateComplete;
  const [, group] = getRefs(element).items;

  expect(element.route, '.route must be set').to.equal(samples.route.custom);

  if (group && 'route' in group) {
    /** This test is designed so that the second element is ALWAYS a group (if present). */
    expect(group.route, 'child .route must be set').to.equal(samples.route.custom);
  }
}

async function testNavigation(element: AdminNavigation) {
  await element.updateComplete;
  const [linkElement, groupElement] = getRefs(element).items;
  const [link, group] = samples.navigation.custom;

  expect(element.navigation, '.navigation must be set').to.deep.equal(samples.navigation.custom);

  expect(linkElement!.label, 'link .label must be set').to.equal(link.label);
  expect(linkElement!.href, 'link .href must be set').to.equal(link.href);
  expect(linkElement!.icon, 'link .icon must be set').to.equal(link.icon);

  expect(groupElement!.label, 'group .label must be set').to.equal(group.label);
  expect(groupElement!.items, 'group .items must be set').to.equal(group.children);
  expect(groupElement!.icon, 'group .icon must be set').to.equal(group.icon);

  groupElement?.dispatchEvent(new CustomEvent('open'));
  await element.updateComplete;
  expect(groupElement?.open).to.be.true;

  groupElement?.dispatchEvent(new CustomEvent('close'));
  await element.updateComplete;
  expect(groupElement?.open).to.be.false;
}

const machine = createMachine({
  initial: 'default',
  states: {
    default: { meta: { test: testDefault } },
    withRoute: { meta: { test: testRoute } },
    withNavigation: { meta: { test: testNavigation } },
  },
  on: {
    SET_ROUTE: '.withRoute',
    SET_NAVIGATION: '.withNavigation',
  },
});

const model = createModel<AdminNavigation>(machine).withEvents({
  SET_ROUTE: { exec: element => void (element.route = samples.route.custom) },
  SET_NAVIGATION: { exec: element => void (element.navigation = samples.navigation.custom) },
});

describe('Admin >>> AdminNavigation', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-admin-navigation></x-admin-navigation>';
          const element = await fixture<AdminNavigation>(layout);

          await path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
