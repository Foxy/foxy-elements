import './index';

import { LitElement, html } from 'lit-element';
import { expect, fixture } from '@open-wc/testing';

import { InternalCustomerPortalLink } from './InternalCustomerPortalLink';

describe('InternalCustomerPortalLink', () => {
  it('extends LitElement', () => {
    expect(new InternalCustomerPortalLink()).to.be.instanceOf(LitElement);
  });

  it('has a default disabled property/attribute of false', () => {
    expect(InternalCustomerPortalLink).to.have.nested.property('properties.disabled.type', Boolean);
    expect(new InternalCustomerPortalLink()).to.have.property('disabled', false);
  });

  it('has an empty href property/attribute by default', () => {
    expect(InternalCustomerPortalLink).to.have.nested.property('properties.href.type', String);
    expect(new InternalCustomerPortalLink()).to.have.property('href', '');
  });

  it('has an empty icon property/attribute by default', () => {
    expect(InternalCustomerPortalLink).to.have.nested.property('properties.icon.type', String);
    expect(new InternalCustomerPortalLink()).to.have.property('icon', '');
  });

  it('renders a disabled button when disabled', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link disabled></foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('button[disabled]')).to.exist;
  });

  it('renders a link when enabled', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link></foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('a')).to.exist;
  });

  it('reflects the value of href to the href attribute of a link when appropriate', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link href="https://example.com">
      </foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('a')).to.have.attribute('href', 'https://example.com');
  });

  it('renders a default slot inside of a link', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link></foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('a slot:not([name])')).to.exist;
  });

  it('renders a default slot inside of a button', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link disabled></foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('button slot:not([name])')).to.exist;
  });

  it('renders an icon from icon property inside of a link', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link icon="foo"></foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('a iron-icon[icon="foo"]')).to.exist;
  });

  it('renders an icon from icon property inside of a button', async () => {
    const element = await fixture<InternalCustomerPortalLink>(html`
      <foxy-internal-customer-portal-link icon="foo" disabled></foxy-internal-customer-portal-link>
    `);

    expect(element.renderRoot.querySelector('button iron-icon[icon="foo"]')).to.exist;
  });
});
