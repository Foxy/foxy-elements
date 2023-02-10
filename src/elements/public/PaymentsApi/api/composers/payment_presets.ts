import type { PaymentPresets } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composePaymentPreset } from './payment_preset';

export type Params = {
  paymentMethodSets: Resource<Rels.PaymentMethodSets>;
  base: string;
};

export function compose(params: Params): PaymentPresets {
  const { paymentMethodSets: sets, base } = params;
  const { _embedded, _links, ...props } = sets;

  const newFirstURL = new URL('./payment_presets', base);
  const firstURL = new URL(_links.first.href);
  newFirstURL.search = firstURL.search;

  const newLastURL = new URL('./payment_presets', base);
  const lastURL = new URL(_links.last.href);
  newLastURL.search = lastURL.search;

  const newPrevURL = new URL('./payment_presets', base);
  const prevURL = new URL(_links.prev.href);
  newPrevURL.search = prevURL.search;

  const newNextURL = new URL('./payment_presets', base);
  const nextURL = new URL(_links.next.href);
  newNextURL.search = nextURL.search;

  const newSelfURL = new URL('./payment_presets', base);
  const selfURL = new URL(_links.self.href);
  newSelfURL.search = selfURL.search;

  return {
    ...props,
    _links: {
      first: { href: newFirstURL.toString() },
      last: { href: newLastURL.toString() },
      prev: { href: newPrevURL.toString() },
      next: { href: newNextURL.toString() },
      self: { href: newSelfURL.toString() },
    },
    _embedded: {
      'fx:payment_presets': _embedded['fx:payment_method_sets'].map(set => {
        return composePaymentPreset({ paymentMethodSet: set, base });
      }),
    },
  };
}
