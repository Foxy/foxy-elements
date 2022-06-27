import { TemplateResult, html } from 'lit-html';
import { expect, fixture } from '@open-wc/testing';

import { Data } from './types';
import { I18n } from '../I18n/I18n';
import { ReportsTable } from './index';
import { Spinner } from '../Spinner/Spinner';
import { Table } from '../Table/Table';
import { getByKey } from '../../../testgen/getByKey';
import { getTestData } from '../../../testgen/getTestData';

describe('ReportsTable', () => {
  it('extends Table', () => {
    expect(new ReportsTable()).to.be.instanceOf(Table);
  });

  it('has a default i18next namespace "reports-table"', () => {
    expect(new ReportsTable()).to.have.property('ns', 'reports-table');
  });

  it('registers as foxy-reports-table', () => {
    expect(customElements.get('foxy-reports-table')).to.equal(ReportsTable);
  });

  it('renders "Name", "Start", "End", "Created On" and "Link" columns by default', () => {
    const table = new ReportsTable();

    expect(table.columns).to.include(ReportsTable.nameColumn);
    expect(table.columns).to.include(ReportsTable.startColumn);
    expect(table.columns).to.include(ReportsTable.endColumn);
    expect(table.columns).to.include(ReportsTable.createdOnColumn);
    expect(table.columns).to.include(ReportsTable.linkColumn);
  });

  it('renders "Name" column header', async () => {
    const layout = ReportsTable.nameColumn.header!({
      data: await getTestData<Data>('./hapi/reports'),
      lang: 'es',
      ns: 'foo',
      html,
    });

    const header = await fixture(layout as TemplateResult);

    expect(header).to.be.instanceOf(I18n);
    expect(header).to.have.property('lang', 'es');
    expect(header).to.have.property('key', 'report_name');
    expect(header).to.have.property('ns', 'foo');
  });

  (['complete', 'customers', 'customers_ltv'] as const).forEach(name => {
    it(`renders "Name" column cell for "${name}" report name`, async () => {
      type Report = Data['_embedded']['fx:reports'][number];

      const data = { ...(await getTestData<Report>('./hapi/reports/0')), name };
      const layout = ReportsTable.nameColumn.cell!({ lang: 'es', ns: 'foo', data, html });
      const cell = await fixture(layout as TemplateResult);

      expect(cell).to.be.instanceOf(I18n);
      expect(cell).to.have.property('lang', 'es');
      expect(cell).to.have.property('key', `report_name_${name}`);
      expect(cell).to.have.property('ns', 'foo');
    });
  });

  it('renders "Start" column header', async () => {
    const layout = ReportsTable.startColumn.header!({
      data: await getTestData<Data>('./hapi/reports'),
      lang: 'es',
      ns: 'foo',
      html,
    });

    const header = await fixture(layout as TemplateResult);

    expect(header).to.be.instanceOf(I18n);
    expect(header).to.have.property('lang', 'es');
    expect(header).to.have.property('key', 'range_start');
    expect(header).to.have.property('ns', 'foo');
  });

  it('renders "Start" column cell', async () => {
    type Report = Data['_embedded']['fx:reports'][number];

    const data = await getTestData<Report>('./hapi/reports/0');
    data.datetime_start = '2022-05-24T11:00:00';

    const layout = ReportsTable.startColumn.cell!({ lang: 'es', ns: 'foo', data, html });
    const cell = await fixture(layout as TemplateResult);

    expect(cell).to.be.instanceOf(I18n);
    expect(cell).to.have.deep.property('options', { value: '2022-05-24T11:00:00' });
    expect(cell).to.have.property('lang', 'es');
    expect(cell).to.have.property('key', 'date');
    expect(cell).to.have.property('ns', 'foo');
  });

  it('renders "End" column header', async () => {
    const layout = ReportsTable.endColumn.header!({
      data: await getTestData<Data>('./hapi/reports'),
      lang: 'es',
      ns: 'foo',
      html,
    });

    const header = await fixture(layout as TemplateResult);

    expect(header).to.be.instanceOf(I18n);
    expect(header).to.have.property('lang', 'es');
    expect(header).to.have.property('key', 'range_end');
    expect(header).to.have.property('ns', 'foo');
  });

  it('renders "End" column cell', async () => {
    type Report = Data['_embedded']['fx:reports'][number];

    const data = await getTestData<Report>('./hapi/reports/0');
    data.datetime_end = '2024-03-14T22:00:00';

    const layout = ReportsTable.endColumn.cell!({ lang: 'es', ns: 'foo', data, html });
    const cell = await fixture(layout as TemplateResult);

    expect(cell).to.be.instanceOf(I18n);
    expect(cell).to.have.deep.property('options', { value: '2024-03-14T22:00:00' });
    expect(cell).to.have.property('lang', 'es');
    expect(cell).to.have.property('key', 'date');
    expect(cell).to.have.property('ns', 'foo');
  });

  it('renders "Created On" column header', async () => {
    const layout = ReportsTable.createdOnColumn.header!({
      data: await getTestData<Data>('./hapi/reports'),
      lang: 'es',
      ns: 'foo',
      html,
    });

    const header = await fixture(layout as TemplateResult);

    expect(header).to.be.instanceOf(I18n);
    expect(header).to.have.property('lang', 'es');
    expect(header).to.have.property('key', 'created_on');
    expect(header).to.have.property('ns', 'foo');
  });

  it('renders "Created On" column cell', async () => {
    type Report = Data['_embedded']['fx:reports'][number];

    const createdOn = new Date().toISOString();
    const data = await getTestData<Report>('./hapi/reports/0');
    data.date_created = createdOn;

    const layout = ReportsTable.createdOnColumn.cell!({ lang: 'es', ns: 'foo', data, html });
    const cell = await fixture(layout as TemplateResult);

    expect(cell).to.be.instanceOf(I18n);
    expect(cell).to.have.deep.property('options', { value: createdOn });
    expect(cell).to.have.property('lang', 'es');
    expect(cell).to.have.property('key', 'date');
    expect(cell).to.have.property('ns', 'foo');
  });

  it('renders "Link" column header', async () => {
    const layout = ReportsTable.linkColumn.header!({
      data: await getTestData<Data>('./hapi/reports'),
      lang: 'es',
      ns: 'foo',
      html,
    });

    const header = await fixture(layout as TemplateResult);

    expect(header).to.be.instanceOf(I18n);
    expect(header).to.have.property('lang', 'es');
    expect(header).to.have.property('key', 'link');
    expect(header).to.have.property('ns', 'foo');
  });

  it('renders download link in "Link" column cell if report status is "ready"', async () => {
    type Report = Data['_embedded']['fx:reports'][number];

    const href = 'https://example.com/my/report';
    const data = await getTestData<Report>('./hapi/reports/0');

    data.status = 'ready';
    data._links['fx:download_url'].href = href;

    const layout = ReportsTable.linkColumn.cell!({ lang: 'es', ns: 'foo', data, html });
    const cell = await fixture(layout as TemplateResult);
    const label = await getByKey(cell, 'download');

    expect(cell).to.be.instanceOf(HTMLAnchorElement);
    expect(cell).to.have.property('href', href);

    expect(label).to.have.property('lang', 'es');
    expect(label).to.have.property('ns', 'foo');
  });

  it('renders busy spinner in "Link" column cell if report status is "queued"', async () => {
    type Report = Data['_embedded']['fx:reports'][number];

    const data = { ...(await getTestData<Report>('./hapi/reports/0')), status: 'queued' } as const;
    const layout = ReportsTable.linkColumn.cell!({ lang: 'es', ns: 'foo', data, html });
    const cell = await fixture(layout as TemplateResult);

    expect(cell).to.be.instanceOf(Spinner);
    expect(cell).to.have.property('state', 'busy');
    expect(cell).to.have.property('lang', 'es');
    expect(cell).to.have.property('ns', 'foo link-spinner');
  });

  it('renders error spinner in "Link" column cell if report status is "error"', async () => {
    type Report = Data['_embedded']['fx:reports'][number];

    const data = { ...(await getTestData<Report>('./hapi/reports/0')), status: 'error' } as const;
    const layout = ReportsTable.linkColumn.cell!({ lang: 'es', ns: 'foo', data, html });
    const cell = await fixture(layout as TemplateResult);

    expect(cell).to.be.instanceOf(Spinner);
    expect(cell).to.have.property('state', 'error');
    expect(cell).to.have.property('lang', 'es');
    expect(cell).to.have.property('ns', 'foo link-spinner');
  });
});
