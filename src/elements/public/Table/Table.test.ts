import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { Column } from './types';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Spinner } from '../Spinner/Spinner';
import { Table } from './Table';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html as litHtmlTemplateFunction } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('Table', () => {
  it('extends NucleonElement', () => {
    expect(new Table()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-table', () => {
    expect(customElements.get('foxy-table')).to.equal(Table);
  });

  it('passes lang and ns to foxy-spinner', async () => {
    const element = await fixture<Table<any>>(html`<foxy-table lang="es" ns="foo"></foxy-table>`);
    const spinner = (await getByTestId(element, 'spinner')) as Spinner;

    expect(spinner).to.have.attribute('lang', 'es');
    expect(spinner).to.have.attribute('ns', 'foo spinner');
  });

  it('passes context and data to columns[number].header renderer', async () => {
    const assert = async (resolve: () => void) => {
      const data = await getTestData('./s/admin/stores/0/transactions');
      const columns: Column<any>[] = [
        {
          header: ctx => {
            expect(ctx).to.have.property('lang', 'es');
            expect(ctx).to.have.property('html', litHtmlTemplateFunction);
            expect(ctx).to.have.property('data', data);
            resolve();
            return ctx.html``;
          },
        },
      ];

      await fixture<Table<any>>(
        html`<foxy-table lang="es" .data=${data} .columns=${columns}></foxy-table>`
      );
    };

    await new Promise<void>((resolve, reject) => assert(resolve).catch(reject));
  });

  it('passes context and data to columns[number].cell renderer', async () => {
    const assert = async (resolve: () => void) => {
      const data = await getTestData<any>('./s/admin/stores/0/transactions');
      const columns: Column<any>[] = [
        {
          cell: ctx => {
            expect(ctx).to.have.property('lang', 'es');
            expect(ctx).to.have.property('html', litHtmlTemplateFunction);
            expect(ctx).to.have.property('data', data._embedded['fx:transactions'][0]);
            resolve();
            return ctx.html``;
          },
        },
      ];

      await fixture<Table<any>>(
        html`<foxy-table lang="es" .data=${data} .columns=${columns}></foxy-table>`
      );
    };

    await new Promise<void>((resolve, reject) => assert(resolve).catch(reject));
  });

  it('renders foxy-spinner in empty state by default', async () => {
    const element = await fixture<Table<any>>(html`<foxy-table></foxy-table>`);
    expect(await getByTestId(element, 'spinner')).to.have.attribute('state', 'empty');
  });

  it('renders foxy-spinner in busy state while loading', async () => {
    const element = await fixture<Table<any>>(html`<foxy-table href="/foo"></foxy-table>`);
    expect(await getByTestId(element, 'spinner')).to.have.attribute('state', 'busy');
  });

  it('renders foxy-spinner in error state if loading data fails', async () => {
    const element = await fixture<Table<any>>(html`<foxy-table href="/foo"></foxy-table>`);
    await waitUntil(() => element.in('fail'));
    expect(await getByTestId(element, 'spinner')).to.have.attribute('state', 'error');
  });

  it('renders headers from columns[number].header in given order', async () => {
    const columns: Column<any>[] = [
      { header: ({ html }) => html`One` },
      { header: ({ html }) => html`Two` },
    ];

    const element = await fixture<Table<any>>(html`<foxy-table .columns=${columns}></foxy-table>`);
    const table = (await getByTestId(element, 'table')) as HTMLTableElement;

    expect(table.tHead?.rows[0].cells[0]).to.include.text('One');
    expect(table.tHead?.rows[0].cells[1]).to.include.text('Two');
  });

  it('renders cells from columns[number].cell in given order', async () => {
    const columns: Column<any>[] = [
      { cell: ({ html }) => html`One` },
      { cell: ({ html }) => html`Two` },
    ];

    const data = await getTestData('./s/admin/stores/0/transactions');
    const layout = html`<foxy-table .data=${data} .columns=${columns}></foxy-table>`;
    const element = await fixture<Table<any>>(layout);
    const table = (await getByTestId(element, 'table')) as HTMLTableElement;

    expect(table.tBodies[0].rows[0].cells[0]).to.include.text('One');
    expect(table.tBodies[0].rows[0].cells[1]).to.include.text('Two');
  });

  it('hides columns according to the breakpoints set in columns[number].hideBelow', async () => {
    const columns: Column<any>[] = [
      { hideBelow: 'xl' },
      { hideBelow: 'lg' },
      { hideBelow: 'md' },
      { hideBelow: 'sm' },
    ];

    const data = await getTestData('./s/admin/stores/0/transactions');
    const layout = html`<foxy-table .data=${data} .columns=${columns}></foxy-table>`;
    const element = await fixture<Table<any>>(layout);
    const table = (await getByTestId(element, 'table')) as HTMLTableElement;

    expect(table.tBodies[0].rows[0].cells[0].className).to.include('hidden xl-table-cell');
    expect(table.tBodies[0].rows[0].cells[1].className).to.include('hidden lg-table-cell');
    expect(table.tBodies[0].rows[0].cells[2].className).to.include('hidden md-table-cell');
    expect(table.tBodies[0].rows[0].cells[3].className).to.include('hidden sm-table-cell');
  });

  it('renders default slot', async () => {
    const layout = html`<foxy-table></foxy-table>`;
    const element = await fixture(layout);
    expect(await getByTag(element, 'slot')).to.have.property('name', '');
  });

  it('replaces default slot with template "default" if available', async () => {
    const name = 'default';
    const value = `<p>Value of the "${name}" template.</p>`;
    const element = await fixture<Table<any>>(html`
      <foxy-table>
        <template>${unsafeHTML(value)}</template>
      </foxy-table>
    `);

    const slot = await getByTag<HTMLSlotElement>(element, 'slot');
    const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

    expect(slot).to.not.exist;
    expect(sandbox).to.contain.html(value);
  });
});
