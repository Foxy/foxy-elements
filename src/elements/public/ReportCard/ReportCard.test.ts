import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { ReportCard } from './ReportCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';

import { Resource } from '@foxy.io/sdk/core';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { createRouter } from '../../../server/index';
import { getByKey } from '../../../testgen/getByKey';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';

const router = createRouter();

describe('ReportCard', () => {
  it('extends TwoLineCard', () => {
    expect(new ReportCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-report-card', () => {
    expect(customElements.get('foxy-report-card')).to.equal(ReportCard);
  });

  it('has a default i18next namespace of "report-card"', () => {
    expect(new ReportCard()).to.have.property('ns', 'report-card');
  });

  it('renders report name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-report-card @fetch=${handleFetch}></foxy-report-card>`;
    const element = await fixture<ReportCard>(layout);

    element.href = 'https://demo.api/hapi/reports/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
  });

  it('renders report start date in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-report-card @fetch=${handleFetch}></foxy-report-card>`;
    const element = await fixture<ReportCard>(layout);

    element.href = 'https://demo.api/hapi/reports/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    const dateObject = new Date(element.data!.datetime_start);
    const stringDate = dateObject.toLocaleDateString('en', {
      month: 'long',
      year: new Date().getFullYear() === dateObject.getFullYear() ? undefined : 'numeric',
      day: 'numeric',
    });

    expect(title).to.include.text(stringDate);
  });

  it('renders report end date in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-report-card @fetch=${handleFetch}></foxy-report-card>`;
    const element = await fixture<ReportCard>(layout);
    console.log(element);

    element.href = 'https://demo.api/hapi/reports/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    const dateObject = new Date(element.data!.datetime_end);
    const stringDate = dateObject.toLocaleDateString('en', {
      month: 'long',
      year: new Date().getFullYear() === dateObject.getFullYear() ? undefined : 'numeric',
      day: 'numeric',
    });

    expect(title).to.include.text(stringDate);
  });

  it('renders report version in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-report-card @fetch=${handleFetch}></foxy-report-card>`;
    const element = await fixture<ReportCard>(layout);

    element.href = 'https://demo.api/hapi/reports/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.version);
  });

  it('renders download url in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-report-card @fetch=${handleFetch}></foxy-report-card>`;
    const element = await fixture<ReportCard>(layout);

    element.href = 'https://demo.api/hapi/reports/0';
    element.lang = 'es';
    element.ns = 'foo';

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
    const data = element.data!;

    expect(subtitle).to.include.html(data._links['fx:download_url']['href']);
  });

  //   it('renders rate in the subtitle', async () => {
  //     const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
  //     const layout = html`<foxy-report-card @fetch=${handleFetch}></foxy-report-card>`;
  //     const element = await fixture<ReportCard>(layout);

  //     element.href = 'https://demo.api/hapi/reports/0';
  //     element.lang = 'es';
  //     element.ns = 'foo';

  //     await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
  //     const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
  //     const rate = await getByKey(subtitle, 'percent');
  //     const options = JSON.stringify({ fraction: element.data!.rate / 100 });

  //     expect(rate).to.have.attribute('options', options);
  //     expect(rate).to.have.attribute('lang', element.lang);
  //     expect(rate).to.have.attribute('ns', element.ns);
  //   });
});
