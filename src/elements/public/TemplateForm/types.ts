import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data =
  | Resource<Rels.CartIncludeTemplate>
  | Resource<Rels.CheckoutTemplate>
  | Resource<Rels.CartTemplate>;
