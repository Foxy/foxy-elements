import { Core } from '@foxy.io/sdk';

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
