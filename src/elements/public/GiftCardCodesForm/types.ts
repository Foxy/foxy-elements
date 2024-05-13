import { GiftCardCodesForm } from './GiftCardCodesForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.GiftCardCodesImport> & { _links: { self: { href: string } } };

export type Templates = {
  'gift-card-codes:before'?: Renderer<GiftCardCodesForm>;
  'gift-card-codes:after'?: Renderer<GiftCardCodesForm>;
  'current-balance:before'?: Renderer<GiftCardCodesForm>;
  'current-balance:after'?: Renderer<GiftCardCodesForm>;
  'create:before'?: Renderer<GiftCardCodesForm>;
  'create:after'?: Renderer<GiftCardCodesForm>;
};
