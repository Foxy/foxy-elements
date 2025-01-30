import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Data } from '../../types';

import { InternalAdminSubscriptionFormLinkControl as Control } from './InternalAdminSubscriptionFormLinkControl';
import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../../../testgen/getTestData';

import '../../../NucleonElement/index';
import './index';

describe('AdminSubscriptionForm', () => {
  describe('InternalAdminSubscriptionFormLinkControl', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines foxy-copy-to-clipboard', () => {
      expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
    });

    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines vcf-tooltip', () => {
      expect(customElements.get('vcf-tooltip')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-admin-subscription-form-link-control', () => {
      expect(customElements.get('foxy-internal-admin-subscription-form-link-control')).to.equal(
        Control
      );
    });

    it('has a reactive property "search" that defaults to null', () => {
      expect(new Control()).to.have.property('search', null);
      expect(Control).to.have.deep.nested.property('properties.search', {});
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
    });

    it('renders a translatable label', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-admin-subscription-form-link-control>
        </foxy-internal-admin-subscription-form-link-control>
      `);

      const label = control.renderRoot.querySelector('foxy-i18n[infer=""][key="label"]');
      expect(label).to.exist;
    });

    it('renders a translatable helper text', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-admin-subscription-form-link-control>
        </foxy-internal-admin-subscription-form-link-control>
      `);

      const helperText = control.renderRoot.querySelector('foxy-i18n[infer=""][key="helper_text"]');
      expect(helperText).to.exist;
    });

    it('renders sub_token link from parent form by default', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data._links['fx:sub_token_url'].href = 'https://example.com/sub_token_url';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-link-control infer="">
          </foxy-internal-admin-subscription-form-link-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const link = control.renderRoot.querySelector('a') as HTMLAnchorElement;
      expect(link).to.exist;
      expect(link).to.include.text('https://example.com/sub_token_url');
      expect(link.href).to.equal('https://example.com/sub_token_url');
      expect(link.target).to.equal('_blank');
    });

    it('adds search to sub_token link when set', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data._links['fx:sub_token_url'].href = 'https://example.com/sub_token_url';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-link-control search="cart=checkout" infer="">
          </foxy-internal-admin-subscription-form-link-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const link = control.renderRoot.querySelector('a') as HTMLAnchorElement;
      expect(link).to.exist;
      expect(link).to.include.text('https://example.com/sub_token_url?cart=checkout');
      expect(link.href).to.equal('https://example.com/sub_token_url?cart=checkout');
      expect(link.target).to.equal('_blank');
    });

    it('renders copy to clipboard button with link url', async () => {
      const data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
      data._links['fx:sub_token_url'].href = 'https://example.com/sub_token_url';

      const nucleon = await fixture<NucleonElement<Data>>(html`
        <foxy-nucleon .data=${data}>
          <foxy-internal-admin-subscription-form-link-control search="cart=checkout" infer="">
          </foxy-internal-admin-subscription-form-link-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      control.inferProperties();
      await control.requestUpdate();

      const button = control.renderRoot.querySelector('foxy-copy-to-clipboard') as HTMLElement;
      expect(button).to.exist;
      expect(button).to.have.attribute('text', 'https://example.com/sub_token_url?cart=checkout');
    });
  });
});
