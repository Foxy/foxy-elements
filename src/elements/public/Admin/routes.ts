import { Router } from '@vaadin/router';

const TODO = 'x-not-implemented';

export const routes: Parameters<Router['setRoutes']>[0] = [
  {
    path: '/',
    name: 'dashboard',
    component: TODO,
  },
  {
    path: '/management/transactions',
    name: 'transactions',
    component: TODO,
  },
  {
    path: '/management/subscriptions',
    name: 'subscriptions',
    component: TODO,
  },
  {
    path: '/management/customers',
    name: 'customers',
    component: TODO,
  },
  {
    path: '/management/coupons',
    name: 'coupons',
    component: TODO,
  },
  {
    path: '/management/products',
    name: 'products',
    component: TODO,
  },
  {
    path: '/management/reports',
    name: 'reports',
    component: TODO,
  },
  {
    path: '/settings/general',
    name: 'general-settings',
    component: TODO,
  },
  {
    path: '/settings/cart',
    name: 'cart-settings',
    component: TODO,
  },
  {
    path: '/settings/checkout',
    name: 'checkout-settings',
    component: TODO,
  },
  {
    name: 'customer-portal-settings',
    path: '/settings/customer-portal',
    action: () => import('../CustomerPortalSettings/index').then(() => void 0),
    component: 'foxy-customer-portal-settings',
  },
  {
    path: '/settings/products',
    name: 'products-settings',
    component: TODO,
  },
  {
    path: '/settings/shipping',
    name: 'shipping-settings',
    component: TODO,
  },
  {
    path: '/settings/taxes',
    name: 'taxes-settings',
    component: TODO,
  },
  {
    path: '/settings/payments',
    name: 'payments-settings',
    component: TODO,
  },
  {
    path: '/settings/receipt',
    name: 'receipt-settings',
    component: TODO,
  },
  {
    path: '/settings/emails',
    name: 'emails-settings',
    component: TODO,
  },
  {
    path: '/settings/integrations',
    name: 'integrations-settings',
    component: TODO,
  },
  {
    path: '/billing',
    name: 'billing',
    component: TODO,
  },
  {
    path: '/profile',
    name: 'profile',
    component: TODO,
  },
  {
    path: '(.*)',
    component: TODO,
  },
];
