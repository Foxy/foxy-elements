import './index';

import { Data as Attribute } from '../AttributeCard/types';
import { CollectionPageElement } from './CollectionPageElement';
import { SpinnerElement } from '../Spinner';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  spinner: SpinnerElement;
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
  generateTests<Data, CollectionPageElement<Data>, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    href: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    tag: 'foxy-collection-page',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      idle({ refs, element }) {
        const items = element.form?._embedded?.['fx:attributes'] ?? [];

        if (items.length > 0) {
          expect(refs.spinner).to.be.undefined;
        } else {
          expect(refs.spinner).to.have.attribute('state', 'empty');
        }

        items.forEach((item, index) => {
          expect(refs.items[index]).to.have.property('data', item);
          expect(refs.items[index]).to.have.attribute('lang', element.lang);
          expect(refs.items[index]).to.have.attribute('parent', element.href);
        });
      },

      fail({ refs }) {
        expect(refs.spinner).to.have.attribute('state', 'error');
      },

      busy({ refs }) {
        expect(refs.spinner).to.have.attribute('state', 'busy');
      },
    },
  });
});
