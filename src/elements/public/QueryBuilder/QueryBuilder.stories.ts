import './index';

import { TemplateResult, html } from 'lit-html';

import { Summary } from '../../../storygen/Summary';
import { Type } from './types';
import { getMeta } from '../../../storygen/getMeta';

const summary: Summary = {
  localName: 'foxy-query-builder',
  translatable: true,
};

const options = JSON.stringify([
  {
    type: Type.Attribute,
    path: 'attributes',
    label: '',
  },
  {
    type: Type.Number,
    path: 'total_order',
    label: '',
  },
  {
    label: '',
    type: Type.Boolean,
    path: 'data_is_fed',
    list: [
      { label: 'webhooks_fed', value: 'true' },
      { label: 'webhooks_not_fed', value: 'false' },
    ],
  },
  {
    type: Type.Date,
    path: 'transaction_date',
    label: 'transaction_date',
  },
  {
    type: Type.String,
    path: 'status',
    label: 'status',
    list: [
      { label: 'transaction_authorized', value: 'authorized' },
      { label: 'transaction_approved', value: 'approved' },
      { label: 'transaction_pending', value: 'pending' },
    ],
  },
]);

export default getMeta(summary);

export const Playground = (): TemplateResult => html`
  <foxy-query-builder
    options=${options}
    value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Capproved&data_is_fed=false"
  >
  </foxy-query-builder>
`;

export const Empty = (): TemplateResult => html`<foxy-query-builder></foxy-query-builder>`;
