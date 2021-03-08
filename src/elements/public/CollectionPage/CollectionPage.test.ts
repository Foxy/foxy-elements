import './index';

import { Data as Attribute } from '../AttributeCard/types';
import { CollectionPage } from './CollectionPage';
import { Spinner } from '../Spinner';
import { SpinnerState } from '../Spinner/Spinner';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  spinner: Spinner;
  items: HTMLElement[];
};

type Data = {
  _links: Record<'self' | 'first' | 'prev' | 'next' | 'last', { href: string }>;
  _embedded: { 'fx:attributes': Attribute[] };
};

class FoxyNullElement extends HTMLElement {
  data = null;
}

customElements.define('foxy-null', FoxyNullElement);

describe('CollectionPage', () => {
  generateTests<Data, CollectionPage<Data>, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    href: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    tag: 'foxy-collection-page',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      async idle({ refs, element }) {
        if ((element.form?._embedded?.['fx:attributes'] ?? []).length > 0) {
          expect(refs.spinner).to.be.undefined;
        } else {
          await testSpinnerProperty(refs, element, 'empty');
        }

        await testItemProperty(refs, element);
      },

      async fail({ refs, element }) {
        await testSpinnerProperty(refs, element, 'error');
        await testItemProperty(refs, element);
      },

      async busy({ refs, element }) {
        await testSpinnerProperty(refs, element, 'busy');
        await testItemProperty(refs, element);
      },
    },
  });
});

async function testSpinnerProperty(refs: Refs, element: CollectionPage<Data>, state: SpinnerState) {
  let spinner = refs.spinner;

  expect(spinner).to.have.attribute('lang', element.lang);
  expect(spinner).to.have.attribute('state', state);

  element.spinner = ctx => ctx.html`
    <foxy-test
      data-testid="spinner" 
      lang=${ctx.lang} 
      state=${ctx.state}
    >
    </foxy-test>
  `;

  await element.updateComplete;
  spinner = element.renderRoot.querySelector('[data-testid="spinner"]') as Spinner;

  expect(spinner).to.have.property('localName', 'foxy-test');
  expect(spinner).to.have.attribute('lang', element.lang);
  expect(spinner).to.have.attribute('state', state);

  element.spinner = 'foxy-spinner';
  await element.updateComplete;
  spinner = element.renderRoot.querySelector('[data-testid="spinner"]') as Spinner;

  expect(spinner).to.have.property('localName', 'foxy-spinner');
  expect(spinner).to.have.attribute('lang', element.lang);
  expect(spinner).to.have.attribute('state', state);
}

async function testItemProperty(refs: Refs, element: CollectionPage<Data>) {
  const items = element.form?._embedded?.['fx:attributes'] ?? [];
  let itemElements = refs.items;

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });

  element.item = ctx => ctx.html`
    <foxy-foo
      href=${ctx.data._links.self.href}
      lang=${ctx.lang}
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
    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
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
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });
}
