import '../../internal/InternalDemoCustomerApi/index';
import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  base: 'https://demo.foxycart.com/s/customer/',
  localName: 'foxy-customer-portal',
  translatable: true,
  configurable: {
    sections: [
      'access-recovery:header',
      'access-recovery:message',
      'sign-in:header',
      'sign-in:error',
      'customer:header',
      'customer:header:actions',
      'customer:header:actions:edit:form:timestamps',
      'customer:addresses',
      'customer:addresses:actions',
      'customer:addresses:list',
      'customer:addresses:list:form:timestamps',
      'customer:addresses:list:card:address-name',
      'customer:addresses:list:card:full-name',
      'customer:addresses:list:card:full-address',
      'customer:addresses:list:card:company',
      'customer:addresses:list:card:phone',
      'customer:payment-methods',
      'customer:payment-methods:list',
      'customer:payment-methods:list:card:actions',
      'customer:transactions',
      'customer:subscriptions',
      'customer:subscriptions:form:header',
      'customer:subscriptions:form:items',
      'customer:subscriptions:form:items:actions',
      'customer:subscriptions:form:transactions',
    ],
    buttons: [
      'access-recovery:submit',
      'access-recovery:back',
      'sign-in:submit',
      'sign-in:recover',
      'customer:header:actions:edit',
      'customer:header:actions:sign-out',
    ],
    inputs: [
      'access-recovery:email',
      'sign-in:email',
      'sign-in:password',
      'customer:header:actions:edit:form:first-name',
      'customer:header:actions:edit:form:last-name',
      'customer:header:actions:edit:form:email',
      'customer:header:actions:edit:form:tax-id',
      'customer:addresses:list:form:address-name',
      'customer:addresses:list:form:first-name',
      'customer:addresses:list:form:last-name',
      'customer:addresses:list:form:company',
      'customer:addresses:list:form:phone',
      'customer:addresses:list:form:address-one',
      'customer:addresses:list:form:address-two',
      'customer:addresses:list:form:country',
      'customer:addresses:list:form:region',
      'customer:addresses:list:form:city',
      'customer:addresses:list:form:postal-code',
      'customer:subscriptions:form:next-transaction-date',
      'customer:subscriptions:form:frequency',
    ],
  },
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
