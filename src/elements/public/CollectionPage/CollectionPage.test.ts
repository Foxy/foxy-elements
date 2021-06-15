import './index';

import { Data as Attribute } from '../AttributeCard/types';
import { CollectionPage } from './CollectionPage';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  items: HTMLElement[];
};

type Data = {
  _links: Record<'self' | 'first' | 'prev' | 'next' | 'last', { href: string }>;
  _embedded: { 'fx:attributes': Attribute[] };
};

describe('CollectionPage', () => {
  generateTests<Data, CollectionPage<Data>, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    href: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    tag: 'foxy-collection-page',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      idle: {
        async test({ refs, element }) {
          await testItemProperty(refs, element);
        },

        async template({ refs, element }) {
          const lastItem = refs.items[refs.items.length - 1];

          expect(lastItem).to.have.attribute('href', '');
          expect(lastItem).to.have.attribute('lang', element.lang);
          expect(lastItem).to.have.attribute('group', element.group);
          expect(lastItem).to.have.attribute('parent', element.href);
        },
      },

      async fail({ refs, element }) {
        const lastItem = refs.items[refs.items.length - 1];

        expect(lastItem).to.have.attribute('href', 'foxy://collection-page/fail');
        expect(lastItem).to.have.attribute('lang', element.lang);
        expect(lastItem).to.have.attribute('group', element.group);
        expect(lastItem).to.have.attribute('parent', element.href);

        await testItemProperty(refs, element);
      },

      async busy({ refs, element }) {
        const lastItem = refs.items[refs.items.length - 1];

        expect(lastItem).to.have.attribute('href', 'foxy://collection-page/stall');
        expect(lastItem).to.have.attribute('lang', element.lang);
        expect(lastItem).to.have.attribute('group', element.group);
        expect(lastItem).to.have.attribute('parent', element.href);

        await testItemProperty(refs, element);
      },
    },
  });
});

/**
 * @param refs
 * @param element
 */
async function testItemProperty(refs: Refs, element: CollectionPage<Data>) {
  const items = element.form?._embedded?.['fx:attributes'] ?? [];
  let itemElements = refs.items;

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('group', element.group);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });

  element.item = ctx => ctx.html`
    <foxy-foo
      .data=${ctx.data}
      href=${ctx.href}
      lang=${ctx.lang}
      group=${ctx.group}
      parent=${ctx.parent}
      data-testclass="items"
    >
    </foxy-foo>
  `;

  await element.updateComplete;

  itemElements = Array.from(
    element.renderRoot.querySelectorAll('[data-testclass="items"]')
  ) as HTMLElement[];

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.property('localName', 'foxy-foo');
    expect(itemElements[index]).to.have.property('data', item);
    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('group', element.group);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });

  element.item = 'foxy-bar';
  await element.updateComplete;

  itemElements = Array.from(
    element.renderRoot.querySelectorAll('[data-testclass="items"]')
  ) as HTMLElement[];

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.property('localName', 'foxy-bar');
    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('group', element.group);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });
}
