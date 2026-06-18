import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'data-retention-settings-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for editing `fx:data_retention_settings` resources.
 *
 * Per-store auto-anonymization config: a toggle and a "days of inactivity"
 * value with a hard 90-day minimum (enforced client-side and by the API).
 *
 * @element foxy-data-retention-settings-form
 * @since 1.52.0
 */
export class DataRetentionSettingsForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ auto_anonymize_days: v }) => {
        return (
          v === null ||
          v === undefined ||
          (Number.isInteger(v) && v >= 90) ||
          'auto-anonymize-days:v8n_too_small'
        );
      },
      ({ auto_anonymize: enabled, auto_anonymize_days: v }) => {
        return !enabled || (typeof v === 'number' && v >= 90) || 'auto-anonymize-days:v8n_required';
      },
    ];
  }

  get hiddenSelector(): BooleanSelector {
    // No DELETE route for this resource, and it carries no timestamps.
    const alwaysMatch = ['delete', 'timestamps', super.hiddenSelector.toString()];
    // The "days" field only applies when auto-anonymization is on.
    if (!this.form.auto_anonymize) alwaysMatch.unshift('general:auto-anonymize-days');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-summary-control infer="general">
        <foxy-internal-switch-control infer="auto-anonymize" layout="summary-item">
        </foxy-internal-switch-control>

        <foxy-internal-number-control
          layout="summary-item"
          infer="auto-anonymize-days"
          min="90"
          step="1"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
