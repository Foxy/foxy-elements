import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    parent: '',
    title: 'Tables/SubscriptionsTable',
    href: 'https://demo.foxycart.com/s/admin/stores/0/subscriptions?customer_id=0&limit=10&zoom=last_transaction,transaction_template:items',
    tag: 'foxy-subscriptions-table',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
