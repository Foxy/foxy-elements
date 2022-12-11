import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { TemplateSetCard } from './TemplateSetCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { I18n } from '../I18n/I18n';

describe('TemplateSetCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and registers itself as foxy-template-set-card', () => {
    expect(customElements.get('foxy-template-set-card')).to.equal(TemplateSetCard);
  });

  it('has a default i18n namespace "template-set-card"', () => {
    expect(TemplateSetCard.defaultNS).to.equal('template-set-card');
  });

  it('extends TwoLineCard', () => {
    expect(new TemplateSetCard()).to.be.instanceOf(TwoLineCard);
  });

  it('renders template set description in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/template_sets/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<TemplateSetCard>(html`
      <foxy-template-set-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-template-set-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text(data.description);
  });

  it('renders template set code in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/template_sets/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<TemplateSetCard>(html`
      <foxy-template-set-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-template-set-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'subtitle')).to.include.text(data.code);
  });
});
