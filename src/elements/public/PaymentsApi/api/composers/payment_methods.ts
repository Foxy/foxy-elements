import type { PaymentMethods } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composePaymentMethod } from './payment_method';

export type Params = {
  paymentMethodSetHostedPaymentGateways: Resource<Rels.PaymentMethodSetHostedPaymentGateways>;
  hostedPaymentGatewaysHelper: Resource<Rels.HostedPaymentGatewaysHelper>;
  paymentGatewaysHelper: Resource<Rels.PaymentGatewaysHelper>;
  hostedPaymentGateways: Resource<Rels.HostedPaymentGateway>[];
  paymentPresetId: string;
  paymentGateway?: Resource<Rels.PaymentGateway> | 'not-on-page';
  query: string;
  base: string;
};

export function compose(params: Params): PaymentMethods {
  const {
    paymentMethodSetHostedPaymentGateways: shgws,
    hostedPaymentGatewaysHelper: hostedGwsHelper,
    hostedPaymentGateways: hgws,
    paymentGatewaysHelper: gwsHelper,
    paymentPresetId: presetId,
    paymentGateway: gw,
    query,
    base,
  } = params;

  const searchParams = new URLSearchParams(query);
  const offset = parseInt(searchParams.get('offset') ?? '0');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const totalItems = shgws.total_items + (gw ? 1 : 0);
  const returnedItems = shgws.returned_items + (!gw || gw === 'not-on-page' ? 0 : 1);

  const selfURL = new URL(`/payment_presets/${presetId}/payment_methods`, base);
  selfURL.search = query;

  const firstURL = new URL(selfURL.toString());
  const lastURL = new URL(selfURL.toString());
  const prevURL = new URL(selfURL.toString());
  const nextURL = new URL(selfURL.toString());

  firstURL.searchParams.set('limit', String(limit));
  firstURL.searchParams.set('offset', String(offset));

  lastURL.searchParams.set('limit', String(limit));
  lastURL.searchParams.set('offset', String(Math.max(0, totalItems - limit)));

  prevURL.searchParams.set('limit', String(limit));
  prevURL.searchParams.set('offset', String(Math.max(0, offset - limit)));

  nextURL.searchParams.set('limit', String(limit));
  nextURL.searchParams.set(
    'offset',
    String(Math.min(offset + limit, Math.max(0, totalItems - limit)))
  );

  const paymentMethods = [...(gw && gw !== 'not-on-page' ? [gw] : []), ...hgws].map(resource => {
    const shgw = shgws._embedded['fx:payment_method_set_hosted_payment_gateways'].find(
      r => r.hosted_payment_gateway_uri === resource._links.self.href
    );

    if (shgw) {
      return composePaymentMethod({
        paymentMethodSetHostedPaymentGatewayId: new URL(shgw._links.self.href).pathname
          .split('/')
          .pop() as string,
        hostedPaymentGateway: resource,
        paymentPresetId: presetId,
        helper: hostedGwsHelper.values[resource.type],
        base,
      });
    }

    return composePaymentMethod({
      paymentPresetId: presetId,
      paymentGateway: resource,
      helper: gwsHelper.values[resource.type],
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
    _embedded: { 'fx:payment_methods': paymentMethods },
    returned_items: returnedItems,
    total_items: totalItems,
    offset,
    limit,
  };
}
