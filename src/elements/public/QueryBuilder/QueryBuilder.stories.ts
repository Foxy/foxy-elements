import { TemplateResult, html } from 'lit-html';
import { QueryBuilder } from './index';
import { getMeta } from '../../../storygen/getMeta';
import { Summary } from '../../../storygen/Summary';
import { Type } from './types';

const demoLocalName = 'demo-query-builder';
if (!customElements.get(demoLocalName)) {
  customElements.define(demoLocalName, class extends QueryBuilder {});
}

const summary: Summary = {
  localName: demoLocalName,
  translatable: true,
  configurable: {},
};

const options = JSON.stringify([
  { type: Type.Attribute, path: 'attributes', label: 'option_attributes' },
  { type: Type.Number, path: 'total_order', label: 'option_total_order' },
  { label: 'option_data_is_fed', type: Type.Boolean, path: 'data_is_fed' },
  { label: 'option_transaction_date', type: Type.Date, path: 'transaction_date' },
  {
    label: 'option_status',
    type: Type.String,
    path: 'status',
    list: [
      { rawLabel: 'Authorized', value: 'authorized' },
      { rawLabel: 'Approved', value: 'approved' },
      { rawLabel: 'Pending', value: 'pending' },
    ],
  },
]);

export default getMeta(summary);

export const Playground = (): TemplateResult => html`
  <foxy-query-builder
    options=${options}
    value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Capproved&data_is_fed=false"
    ns="demo query-builder"
  >
  </foxy-query-builder>
`;

export const Disabled = (): TemplateResult => html`
  <foxy-query-builder
    options=${options}
    value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Capproved&data_is_fed=false"
    ns="demo query-builder"
    disabled
  >
  </foxy-query-builder>
`;

export const Readonly = (): TemplateResult => html`
  <foxy-query-builder
    options=${options}
    value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Capproved&data_is_fed=false"
    ns="demo query-builder"
    readonly
  >
  </foxy-query-builder>
`;

export const Empty = (): TemplateResult => {
  return html`<foxy-query-builder options=${options} ns="demo query-builder"></foxy-query-builder>`;
};
