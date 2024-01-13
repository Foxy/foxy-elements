import type { ClientForm } from './ClientForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Client>;

export type Templates = {
  'client-id:before'?: Renderer<ClientForm>;
  'client-id:after'?: Renderer<ClientForm>;
  'client-secret:before'?: Renderer<ClientForm>;
  'client-secret:after'?: Renderer<ClientForm>;
  'redirect-uri:before'?: Renderer<ClientForm>;
  'redirect-uri:after'?: Renderer<ClientForm>;
  'project-name:before'?: Renderer<ClientForm>;
  'project-name:after'?: Renderer<ClientForm>;
  'project-description:before'?: Renderer<ClientForm>;
  'project-description:after'?: Renderer<ClientForm>;
  'company-name:before'?: Renderer<ClientForm>;
  'company-name:after'?: Renderer<ClientForm>;
  'company-url:before'?: Renderer<ClientForm>;
  'company-url:after'?: Renderer<ClientForm>;
  'company-logo:before'?: Renderer<ClientForm>;
  'company-logo:after'?: Renderer<ClientForm>;
  'contact-name:before'?: Renderer<ClientForm>;
  'contact-name:after'?: Renderer<ClientForm>;
  'contact-email:before'?: Renderer<ClientForm>;
  'contact-email:after'?: Renderer<ClientForm>;
  'contact-phone:before'?: Renderer<ClientForm>;
  'contact-phone:after'?: Renderer<ClientForm>;
  'timestamps:before'?: Renderer<ClientForm>;
  'timestamps:after'?: Renderer<ClientForm>;
  'create:before'?: Renderer<ClientForm>;
  'create:after'?: Renderer<ClientForm>;
  'delete:before'?: Renderer<ClientForm>;
  'delete:after'?: Renderer<ClientForm>;
};
