import type { FraudProtection } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composeAvailableFraudProtections } from './available_fraud_protections';

export type Params = {
  paymentMethodSetFraudProtectionId: string;
  fraudProtection: Resource<Rels.FraudProtection>;
  paymentPresetId: string;
  base: string;
};

export function compose(params: Params): FraudProtection {
  const {
    paymentMethodSetFraudProtectionId: setFpId,
    paymentPresetId: presetId,
    fraudProtection: fp,
    base,
  } = params;

  const { _links: fpLinks, ...fpProps } = fp;
  const helper = composeAvailableFraudProtections({ paymentPresetId: presetId, base });

  const fpId = new URL(fpLinks.self.href).pathname.split('/').pop() as string;
  const paymentsApiId = `${fpId}C${setFpId}`;

  const presetURL = new URL(`./payment_presets/${presetId}`, base);
  const selfURL = new URL(`./payment_presets/${presetId}/fraud_protections/${paymentsApiId}`, base);

  return {
    _links: {
      'self': { href: selfURL.toString() },
      'fx:store': fpLinks['fx:store'],
      'fx:payment_preset': { href: presetURL.toString() },
    },
    ...fpProps,
    helper: helper.values[fp.type],
  };
}
