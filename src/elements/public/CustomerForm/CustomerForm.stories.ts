import './index';

import { generateStories } from '../../../utils/generate-stories';

const readonlyControls = ['first-name', 'last-name', 'email', 'tax-id'];

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    readonlyControls,
    disabledControls: [...readonlyControls, 'create', 'delete'],
    hiddenControls: [...readonlyControls, 'timestamps', 'create', 'delete'],
    parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    title: 'Forms/CustomerForm',
    href: 'https://demo.foxycart.com/s/admin/customers/0',
    tag: 'foxy-customer-form',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
