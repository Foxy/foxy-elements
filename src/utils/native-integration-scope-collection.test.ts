import { expect } from '@open-wc/testing';

import { getNativeIntegrationScopeCollection } from './native-integration-scope-collection';

describe('getNativeIntegrationScopeCollection', () => {
  it('returns the collection of each gated provider', () => {
    expect(getNativeIntegrationScopeCollection('webflow')).to.equal('webhooks');
    expect(getNativeIntegrationScopeCollection('zapier')).to.equal('webhooks');
    expect(getNativeIntegrationScopeCollection('webhook')).to.equal('webhooks');
    expect(getNativeIntegrationScopeCollection('avalara')).to.equal('taxes');
    expect(getNativeIntegrationScopeCollection('taxjar')).to.equal('taxes');
    expect(getNativeIntegrationScopeCollection('onesource')).to.equal('taxes');
    expect(getNativeIntegrationScopeCollection('apple_pay')).to.equal('payment_settings');
    expect(getNativeIntegrationScopeCollection('google_pay')).to.equal('payment_settings');
    expect(getNativeIntegrationScopeCollection('fedex')).to.equal('shipping_integrations');
  });

  it('returns null for other or missing providers', () => {
    expect(getNativeIntegrationScopeCollection('custom_tax')).to.be.null;
    expect(getNativeIntegrationScopeCollection('constructor')).to.be.null;
    expect(getNativeIntegrationScopeCollection('')).to.be.null;
    expect(getNativeIntegrationScopeCollection(null)).to.be.null;
    expect(getNativeIntegrationScopeCollection(undefined)).to.be.null;
  });
});
