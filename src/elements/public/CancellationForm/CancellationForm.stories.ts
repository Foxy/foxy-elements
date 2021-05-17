import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    readonlyControls: ['end-date'],
    disabledControls: ['end-date', 'submit'],
    hiddenControls: ['warning', 'end-date', 'submit'],
    parent: 'https://demo.foxycart.com/s/admin/stores/0/subscriptions',
    title: 'Forms/CancellationForm',
    href: 'https://demo.foxycart.com/s/admin/subscriptions/0',
    tag: 'foxy-cancellation-form',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
