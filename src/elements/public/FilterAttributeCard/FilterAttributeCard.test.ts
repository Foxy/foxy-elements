import './index';

import { FilterAttributeCard as Card } from './FilterAttributeCard';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { Data } from './types';
import { getByKey } from '../../../testgen/getByKey';
import { createRouter } from '../../../server/router/createRouter';
import { defaults } from '../../../server/hapi/defaults';
import { links } from '../../../server/hapi/links';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement';

describe('FilterAttributeCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('defines foxy-nucleon', () => {
    const localName = 'foxy-nucleon';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines itself as foxy-filter-attribute-card', () => {
    const localName = 'foxy-filter-attribute-card';
    expect(customElements.get(localName)).to.equal(Card);
  });

  it('has a static property "countRefreshInterval"', () => {
    expect(Card).to.have.property('countRefreshInterval', 600000);
  });

  it('has a static property "filterQueryKey"', () => {
    expect(Card).to.have.property('filterQueryKey', 'filter_query');
  });

  it('has a static property "filterNameKey"', () => {
    expect(Card).to.have.property('filterNameKey', 'filter_name');
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace "filter-attribute-card"', () => {
    expect(Card).to.have.property('defaultNS', 'filter-attribute-card');
    expect(new Card()).to.have.property('ns', 'filter-attribute-card');
  });

  it('has a reactive property "getCountLoaderHref"', async () => {
    const def = { attribute: false };
    expect(Card).to.have.deep.nested.property('properties.getCountLoaderHref', def);

    const layout = html`<foxy-filter-attribute-card></foxy-filter-attribute-card>`;
    const element = await fixture<Card>(layout);
    expect(element).to.have.deep.property('getCountLoaderHref', null);
  });

  it('renders filter name when loaded', async () => {
    const layout = html`<foxy-filter-attribute-card></foxy-filter-attribute-card>`;
    const element = await fixture<Card>(layout);

    expect(element.renderRoot).to.not.include.text('Test');

    const attribute = await getTestData<Data>('./hapi/store_attributes/0');
    attribute.value = '/foo/bar?filter_name=Test&filter_query=123';
    element.data = attribute;
    await element.updateComplete;

    expect(element.renderRoot).to.include.text('Test');
  });

  it('renders "no name" when there is no filter name', async () => {
    const layout = html`<foxy-filter-attribute-card></foxy-filter-attribute-card>`;
    const element = await fixture<Card>(layout);

    expect(await getByKey(element, 'no_name')).to.exist;

    const attribute = await getTestData<Data>('./hapi/store_attributes/0');
    attribute.value = '/foo/bar?filter_name=&filter_query=123';
    element.data = attribute;
    await element.updateComplete;

    expect(await getByKey(element, 'no_name')).to.exist;

    attribute.value = '/foo/bar?filter_name=Test&filter_query=123';
    element.data = attribute;
    await element.updateComplete;

    expect(await getByKey(element, 'no_name')).to.not.exist;
  });

  it('renders a total count when "getCountLoaderHref" is set', async () => {
    const router = createRouter({
      defaults: defaults,
      dataset: {
        store_attributes: new Array(3).fill(0).map((_, id) => ({
          id,
          name: 'foxy-admin-bookmark',
          value: '/stores/0/transactions?filter_name=Test&amp;filter_query=foo%3Dbar',
          store_id: 0,
          visibility: 'private',
          date_created: '2013-08-05T14:15:59-0700',
          date_modified: '2013-08-05T14:15:59-0700',
        })),
      },
      links: links,
    });

    const layout = html`
      <foxy-filter-attribute-card
        href="https://demo.api/hapi/store_attributes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-filter-attribute-card>
    `;

    const element = await fixture<Card>(layout);
    await waitUntil(() => !!element.data);
    expect(element.renderRoot).to.not.include.text('3');

    element.getCountLoaderHref = () => 'https://demo.api/hapi/store_attributes';
    await waitUntil(
      () => !!element.renderRoot.querySelector<NucleonElement<any>>('foxy-nucleon')?.data
    );

    expect(element.renderRoot).to.include.text('3');
  });
});
