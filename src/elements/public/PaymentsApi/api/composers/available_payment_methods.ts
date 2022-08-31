import type { AvailablePaymentMethods } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Params = {
  hostedPaymentGatewaysHelper: Resource<Rels.HostedPaymentGatewaysHelper>;
  paymentGatewaysHelper: Resource<Rels.PaymentGatewaysHelper>;
  paymentPresetId: string;
  paymentGateway?: Resource<Rels.PaymentGateway>;
  base: string;
};

export function compose(params: Params): AvailablePaymentMethods {
  const {
    hostedPaymentGatewaysHelper: hostedGwsHelper,
    paymentGatewaysHelper: gwsHelper,
    paymentPresetId: presetId,
    paymentGateway: gw,
    base,
  } = params;

  const selfURL = new URL(`./payment_presets/${presetId}/available_payment_methods`, base);
  const values: AvailablePaymentMethods['values'] = {};

  Object.entries(hostedGwsHelper.values).forEach(([type, helper]) => {
    values[type] = helper;
  });

  Object.entries(gwsHelper.values).forEach(([type, helper]) => {
    values[type] = helper;
    if (gw) values[type].conflict = { type: gw.type, name: gw.description };
  });

  return { _links: { self: { href: selfURL.toString() } }, values };
}
