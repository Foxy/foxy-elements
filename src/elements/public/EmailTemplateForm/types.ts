import { EmailTemplateForm } from './EmailTemplateForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.EmailTemplate>;

export type Templates = {
  'description:before'?: Renderer<EmailTemplateForm>;
  'description:after'?: Renderer<EmailTemplateForm>;
  'content:before'?: Renderer<EmailTemplateForm>;
  'content:after'?: Renderer<EmailTemplateForm>;
  'timestamps:before'?: Renderer<EmailTemplateForm>;
  'timestamps:after'?: Renderer<EmailTemplateForm>;
  'create:before'?: Renderer<EmailTemplateForm>;
  'create:after'?: Renderer<EmailTemplateForm>;
  'delete:before'?: Renderer<EmailTemplateForm>;
  'delete:after'?: Renderer<EmailTemplateForm>;
};
