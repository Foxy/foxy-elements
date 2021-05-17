import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    parent: '',
    title: 'Tables/CustomersTable',
    href: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    tag: 'foxy-customers-table',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
