import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  base: 'https://demo.api/portal/',
  localName: 'foxy-customer-portal',
  translatable: true,
  configurable: {
    sections: [
      'access-recovery:header',
      'access-recovery:form:message',
      'sign-in:header',
      'sign-in:form:error',
      'customer:header',
      'customer:header:actions',
      'customer:header:actions:edit:form:timestamps',
      'customer:default',
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
      'customer:transactions',
      'customer:transactions:table:default',
      'customer:transactions:header',
      'customer:transactions:list',
      'customer:subscriptions',
      'customer:subscriptions:header',
      'customer:subscriptions:list',
      'customer:subscriptions:list:card:default',
      'customer:subscriptions:list:form:header',
      'customer:subscriptions:list:form:header:actions',
      'customer:subscriptions:list:form:header:actions:update',
      'customer:subscriptions:list:form:header:actions:end',
      'customer:subscriptions:list:form:items',
      'customer:subscriptions:list:form:items:actions',
      'customer:subscriptions:list:form:items:actions:update',
      'customer:subscriptions:list:form:transactions',
    ],
    buttons: [
      'access-recovery:form:submit',
      'access-recovery:back',
      'sign-in:form:submit',
      'sign-in:recover',
      'customer:header:actions:edit',
      'customer:header:actions:edit:form:change-password',
      'customer:header:actions:sign-out',
      'customer:payment-methods:list:card:actions:update',
      'customer:payment-methods:list:card:actions:delete',
    ],
    inputs: [
      'access-recovery:form:email',
      'sign-in:form:email',
      'sign-in:form:password',
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
      'customer:subscriptions:list:form:next-transaction-date',
      'customer:subscriptions:list:form:frequency',
      'customer:payment-methods:list:card:actions:update:form:cc-token',
    ],
  },
};

const Meta = getMeta(summary);
(Meta.argTypes as any).lang.control.options = ['en', 'es', 'de', 'pl', 'zh-HK', 'se', 'nl', 'fr'];
export default Meta;

export const Playground = getStory({ ...summary, code: true });
export const EditableCard = getStory({
  ...summary,
  ext: 'embed-url="https://embed.foxy.io/v1?demo=default"',
});

export { AddingPagesGuideProfileDemo } from './demos/AddingPagesGuideProfileDemo';
export { AddingPagesGuideOrdersDemo } from './demos/AddingPagesGuideOrdersDemo';
export { DynamicContentGuideDemo } from './demos/DynamicContentGuideDemo';
