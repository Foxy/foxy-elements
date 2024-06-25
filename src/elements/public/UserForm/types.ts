import type { UserForm } from './UserForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Rel = Rels.User;
export type Data = Resource<Rel>;
export type Templates = {
  'first-name:before'?: Renderer<UserForm>;
  'first-name:after'?: Renderer<UserForm>;
  'last-name:before'?: Renderer<UserForm>;
  'last-name:after'?: Renderer<UserForm>;
  'email:before'?: Renderer<UserForm>;
  'email:after'?: Renderer<UserForm>;
  'phone:before'?: Renderer<UserForm>;
  'phone:after'?: Renderer<UserForm>;
  'role:before'?: Renderer<UserForm>;
  'role:after'?: Renderer<UserForm>;
  'timestamps:before'?: Renderer<UserForm>;
  'timestamps:after'?: Renderer<UserForm>;
  'create:before'?: Renderer<UserForm>;
  'create:after'?: Renderer<UserForm>;
  'delete:before'?: Renderer<UserForm>;
  'delete:after'?: Renderer<UserForm>;
};
