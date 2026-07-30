import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data, ParsedDataRetention } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'data-retention-settings-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for editing a store's data retention settings.
 *
 * Data retention lives in the `data_retention` field of the `fx:store`
 * resource, so this form binds to a store and edits that nested object: an
 * auto-anonymization toggle and a "days of inactivity" value with a hard
 * 90-day minimum (enforced client-side and by the API).
 *
 * @element foxy-data-retention-settings-form
 * @since 1.52.0
 */
export class DataRetentionSettingsForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ data_retention: dr }) => {
        const v = dr?.auto_anonymize_days;
        return (
          v === null ||
          v === undefined ||
          (Number.isInteger(v) && v >= 90) ||
          'auto-anonymize-days:v8n_too_small'
        );
      },
      ({ data_retention: dr }) => {
        const v = dr?.auto_anonymize_days;
        return (
          !dr?.auto_anonymize ||
          (typeof v === 'number' && v >= 90) ||
          'auto-anonymize-days:v8n_required'
        );
      },
    ];
  }

  private readonly __getAutoAnonymize = (): boolean => {
    return this.__getDataRetention().auto_anonymize;
  };

  private readonly __setAutoAnonymize = (newValue: boolean): void => {
    this.edit({ data_retention: { ...this.__getDataRetention(), auto_anonymize: newValue } });
  };

  private readonly __getAutoAnonymizeDays = (): number | null => {
    return this.__getDataRetention().auto_anonymize_days;
  };

  private readonly __setAutoAnonymizeDays = (newValue: number): void => {
    this.edit({ data_retention: { ...this.__getDataRetention(), auto_anonymize_days: newValue } });
  };

  get hiddenSelector(): BooleanSelector {
    // No DELETE route (this edits a store field) and it carries no timestamps.
    const alwaysMatch = ['delete', 'timestamps', super.hiddenSelector.toString()];
    // The "days" field only applies when auto-anonymization is on.
    if (!this.form.data_retention?.auto_anonymize)
      alwaysMatch.unshift('general:auto-anonymize-days');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-summary-control infer="general">
        <foxy-internal-switch-control
          infer="auto-anonymize"
          layout="summary-item"
          .getValue=${this.__getAutoAnonymize}
          .setValue=${this.__setAutoAnonymize}
        >
        </foxy-internal-switch-control>

        <foxy-internal-number-control
          layout="summary-item"
          infer="auto-anonymize-days"
          min="90"
          step="1"
          .getValue=${this.__getAutoAnonymizeDays}
          .setValue=${this.__setAutoAnonymizeDays}
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  private __getDataRetention(): ParsedDataRetention {
    const dr = this.form.data_retention;
    return {
      auto_anonymize: dr?.auto_anonymize ?? false,
      auto_anonymize_days: dr?.auto_anonymize_days ?? null,
    };
  }
}
