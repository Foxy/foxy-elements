import { Resource } from '@foxy.io/sdk/core';
import { Renderer } from '../../../mixins/configurable';
import { AccessRecoveryForm } from './AccessRecoveryForm';

type Rel = {
  links: { self: Rel };
  props: {
    type: 'email';
    detail: { email: string };
  };
};

export type Data = Resource<Rel>;
export type Templates = {
  'email:before'?: Renderer<AccessRecoveryForm>;
  'email:after'?: Renderer<AccessRecoveryForm>;
  'message:before'?: Renderer<AccessRecoveryForm>;
  'message:after'?: Renderer<AccessRecoveryForm>;
  'submit:before'?: Renderer<AccessRecoveryForm>;
  'submit:after'?: Renderer<AccessRecoveryForm>;
};
