import type { TemplateSetForm } from './TemplateSetForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.TemplateSet>;

export type Templates = {
  'description:before'?: Renderer<TemplateSetForm>;
  'description:after'?: Renderer<TemplateSetForm>;
  'code:before'?: Renderer<TemplateSetForm>;
  'code:after'?: Renderer<TemplateSetForm>;
  'language:before'?: Renderer<TemplateSetForm>;
  'language:after'?: Renderer<TemplateSetForm>;
  'locale-code:before'?: Renderer<TemplateSetForm>;
  'locale-code:after'?: Renderer<TemplateSetForm>;
  'payment-method-set-uri:before'?: Renderer<TemplateSetForm>;
  'payment-method-set-uri:after'?: Renderer<TemplateSetForm>;
  'language-overrides:before'?: Renderer<TemplateSetForm>;
  'language-overrides:after'?: Renderer<TemplateSetForm>;
  'timestamps:before'?: Renderer<TemplateSetForm>;
  'timestamps:after'?: Renderer<TemplateSetForm>;
  'create:before'?: Renderer<TemplateSetForm>;
  'create:after'?: Renderer<TemplateSetForm>;
  'delete:before'?: Renderer<TemplateSetForm>;
  'delete:after'?: Renderer<TemplateSetForm>;
};
