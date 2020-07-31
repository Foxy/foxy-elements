import '../../private/icons';

interface NavigationItem {
  label: string;
}

interface NavigationTopItem {
  icon: string;
}

export interface NavigationLink extends NavigationItem {
  name: string;
}

export interface NavigationGroup<TChildren = NavigationLink> extends NavigationItem {
  children: TChildren[];
}

export interface NavigationTopLink extends NavigationLink, NavigationTopItem {
  slot?: 'top' | 'bottom';
  hide?: 'mobile';
}

export interface NavigationTopGroup
  extends NavigationGroup<NavigationLink | NavigationGroup>,
    NavigationTopItem {}

export type Navigation = Array<NavigationTopGroup | NavigationTopLink>;

export const navigation: Navigation = [
  {
    icon: 'foxy:dashboard',
    label: 'nav.dashboard',
    name: 'dashboard',
  },
  {
    icon: 'foxy:management',
    label: 'nav.management',
    children: [
      { label: 'nav.transactions', name: 'transactions' },
      { label: 'nav.subscriptions', name: 'subscriptions' },
      { label: 'nav.customers', name: 'customers' },
      { label: 'nav.coupons', name: 'coupons' },
      { label: 'nav.products', name: 'products' },
      { label: 'nav.reports', name: 'reports' },
    ],
  },
  {
    icon: 'foxy:settings',
    label: 'nav.settings',
    children: [
      {
        label: 'nav.elements',
        children: [
          { label: 'nav.cart', name: 'cart-settings' },
          { label: 'nav.checkout', name: 'checkout-settings' },
          { label: 'nav.receipt', name: 'receipt-settings' },
          { label: 'nav.customer_portal', name: 'customer-portal-settings' },
        ],
      },
      {
        label: 'nav.inventory',
        children: [
          { label: 'nav.products', name: 'products-settings' },
          { label: 'nav.payments', name: 'payments-settings' },
          { label: 'nav.shipping', name: 'shipping-settings' },
          { label: 'nav.taxes', name: 'taxes-settings' },
        ],
      },
      {
        label: 'nav.other',
        children: [
          { label: 'nav.emails', name: 'emails-settings' },
          { label: 'nav.integrations', name: 'integrations-settings' },
        ],
      },
    ],
  },
  {
    icon: 'foxy:billing',
    label: 'nav.billing',
    name: 'billing',
  },
  {
    slot: 'bottom',
    icon: 'foxy:profile',
    label: 'nav.profile',
    name: 'profile',
  },
  {
    slot: 'bottom',
    hide: 'mobile',
    icon: 'foxy:signout',
    label: 'nav.signout',
    name: 'signout',
  },
];
