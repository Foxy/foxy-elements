import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  parent: 'https://demo.api/hapi/native_integrations/',
  href: 'https://demo.api/hapi/native_integrations/0',
  nucleon: true,
  localName: 'foxy-native-integration-card',
  translatable: true,
};

export default getMeta(summary);

export const Playground = getStory({ ...summary, code: true });
export const Legacy = getStory(summary);
export const Empty = getStory(summary);
export const Error = getStory(summary);
export const Busy = getStory(summary);

Legacy.args.href = 'https://demo.api/hapi/native_integrations/1';
Empty.args.href = '';
Error.args.href = 'https://demo.api/virtual/empty?status=404';
Busy.args.href = 'https://demo.api/virtual/stall';
