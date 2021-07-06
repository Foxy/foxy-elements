import { Core } from '@foxy.io/sdk';
import { Renderer } from '../../../mixins/configurable';
import { SignInForm } from './SignInForm';

export type Rel = {
  links: { self: Rel };
  props: {
    type: 'password';
    credential: {
      email: string;
      password: string;
      new_password?: string;
    };
  };
};

export type Data = Core.Resource<Rel>;
export type Templates = {
  'email:before'?: Renderer<SignInForm>;
  'email:after'?: Renderer<SignInForm>;
  'password:before'?: Renderer<SignInForm>;
  'password:after'?: Renderer<SignInForm>;
  'error:before'?: Renderer<SignInForm>;
  'error:after'?: Renderer<SignInForm>;
  'submit:before'?: Renderer<SignInForm>;
  'submit:after'?: Renderer<SignInForm>;
};
