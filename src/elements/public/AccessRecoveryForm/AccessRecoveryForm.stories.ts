import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    disabledControls: ['email', 'submit'],
    readonlyControls: ['email', 'submit'],
    hiddenControls: ['email', 'message', 'submit'],
    parent: 'foxy://auth/recover',
    title: 'Forms/AddressRecoveryForm',
    href: '',
    tag: 'foxy-access-recovery-form',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
