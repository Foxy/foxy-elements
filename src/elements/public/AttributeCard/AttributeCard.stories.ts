import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    hiddenControls: ['name', 'value'],
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    title: 'Cards/AttributeCard',
    href: 'https://demo.foxycart.com/s/admin/customer_attributes/0',
    tag: 'foxy-attribute-card',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
