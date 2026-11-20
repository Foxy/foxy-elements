import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductTagForm } from './ProductTagForm';
import { Data } from './types';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductTagForm', () => {
  it('imports and registers foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and registers foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and registers itself as foxy-product-tag-form', () => {
    expect(customElements.get('foxy-product-tag-form')).to.equal(ProductTagForm);
  });

  it('has a default i18n namespace "product-tag-form"', () => {
    expect(ProductTagForm.defaultNS).to.equal('product-tag-form');
  });

  it('extends InternalForm', () => {
    expect(new ProductTagForm()).to.be.instanceOf(InternalForm);
  });

  it('extends NucleonElement', () => {
    expect(new ProductTagForm()).to.be.instanceOf(NucleonElement);
  });

  it('produces v8n_required when tag is empty', () => {
    const errors = ProductTagForm.v8n.map(rule => rule({} as Data, {} as Data));
    expect(errors).to.include('tag:v8n_required');
  });

  it('produces v8n_too_long when tag exceeds 255 chars', () => {
    const errors = ProductTagForm.v8n.map(rule =>
      rule({ tag: 'x'.repeat(256) } as Data, {} as Data)
    );
    expect(errors).to.include('tag:v8n_too_long');
  });

  it('passes v8n with a valid tag', () => {
    const errors = ProductTagForm.v8n
      .map(rule => rule({ tag: 'bestseller' } as Data, {} as Data))
      .filter(e => e !== true);
    expect(errors).to.deep.equal([]);
  });

  it('renders the tag text control on load', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/product_tags/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<ProductTagForm>(html`
      <foxy-product-tag-form .data=${data} @fetch=${(e: Event) => router.handleEvent(e as any)}>
      </foxy-product-tag-form>
    `);
    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="tag"]');
    expect(control).to.exist;
  });
});
