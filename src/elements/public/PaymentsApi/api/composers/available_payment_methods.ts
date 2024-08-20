import type { AvailablePaymentMethods, PaymentMethod } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Params = {
  hostedPaymentGatewaysHelper: Resource<Rels.HostedPaymentGatewaysHelper>;
  paymentGatewaysHelper: Resource<Rels.PaymentGatewaysHelper>;
  paymentPresetId: string;
  paymentMethods: PaymentMethod[];
  paymentGateway?: Resource<Rels.PaymentGateway>;
  base: string;
};

export function compose(params: Params): AvailablePaymentMethods {
  const {
    hostedPaymentGatewaysHelper: hostedGwsHelper,
    paymentGatewaysHelper: gwsHelper,
    paymentPresetId: presetId,
    paymentMethods: pmds,
    paymentGateway: gw,
    base,
  } = params;

  const selfURL = new URL(`./payment_presets/${presetId}/available_payment_methods`, base);
  const values: AvailablePaymentMethods['values'] = {};

  Object.entries(hostedGwsHelper.values).forEach(([type, helper]) => {
    values[type] = helper;
    const pmd = pmds.find(pm => pm.type === type);
    if (pmd) values[type].conflict = { type: pmd.type, name: pmd.description };
  });

  Object.entries(gwsHelper.values).forEach(([type, helper]) => {
    values[type] = helper;
    if (gw) values[type].conflict = { type: gw.type, name: gw.description };
  });

  return { _links: { self: { href: selfURL.toString() } }, values };
}
