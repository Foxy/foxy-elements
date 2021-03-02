import { Core, Integration } from '@foxy.io/sdk';
import { expect, html } from '@open-wc/testing';

import { NucleonTable } from './NucleonTable';
import { Skeleton } from '../Skeleton/Skeleton';
import { generateTests } from '../../public/NucleonElement/generateTests';

type TestData = Core.Resource<Integration.Rels.Attributes>;

class TestTable extends NucleonTable<TestData> {
  render() {
    return super.render([
      {
        header: () => html`<div data-testid="nameHeader">Name</div>`,
        cell: resource => html`<div data-testclass="names">${resource.name}</div>`,
      },
      {
        mdAndUp: true,
        header: () => html`<div data-testid="valueHeader">Value</div>`,
        cell: resource => html`<div data-testclass="values">${resource.value}</div>`,
      },
    ]);
  }
}

customElements.define('test-table', TestTable);

type Refs = {
  wrapper: HTMLDivElement;
  table: HTMLTableElement;
  nameHeader: HTMLDivElement;
  names: HTMLDivElement[];
  valueHeader: HTMLDivElement;
  values: HTMLDivElement[];
  skeletons: Skeleton[];
};

describe('NucleonTable', () => {
  generateTests<TestData, TestTable, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    href: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    tag: 'test-table',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      busy({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.skeletons).to.have.length(20);
        refs.skeletons.forEach(skeleton => expect(skeleton).not.to.have.attribute('variant'));
      },

      fail({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.skeletons).to.have.length(20);
        refs.skeletons.forEach(skeleton => expect(skeleton).to.have.attribute('variant', 'error'));
      },

      idle({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.skeletons).to.be.undefined;
        expect(refs.nameHeader).to.exist;
        expect(refs.valueHeader).to.exist;

        element.data?._embedded['fx:attributes'].forEach((attribute, rowIndex) => {
          const name = refs.names[rowIndex];
          const nameCell = refs.table.rows[rowIndex + 1].cells[0];

          expect(name).to.exist;
          expect(name).to.have.text(attribute.name);
          expect(name).to.have.property('parentElement', nameCell);

          const value = refs.values[rowIndex];
          const valueCell = refs.table.rows[rowIndex + 1].cells[1];

          expect(value).to.exist;
          expect(value).to.have.text(attribute.value);
          expect(value).to.have.property('parentElement', valueCell);
        });
      },
    },
  });
});
