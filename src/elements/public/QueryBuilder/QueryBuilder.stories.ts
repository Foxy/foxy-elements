import './index';

import { TemplateResult, html } from 'lit-html';

import { Summary } from '../../../storygen/Summary';
import { Type } from './types';
import { getMeta } from '../../../storygen/getMeta';

const summary: Summary = {
  localName: 'foxy-query-builder',
  translatable: true,
};

export default getMeta(summary);

const options = JSON.stringify([
  { type: Type.Attribute, path: 'attributes', key: '' },
  { type: Type.Date, path: 'transaction_date', key: 'transaction_date' },
  {
    type: Type.String,
    path: 'status',
    key: 'status',
    list: [
      { key: 'transaction_authorized', value: 'authorized' },
      { key: 'transaction_approved', value: 'approved' },
      { key: 'transaction_pending', value: 'pending' },
    ],
  },
]);

export const Playground = (): TemplateResult => html`
  <foxy-query-builder
    options=${options}
    value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Cdeclined&total_order%3Anot=20"
  >
  </foxy-query-builder>
`;
