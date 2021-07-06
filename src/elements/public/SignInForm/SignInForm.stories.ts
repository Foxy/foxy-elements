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
    sections: ['error'],
    buttons: ['submit'],
    inputs: ['email', 'password', 'new-password'],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const CredentialError = getStory(summary);
export const NewPasswordRequiredError = getStory(summary);
export const NewPasswordFormatError = getStory(summary);
export const UnknownError = getStory(summary);

CredentialError.args.parent = String(new URL('./session?code=invalid_credential_error', base));

NewPasswordRequiredError.args.parent = String(
  new URL('./session?code=new_password_required_error', base)
);

NewPasswordFormatError.args.parent = String(
  new URL('./session?code=new_password_format_error', base)
);

UnknownError.args.parent = 'https://demo.foxycart.com/s/admin/not-found';
