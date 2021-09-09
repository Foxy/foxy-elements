import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const base = new URL('https://demo.foxycart.com/s/virtual/session');
const summary: Summary = {
  parent: base.toString(),
  nucleon: true,
  localName: 'foxy-sign-in-form',
  translatable: true,
  configurable: {
    sections: ['error', 'mfa-secret-code'],
    buttons: ['submit', 'mfa-remember-device'],
    inputs: ['email', 'password', 'new-password', 'mfa-totp-code'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const CredentialError = getStory(summary);
export const NewPasswordRequiredError = getStory(summary);
export const NewPasswordFormatError = getStory(summary);
export const MfaSetup = getStory(summary);
export const MfaTotpCode = getStory(summary);
export const MfaTotpCodeInvalidError = getStory(summary);
export const UnknownError = getStory(summary);

CredentialError.args.parent = String(new URL('./session?code=invalid_credential_error', base));

NewPasswordRequiredError.args.parent = String(
  new URL('./session?code=new_password_required_error', base)
);

NewPasswordFormatError.args.parent = String(
  new URL('./session?code=new_password_format_error', base)
);

MfaSetup.args.parent = String(
  new URL('./session?code=mfa_required W4GYNEMLQDQYLQQZKFDXIYKCXZ2EDX2OPPH5ZHHQUJW2ER645J4A', base)
);

MfaTotpCode.args.parent = String(new URL('./session?code=mfa_totp_code_required', base));

MfaTotpCodeInvalidError.args.parent = String(
  new URL('./session?code=mfa_totp_code_invalid_error', base)
);

UnknownError.args.parent = 'https://demo.foxycart.com/s/admin/not-found';
