import './index';

import { generateStories } from '../../../utils/generate-stories';

const readonlyControls = [
  'address-name',
  'first-name',
  'last-name',
  'company',
  'phone',
  'address-line-one',
  'address-line-two',
  'country',
  'region',
  'city',
  'postal-code',
];

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    readonlyControls,
    disabledControls: [...readonlyControls, 'create', 'delete'],
    hiddenControls: [...readonlyControls, 'timestamps', 'create', 'delete'],
    parent: 'https://demo.foxycart.com/s/admin/customers/0/customer_addresses',
    title: 'Forms/AddressForm',
    href: 'https://demo.foxycart.com/s/admin/customer_addresses/0',
    tag: 'foxy-address-form',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
