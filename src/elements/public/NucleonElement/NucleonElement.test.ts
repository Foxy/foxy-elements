import { NucleonElement } from './NucleonElement';
import { generateTests } from './generateTests';

customElements.define('foxy-nucleon-test', NucleonElement);

describe('NucleonElement', () => {
  generateTests({
    tag: 'foxy-nucleon-test',
    href: 'https://demo.foxycart.com/s/admin/customer_attributes/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    isEmptyValid: true,
    maxTestsPerState: 5,
  });
});
