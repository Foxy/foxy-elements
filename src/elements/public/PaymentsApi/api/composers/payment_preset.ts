import type { PaymentPreset } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Params = {
  paymentMethodSet: Resource<Rels.PaymentMethodSet>;
  base: string;
};

export function compose(params: Params): PaymentPreset {
  const { paymentMethodSet: set, base } = params;
  const { _links: setLinks, ...setProps } = set;

  const presetId = new URL(set._links.self.href).pathname.split('/').pop() as string;

  const selfURL = new URL(`./payment_presets/${presetId}`, base);

  const methodsURL = new URL(`./payment_presets/${presetId}/payment_methods`, base);

  const protectionsURL = new URL(`./payment_presets/${presetId}/fraud_protections`, base);

  const availableMethodsURL = new URL(
    `./payment_presets/${presetId}/available_payment_methods`,
    base
  );

  const availableFraudProtectionsURL = new URL(
    `./payment_presets/${presetId}/available_fraud_protections`,
    base
  );

  return {
    _links: {
      'self': { href: selfURL.toString() },
      'fx:store': setLinks['fx:store'],
      'fx:payment_methods': { href: methodsURL.toString() },
      'fx:fraud_protections': { href: protectionsURL.toString() },
      'fx:available_payment_methods': { href: availableMethodsURL.toString() },
      'fx:available_fraud_protections': { href: availableFraudProtectionsURL.toString() },
    },

    ...setProps,
  };
}
