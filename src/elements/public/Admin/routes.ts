import { Route } from '@vaadin/router';

const TODO = 'x-not-implemented';

/** Values as such are overwritten in admin contructor with a scoped element name. */
const SCOPED_IN_ADMIN = 'x-not-implemented';

export const routes: Route[] = [
  {
    path: '/',
    name: 'dashboard',
    component: SCOPED_IN_ADMIN,
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
    action: (): Promise<void> => import('../CustomerPortalSettings/index').then(() => void 0),
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
    path: '/sign-out',
    name: 'sign-out',
    component: SCOPED_IN_ADMIN,
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SCOPED_IN_ADMIN,
  },
  {
    path: '(.*)',
    component: TODO,
  },
];
