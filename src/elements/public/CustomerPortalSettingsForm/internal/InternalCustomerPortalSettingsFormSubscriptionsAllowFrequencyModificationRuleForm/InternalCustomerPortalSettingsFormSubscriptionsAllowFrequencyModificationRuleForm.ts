import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../../../NucleonElement/types';
import type { Item } from '../../../../internal/InternalEditableListControl/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { parseFrequency } from '../../../../../utils/parse-frequency';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const Base = TranslatableMixin(InternalForm);

export class InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ jsonataQuery: v }) => !!v || 'jsonata-query:v8n_required',
      ({ jsonataQuery: v }) => !v || v.length <= 200 || 'jsonata-query:v8n_too_long',
      ({ values: v }) => (!!v && v.length > 0) || 'values:v8n_required',
      ({ values: v }) => !v || v.length <= 20 || 'values:v8n_too_long',
    ];
  }

  private readonly __valuesInputParams = { type: 'number', step: '1', min: '1', max: '999' };

  private readonly __valuesGetValue = () => {
    return this.form.values?.map(value => {
      if (value === '.5m') return { value, label: this.t('values.twice_a_week') };
      const { units, count } = parseFrequency(value);
      return { value, label: this.t(`values.${units}`, { count }) };
    });
  };

  private readonly __valuesSetValue = (newValue: Item[]) => {
    const newValues = newValue
      .filter(({ value }) => parseFloat(value) <= 999)
      .map(({ unit, value }) => (unit ? `${value}${unit}` : value))
      .filter((v, i, a) => a.indexOf(v) === i);

    this.edit({ values: newValues });
  };

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`timestamps ${super.hiddenSelector}`.trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-source-control infer="jsonata-query" property="jsonataQuery">
      </foxy-internal-source-control>

      <foxy-internal-editable-list-control
        infer="values"
        .inputParams=${this.__valuesInputParams}
        .getValue=${this.__valuesGetValue}
        .setValue=${this.__valuesSetValue}
        .units=${[
          { label: this.t('values.unit_years'), value: 'y' },
          { label: this.t('values.unit_months'), value: 'm' },
          { label: this.t('values.unit_weeks'), value: 'w' },
          { label: this.t('values.unit_days'), value: 'd' },
        ]}
      >
      </foxy-internal-editable-list-control>

      ${super.renderBody()}
    `;
  }
}
