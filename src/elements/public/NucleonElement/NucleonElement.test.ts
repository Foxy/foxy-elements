import { NucleonElement } from './NucleonElement';
import { generateTests } from './generateTests';

customElements.define('foxy-nucleon-test', NucleonElement);

describe('NucleonElement', () => {
  generateTests({
    tag: 'foxy-nucleon-test',
    href: 'https://demo.api/hapi/customer_attributes/0',
    parent: 'https://demo.api/hapi/customer_attributes',
    isEmptyValid: true,
    maxTestsPerState: 5,
  });
});
