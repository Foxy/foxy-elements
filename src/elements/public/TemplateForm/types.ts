import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';
import { TemplateForm } from './TemplateForm';

export type Data =
  | Resource<Rels.CartIncludeTemplate>
  | Resource<Rels.CheckoutTemplate>
  | Resource<Rels.CartTemplate>;

export type Templates = {
  'description:before'?: Renderer<TemplateForm>;
  'description:after'?: Renderer<TemplateForm>;
  'content:before'?: Renderer<TemplateForm>;
  'content:after'?: Renderer<TemplateForm>;
  'timestamps:before'?: Renderer<TemplateForm>;
  'timestamps:after'?: Renderer<TemplateForm>;
  'create:before'?: Renderer<TemplateForm>;
  'create:after'?: Renderer<TemplateForm>;
  'delete:before'?: Renderer<TemplateForm>;
  'delete:after'?: Renderer<TemplateForm>;
};
