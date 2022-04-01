import { GiftCardCodesForm } from './GiftCardCodesForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.GiftCardCodesImport> & { _links: { self: { href: string } } };

export type Templates = {
  'codes:before'?: Renderer<GiftCardCodesForm>;
  'codes:after'?: Renderer<GiftCardCodesForm>;
  'import:before'?: Renderer<GiftCardCodesForm>;
  'import:after'?: Renderer<GiftCardCodesForm>;
};
