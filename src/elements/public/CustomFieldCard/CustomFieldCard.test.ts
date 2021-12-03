import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { CustomFieldCard } from './CustomFieldCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TwoLineCard } from './TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { html } from 'lit-html';
import { router } from '../../../server';

describe('CustomFieldCard', () => {
  it('extends TwoLineCard', () => {
    expect(new CustomFieldCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-custom-field-card', () => {
    expect(customElements.get('foxy-custom-field-card')).to.equal(CustomFieldCard);
  });

  it('has a default i18next namespace of "custom-field-card"', () => {
    expect(new CustomFieldCard()).to.have.property('ns', 'custom-field-card');
  });

  it('renders custom field name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-custom-field-card @fetch=${handleFetch}></foxy-custom-field-card>`;
    const element = await fixture<CustomFieldCard>(layout);

    element.href = 'https://demo.foxycart.com/s/admin/custom_fields/0';
    await waitUntil(() => !!element.data);
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
  });

  it('renders custom field value in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-custom-field-card @fetch=${handleFetch}></foxy-custom-field-card>`;
    const element = await fixture<CustomFieldCard>(layout);

    element.href = 'https://demo.foxycart.com/s/admin/custom_fields/0';
    await waitUntil(() => !!element.data);
    const title = await getByTestId(element, 'subtitle');

    expect(title).to.include.text(element.data!.value);
  });
});
