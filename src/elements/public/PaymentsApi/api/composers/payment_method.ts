import type { PaymentMethod } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type HostedPaymentGatewayParams = {
  paymentMethodSetHostedPaymentGatewayId: string;
  hostedPaymentGateway: Resource<Rels.HostedPaymentGateway>;
  helper: Resource<Rels.HostedPaymentGatewaysHelper>['values'][string];
};

export type PaymentGatewayParams = {
  paymentGateway: Resource<Rels.PaymentGateway>;
  helper: Resource<Rels.PaymentGatewaysHelper>['values'][string];
};

export type CommonParams = {
  paymentPresetId: string;
  base: string;
};

export type Params = CommonParams & (HostedPaymentGatewayParams | PaymentGatewayParams);

export function compose(params: Params): PaymentMethod {
  const { paymentPresetId: presetId, helper, base } = params;

  const gw = 'paymentGateway' in params ? params.paymentGateway : params.hostedPaymentGateway;
  const { _links: gwLinks, ...gwProps } = gw;

  const gwId = new URL(gwLinks.self.href).pathname.split('/').pop() as string;
  let methodId: string;

  if ('paymentMethodSetHostedPaymentGatewayId' in params) {
    methodId = `H${gwId}C${params.paymentMethodSetHostedPaymentGatewayId}`;
  } else {
    methodId = `R${gwId}`;
  }

  const presetURL = new URL(`./payment_presets/${presetId}`, base);
  const selfURL = new URL(`./payment_presets/${presetId}/payment_methods/${methodId}`, base);

  const links = {
    'self': { href: selfURL.toString() },
    'fx:store': gwLinks['fx:store'],
    'fx:payment_preset': { href: presetURL.toString() },
    ...('fx:connect_gateway' in gwLinks
      ? { 'fx:connect_gateway': gwLinks['fx:connect_gateway'] }
      : {}),
  };

  return {
    // The API adds fx:connect_gateway only to hosted gateways that support it.
    // v1 Graph links can't be optional, so the type says it's always there.
    _links: links as PaymentMethod['_links'],
    ...gwProps,
    helper,
  };
}
