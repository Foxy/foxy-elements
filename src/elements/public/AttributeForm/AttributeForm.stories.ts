import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    readonlyControls: ['name', 'value', 'visibility'],
    disabledControls: ['name', 'value', 'visibility', 'create', 'delete'],
    hiddenControls: ['name', 'value', 'visibility', 'timestamps', 'create', 'delete'],
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    title: 'Forms/AttributeForm',
    href: 'https://demo.foxycart.com/s/admin/customer_attributes/0',
    tag: 'foxy-attribute-form',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
