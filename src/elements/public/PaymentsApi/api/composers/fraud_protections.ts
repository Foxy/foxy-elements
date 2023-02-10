import type { FraudProtections } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composeFraudProtection } from './fraud_protection';

export type Params = {
  paymentMethodSetFraudProtections: Resource<Rels.PaymentMethodSetFraudProtections>;
  fraudProtections: Resource<Rels.FraudProtection>[];
  paymentPresetId: string;
  base: string;
};

export function compose(params: Params): FraudProtections {
  const {
    paymentMethodSetFraudProtections: sfps,
    fraudProtections: fps,
    paymentPresetId: presetId,
    base,
  } = params;

  const selfURL = new URL(`/payment_presets/${presetId}/fraud_protections`, base);
  selfURL.search = new URL(sfps._links.self.href).search;

  const firstURL = new URL(selfURL.toString());
  firstURL.search = new URL(sfps._links.first.href).search;

  const lastURL = new URL(selfURL.toString());
  lastURL.search = new URL(sfps._links.last.href).search;

  const prevURL = new URL(selfURL.toString());
  prevURL.search = new URL(sfps._links.prev.href).search;

  const nextURL = new URL(selfURL.toString());
  nextURL.search = new URL(sfps._links.next.href).search;

  const fraudProtections = fps.map(resource => {
    const setFp = sfps._embedded['fx:payment_method_set_fraud_protections'].find(
      r => r.fraud_protection_uri === resource._links.self.href
    )!;

    const setFpId = new URL(setFp._links.self.href).pathname.split('/').pop()!;

    return composeFraudProtection({
      paymentMethodSetFraudProtectionId: setFpId,
      fraudProtection: resource,
      paymentPresetId: presetId,
      base,
    });
  });

  return {
    _links: {
      first: { href: firstURL.toString() },
      last: { href: lastURL.toString() },
      prev: { href: prevURL.toString() },
      next: { href: nextURL.toString() },
      self: { href: selfURL.toString() },
    },
    _embedded: { 'fx:fraud_protections': fraudProtections },
    returned_items: sfps.returned_items,
    total_items: sfps.total_items,
    offset: sfps.offset,
    limit: sfps.limit,
  };
}
