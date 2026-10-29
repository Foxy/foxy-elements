import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  href: 'https://demo.api/hapi/payments/0',
  parent: 'https://demo.api/hapi/payments',
  nucleon: true,
  localName: 'foxy-payment-card',
  translatable: true,
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const AccessDenied = getStory(summary);
export const Busy = getStory(summary);
export const RestrictedScope = getStory({
  ...summary,
  ext: 'current-user-scope="transactions_read"',
});

const helpers = [
  'hosted-payment-gateways-helper="https://demo.api/hapi/property_helpers/1"',
  'payment-gateways-helper="https://demo.api/hapi/property_helpers/0"',
].join(' ');

export const WithGatewayHelpers = getStory({ ...summary, ext: helpers });
export const EmptyGatewayType = getStory({ ...summary, ext: helpers });

Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
AccessDenied.args.href = 'https://demo.api/virtual/denied';
Busy.args.href = 'https://demo.api/virtual/stall';
EmptyGatewayType.args.href = 'https://demo.api/hapi/payments/1';
