import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    parent: '',
    title: 'Tables/TransactionsTable',
    href: 'https://demo.foxycart.com/s/admin/stores/0/transactions?customer_id=0&limit=10&zoom=items',
    tag: 'foxy-transactions-table',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
