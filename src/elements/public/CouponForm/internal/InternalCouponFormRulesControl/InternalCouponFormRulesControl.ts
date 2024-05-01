import type { DiscountBuilder } from '../../../DiscountBuilder/DiscountBuilder';
import type { TemplateResult } from 'lit-html';
import type { CouponForm } from '../../CouponForm';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { classMap } from '../../../../../utils/class-map';
import { html } from 'lit-html';

export class InternalCouponFormRulesControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    const nucleon = this.nucleon as CouponForm | null;
    const details = nucleon?.form.coupon_discount_details ?? '';
    const type = nucleon?.form.coupon_discount_type ?? 'quantity_amount';
    const helperText = this.helperText;
    const description = this.__renderRulesDescription();
    const errorMessage = this._errorMessage;

    return html`
      <section>
        <p class="leading-xs flex items-center justify-between space-x-m text-s mb-xs">
          <span
            class=${classMap({
              'transition-colors font-medium flex-1': true,
              'text-secondary': !this.disabled,
              'text-disabled': this.disabled,
            })}
          >
            ${this.label}
          </span>
          <span class="min-w-0">${this.__renderPreset()}</span>
        </p>

        <foxy-discount-builder
          infer="discount-builder"
          .parsedValue=${{ details, type, name: 'Rules' }}
          @change=${(evt: CustomEvent) => {
            const builder = evt.currentTarget as DiscountBuilder;
            const newParsedValue = builder.parsedValue;
            const nucleon = this.nucleon as CouponForm | null;

            nucleon?.edit({
              coupon_discount_details: newParsedValue.details,
              coupon_discount_type: newParsedValue.type,
            });
          }}
        >
        </foxy-discount-builder>

        ${helperText || description
          ? html`
              <p
                class=${classMap({
                  'text-xs mt-xs leading-xs transition-colors': true,
                  'text-secondary': !this.disabled && !this.readonly,
                  'text-disabled': this.disabled,
                  'text-body': this.readonly,
                })}
              >
                ${description || helperText}
              </p>
            `
          : ''}
        ${errorMessage && !this.disabled && !this.readonly
          ? html`<p class="mt-xs text-xs leading-xs text-error">${this._errorMessage}</p>`
          : ''}
      </section>
    `;
  }

  private __renderRulesDescription() {
    const nucleon = this.nucleon as CouponForm | null;
    const type = nucleon?.form.coupon_discount_type ?? 'quantity_amount';
    const details = nucleon?.form.coupon_discount_details ?? '';

    if (!details) return null;
    return this.t('discount_summary', { params: { details, type, ns: this.ns } });
  }

  private __renderPreset() {
    const nucleon = this.nucleon as CouponForm | null;
    const details = nucleon?.form.coupon_discount_details;
    const type = nucleon?.form.coupon_discount_type;

    const presets = [
      { type: 'quantity_amount', details: 'allunits|2-2' },
      { type: 'quantity_percentage', details: 'allunits|5-10|10-20' },
      { type: 'quantity_amount', details: 'incremental|3-5' },
      { type: 'quantity_percentage', details: 'incremental|11-10|51-15|101-20' },
      { type: 'quantity_percentage', details: 'repeat|2-100' },
      { type: 'quantity_percentage', details: 'repeat|4-50' },
      { type: 'quantity_amount', details: 'single|5-10' },
      { type: 'price_percentage', details: 'single|99.99-10' },
    ] as const;

    const selectedPreset = presets.find(p => p.details === details && p.type === type);

    return html`
      <label
        data-testid="rules:preset"
        class=${classMap({
          'whitespace-nowrap block ring-primary-50 rounded px-xs -mx-xs transition-colors': true,
          'text-body hover-text-primary focus-within-ring-2': !this.disabled && !this.readonly,
          'text-secondary': this.readonly,
          'text-disabled': this.disabled,
        })}
      >
        <foxy-i18n class="sr-only" infer="" key="preset"></foxy-i18n>

        <span class="relative font-medium flex items-center">
          <span class="truncate">
            ${selectedPreset
              ? this.t('discount_summary', { params: { ...selectedPreset, ns: this.ns } })
              : this.t('custom_discount')}
          </span>

          <iron-icon class="icon-inline text-xl ml-xs -mr-xs" icon="icons:expand-more"></iron-icon>

          <select
            data-testclass="interactive editable"
            data-testid="rules:preset:select"
            class="opacity-0 absolute inset-0 focus-outline-none"
            ?disabled=${this.disabled || this.readonly}
            @change=${(evt: Event) => {
              const select = evt.currentTarget as HTMLSelectElement;
              const preset = presets[select.selectedIndex];
              const nucleon = this.nucleon as CouponForm | null;

              nucleon?.edit({
                coupon_discount_details: preset?.details ?? '',
                coupon_discount_type: preset?.type ?? 'quantity_amount',
              });
            }}
          >
            ${presets.map(option => {
              return html`
                <option value=${option.details} ?selected=${option === selectedPreset}>
                  ${this.t('discount_summary', { params: { ...option, ns: this.ns } })}
                </option>
              `;
            })}

            <option value="custom" ?selected=${!selectedPreset && !!details && !!type}>
              ${this.t('custom_discount')}
            </option>
          </select>
        </span>
      </label>
    `;
  }
}
