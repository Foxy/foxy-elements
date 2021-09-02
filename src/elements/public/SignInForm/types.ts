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
      mfa_remember_device?: boolean;
      mfa_secret_code?: string;
      mfa_totp_code?: string;
    };
  };
};

export type Data = Core.Resource<Rel>;
export type Templates = {
  'email:before'?: Renderer<SignInForm>;
  'email:after'?: Renderer<SignInForm>;
  'password:before'?: Renderer<SignInForm>;
  'password:after'?: Renderer<SignInForm>;
  'new-password:before'?: Renderer<SignInForm>;
  'new-password:after'?: Renderer<SignInForm>;
  'mfa-totp-code:before'?: Renderer<SignInForm>;
  'mfa-totp-code:after'?: Renderer<SignInForm>;
  'mfa-secret-code:before'?: Renderer<SignInForm>;
  'mfa-secret-code:after'?: Renderer<SignInForm>;
  'mfa-remember-device:before'?: Renderer<SignInForm>;
  'mfa-remember-device:after'?: Renderer<SignInForm>;
  'error:before'?: Renderer<SignInForm>;
  'error:after'?: Renderer<SignInForm>;
  'submit:before'?: Renderer<SignInForm>;
  'submit:after'?: Renderer<SignInForm>;
};
