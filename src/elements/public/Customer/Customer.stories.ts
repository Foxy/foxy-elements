import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.foxycart.com/s/admin/customers/0',
  parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
  nucleon: true,
  localName: 'foxy-customer',
  translatable: true,
  configurable: {
    sections: [
      'header',
      'header:actions',
      'header:actions:edit:form:timestamps',
      'default',
      'addresses',
      'addresses:actions',
      'addresses:list',
      'addresses:list:form:timestamps',
      'addresses:list:form:delete',
      'addresses:list:card:address-name',
      'addresses:list:card:full-name',
      'addresses:list:card:full-address',
      'addresses:list:card:company',
      'addresses:list:card:phone',
      'payment-methods',
      'payment-methods:list',
      'payment-methods:list:card:actions',
      'attributes',
      'attributes:actions',
      'attributes:list',
      'attributes:list:form:timestamps',
      'transactions',
      'transactions:table:default',
      'subscriptions',
      'subscriptions:form:header',
      'subscriptions:form:items',
      'subscriptions:form:items:actions',
      'subscriptions:form:end-date:form:warning',
      'subscriptions:form:transactions',
      'subscriptions:table:default',
    ],
    buttons: [
      'header:actions:edit',
      'header:actions:edit:form:delete',
      'addresses:actions:create',
      'addresses:actions:create:form:create',
      'addresses:list:form:delete',
      'addresses:list:card',
      'payment-methods:list:card:actions:delete',
      'attributes:actions:create',
      'attributes:actions:create:form:create',
      'attributes:list:form:delete',
      'attributes:list:card',
      'subscriptions:form:end-date:form:submit',
    ],
    inputs: [
      'header:actions:edit:form:first-name',
      'header:actions:edit:form:last-name',
      'header:actions:edit:form:email',
      'header:actions:edit:form:tax-id',
      'addresses:actions:create:form:address-name',
      'addresses:actions:create:form:first-name',
      'addresses:actions:create:form:last-name',
      'addresses:actions:create:form:company',
      'addresses:actions:create:form:phone',
      'addresses:actions:create:form:address-one',
      'addresses:actions:create:form:address-two',
      'addresses:actions:create:form:country',
      'addresses:actions:create:form:region',
      'addresses:actions:create:form:city',
      'addresses:actions:create:form:postal-code',
      'addresses:list:form:address-name',
      'addresses:list:form:first-name',
      'addresses:list:form:last-name',
      'addresses:list:form:company',
      'addresses:list:form:phone',
      'addresses:list:form:address-one',
      'addresses:list:form:address-two',
      'addresses:list:form:country',
      'addresses:list:form:region',
      'addresses:list:form:city',
      'addresses:list:form:postal-code',
      'addresses:list:card',
      'payment-methods:list:card',
      'attributes:actions:create:form:name',
      'attributes:actions:create:form:value',
      'attributes:actions:create:form:visibility',
      'attributes:list:form:name',
      'attributes:list:form:value',
      'attributes:list:form:visibility',
      'attributes:list:card',
      'subscriptions:form:end-date',
      'subscriptions:form:end-date:form:end-date',
      'subscriptions:form:next-transaction-date',
      'subscriptions:form:frequency',
    ],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Empty.args.href = '';
Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
