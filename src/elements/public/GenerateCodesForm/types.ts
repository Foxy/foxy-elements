import { GenerateCodesForm } from '.';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.GenerateCodes> & {
  /** Present only in the response. */
  _links: { self: { href: string } };
  /** Present only in the response. */
  message: string;
};

export type Templates = {
  'length:before'?: Renderer<GenerateCodesForm>;
  'length:after'?: Renderer<GenerateCodesForm>;
  'number-of-codes:before'?: Renderer<GenerateCodesForm>;
  'number-of-codes:after'?: Renderer<GenerateCodesForm>;
  'prefix:before'?: Renderer<GenerateCodesForm>;
  'prefix:after'?: Renderer<GenerateCodesForm>;
  'generate:before'?: Renderer<GenerateCodesForm>;
  'generate:after'?: Renderer<GenerateCodesForm>;
};
