import './index';

import { AttributeCard } from './AttributeCard';
import { Data } from './types';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  name: HTMLSpanElement;
  value: HTMLSpanElement;
};

describe('AttributeCard', () => {
  generateTests<Data, AttributeCard, Refs>({
    tag: 'foxy-attribute-card',
    href: 'https://demo.foxycart.com/s/admin/customer_attributes/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    maxTestsPerState: 5,
    isEmptyValid: true,
    assertions: {
      busy({ refs }) {
        expect(refs.name, "name mustn't be rendered").to.be.undefined;
        expect(refs.value, "value mustn't be rendered").to.be.undefined;
      },

      idle: {
        snapshot({ refs, element }) {
          expect(refs.name).to.contain.text(element.form.name!);
          expect(refs.value).to.contain.text(element.form.value!);
        },
      },
    },
  });
});
