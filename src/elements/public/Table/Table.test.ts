import { Backend, Core } from '@foxy.io/sdk';
import { expect, html } from '@open-wc/testing';

import { CellContext } from './types';
import { Table } from './Table';
import { generateTests } from '../NucleonElement/generateTests';

type TestData = Core.Resource<Backend.Rels.Attributes>;

class TestTable extends Table<TestData> {
  columns = [
    {
      header: () => html`<div data-testid="nameHeader">Name</div>`,
      cell: (ctx: CellContext<TestData>) => {
        return ctx.html`<div data-testclass="names">${ctx.data.name}</div>`;
      },
    },
    {
      hideBelow: 'md' as const,
      header: () => html`<div data-testid="valueHeader">Value</div>`,
      cell: (ctx: CellContext<TestData>) => {
        return html`<div data-testclass="values">${ctx.data.value}</div>`;
      },
    },
  ];
}

customElements.define('test-table', TestTable);

type Refs = {
  wrapper: HTMLDivElement;
  table: HTMLTableElement;
  nameHeader: HTMLDivElement;
  names: HTMLDivElement[];
  valueHeader: HTMLDivElement;
  values: HTMLDivElement[];
};

describe('Table', () => {
  generateTests<TestData, TestTable, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    href: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    tag: 'test-table',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      busy({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.table.rows).to.have.length(21);
      },

      fail({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.table.rows).to.have.length(21);
      },

      idle({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.nameHeader).to.exist;
        expect(refs.valueHeader).to.exist;
        expect(refs.table.rows).to.have.length(
          Math.max(element.data?._embedded['fx:attributes'].length ?? 0, 21)
        );

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
