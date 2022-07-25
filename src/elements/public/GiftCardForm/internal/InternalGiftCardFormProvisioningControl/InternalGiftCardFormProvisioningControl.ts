import type { TemplateResult } from 'lit-html';
import type { Option } from '../../../../internal/InternalCheckboxGroupControl/types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ResponsiveMixin } from '../../../../../mixins/responsive';
import { html } from 'lit-html';

export class InternalGiftCardFormProvisioningControl extends ResponsiveMixin(InternalControl) {
  private __maxBalanceValueGetter = () => {
    return this.nucleon?.form.provisioning_config?.initial_balance_max;
  };

  private __maxBalanceValueSetter = (newMax: number) => {
    const newMin = this.nucleon?.form.provisioning_config?.initial_balance_min ?? newMax;

    this.nucleon?.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: newMin > newMax ? newMax : newMin,
        initial_balance_max: newMax,
      },
    });
  };

  private __minBalanceValueGetter = () => {
    return this.nucleon?.form.provisioning_config?.initial_balance_min;
  };

  private __minBalanceValueSetter = (newMin: number) => {
    const newMax = this.nucleon?.form.provisioning_config?.initial_balance_max ?? newMin;

    this.nucleon?.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: newMin,
        initial_balance_max: newMax < newMin ? newMin : newMax,
      },
    });
  };

  private __toggleValueGetter = () => {
    return this.nucleon?.form.provisioning_config?.allow_autoprovisioning ? ['allow'] : [];
  };

  private __toggleValueSetter = (newValue: string[]) => {
    if (newValue.includes('allow')) {
      this.nucleon?.edit({
        provisioning_config: {
          allow_autoprovisioning: true,
          initial_balance_min: this.nucleon?.form.provisioning_config?.initial_balance_min ?? 0,
          initial_balance_max: this.nucleon?.form.provisioning_config?.initial_balance_max ?? 0,
        },
      });
    } else {
      this.nucleon?.edit({ provisioning_config: null });
    }
  };

  private __toggleOptions: Option[] = [{ label: 'text', value: 'allow' }];

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-checkbox-group-control
        infer="toggle"
        .getValue=${this.__toggleValueGetter}
        .setValue=${this.__toggleValueSetter}
        .options=${this.__toggleOptions}
      >
      </foxy-internal-checkbox-group-control>

      ${this.nucleon?.form.provisioning_config?.allow_autoprovisioning
        ? html`
            <div class="grid grid-cols-2 sm-grid-cols-4 gap-m mt-s">
              <foxy-internal-text-control infer="sku" class="col-span-2">
              </foxy-internal-text-control>

              <foxy-internal-integer-control
                infer="min-balance"
                .getValue=${this.__minBalanceValueGetter}
                .setValue=${this.__minBalanceValueSetter}
              >
              </foxy-internal-integer-control>

              <foxy-internal-integer-control
                infer="max-balance"
                .getValue=${this.__maxBalanceValueGetter}
                .setValue=${this.__maxBalanceValueSetter}
              >
              </foxy-internal-integer-control>
            </div>
          `
        : ''}
    `;
  }
}
