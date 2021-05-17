import './index';

import { generateStories } from '../../../utils/generate-stories';

const { Meta, Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState } =
  generateStories({
    hiddenControls: ['actions', 'actions:delete'],
    parent: '',
    title: 'Cards/PaymentMethodCard',
    href: 'https://demo.foxycart.com/s/admin/customers/0/default_payment_method',
    tag: 'foxy-payment-method-card',
  });

export default Meta;
export { Playground, IdleSnapshotState, IdleTemplateState, BusyState, FailState };
