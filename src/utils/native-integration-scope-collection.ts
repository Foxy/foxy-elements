import type { ScopeCollection } from './user-scope';

const PROVIDER_COLLECTIONS = new Map<string, ScopeCollection>([
  ['webflow', 'webhooks'],
  ['zapier', 'webhooks'],
  ['webhook', 'webhooks'],
  ['avalara', 'taxes'],
  ['taxjar', 'taxes'],
  ['onesource', 'taxes'],
  ['apple_pay', 'payment_settings'],
  ['google_pay', 'payment_settings'],
  ['fedex', 'shipping_integrations'],
]);

/**
 * Native integrations are gated by the collection of their provider. Returns `null` for other
 * providers, so nothing gets locked by a guess.
 */
export function getNativeIntegrationScopeCollection(
  provider: string | null | undefined
): ScopeCollection | null {
  return PROVIDER_COLLECTIONS.get(provider ?? '') ?? null;
}
