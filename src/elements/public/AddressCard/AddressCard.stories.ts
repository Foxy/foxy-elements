import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    hiddenControls: ['address-name', 'full-name', 'full-address', 'company', 'phone'],
    parent: 'https://demo.foxycart.com/s/admin/customers/0/customer_addresses',
    title: 'Cards/AddressCard',
    href: 'https://demo.foxycart.com/s/admin/customer_addresses/0',
    tag: 'foxy-address-card',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
