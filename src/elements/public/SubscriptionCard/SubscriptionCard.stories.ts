import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    parent: 'https://demo.foxycart.com/s/admin/stores/0/subscriptions',
    title: 'Cards/SubscriptionCard',
    href: 'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items',
    tag: 'foxy-subscription-card',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
