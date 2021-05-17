import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    disabledControls: ['email', 'password', 'submit'],
    readonlyControls: ['email', 'password', 'submit'],
    hiddenControls: ['email', 'password', 'error', 'submit'],
    parent: 'foxy://auth/session',
    title: 'Forms/SignInForm',
    href: '',
    tag: 'foxy-sign-in-form',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
