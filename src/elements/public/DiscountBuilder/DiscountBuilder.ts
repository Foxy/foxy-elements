import {
  DiscountType,
  ParsedValue,
  RulesTierParams,
  RulesTierSelectParams,
  RulesTierSwitchParams,
  RulesTierFieldParams,
} from './types';

import { html, LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { operatorGreaterThanOrEqual } from '../QueryBuilder/icons/operatorGreaterThanOrEqual';

const NS = 'discount-builder';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(InferrableMixin(LitElement), NS)));

/**
 * Visual builder for discount URL parameters in coupons and more.
 * Learn more about discounts here: [Foxy Wiki](https://wiki.foxycart.com/v/2.0/coupons_and_discounts).
 *
 * @element foxy-discount-builder
 * @since 1.17.0
 */
export class DiscountBuilder extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      value: { type: String },
    };
  }

  /**
   * Discount URL parameter.
   *
   * Note that if you set this value, it **must be encoded** for the
   * builder to work correctly. You can use either `encodeURIComponent` or `URLSearchParams` like so:
   *
   * ```ts
   * discountBuilder.value = new URLSearchParams([
   *   ['discount_amount_percentage', 'Test{allunits|1-2|3-4}']
   * ]).toString();
   * ```
   */
  value: string | null = null;

  get parsedValue(): ParsedValue {
    let details = '';
    let name = '';
    let type: DiscountType = 'quantity_amount';

    try {
      const [[key, value]] = Array.from(new URLSearchParams(this.value ?? '').entries());

      const parsedType = key.substring('discount_'.length);
      const allowedTypes = [
        'price_amount',
        'price_percentage',
        'quantity_amount',
        'quantity_percentage',
      ];

      if (allowedTypes.includes(parsedType)) {
        type = parsedType as DiscountType;
      }

      const detailsStart = value.indexOf('{');
      const detailsEnd = value.lastIndexOf('}');

      if (detailsStart !== -1 && detailsEnd !== -1) {
        details = value.substring(detailsStart + 1, detailsEnd);
        name = value.substring(0, detailsStart);
      }
    } catch {
      // ignore and use the defaults
    }

    if (name.length === 0) name = 'Discount';

    return { type, name, details };
  }

  set parsedValue({ name, type, details }: ParsedValue) {
    this.value = new URLSearchParams([[`discount_${type}`, `${name}{${details}}`]]).toString();
  }

  render(): TemplateResult {
    const details = this.parsedValue.details;
    const tiers = details.split('|').filter(v => !!v.trim());
    const method = (/[-+]/.test(tiers[0]) ? null : tiers.shift()) ?? 'single';
    const renderedTiers = method === 'repeat' ? [tiers[0]] : [...tiers, undefined];

    const type = this.parsedValue.type;
    const [source, units] = type.split('_');

    return html`
      <div class="space-y-s">
        ${repeat(renderedTiers, (tier, tierIndex) => {
          const onChange = (changedParams: Partial<RulesTierParams>) => {
            const newMethod = changedParams.method ?? method;
            const newSource = changedParams.source ?? source;
            const newUnits = changedParams.units ?? units;
            const newTier = changedParams.tier;
            const newTiers = [...tiers];

            if (newTier) {
              const newTierIndex = tier ? tierIndex : newTiers.length;
              const oldTiersCount = tier ? 1 : 0;
              newTiers.splice(newTierIndex, oldTiersCount, newTier);
            }

            this.parsedValue = {
              ...this.parsedValue,
              type: `${newSource}_${newUnits}` as DiscountType,
              details: `${newMethod}|${newTiers.join('|')}`,
            };

            this.dispatchEvent(new CustomEvent('change'));
          };

          const onDelete = () => {
            const newTiers = tiers.filter((_, i) => i !== tierIndex);
            const newDetails = `${method}|${newTiers.join('|')}`;

            this.parsedValue = { ...this.parsedValue, details: newDetails };
            this.dispatchEvent(new CustomEvent('change'));
          };

          return this.__renderTier({ source, method, units, tier, onChange, onDelete });
        })}
      </div>
    `;
  }

  private __renderSelect({ label, value, options, onChange }: RulesTierSelectParams) {
    const isInteractive = !this.disabled && !this.readonly;

    return html`
      <label
        class=${classMap({
          'h-xs whitespace-nowrap block ring-primary-50 rounded pl-s transition-colors': true,
          'hover-bg-primary hover-text-primary-contrast focus-within-ring-2': isInteractive,
          'bg-primary-10 text-primary': isInteractive,
          'bg-contrast-5 text-disabled': this.disabled,
          'bg-contrast-5 text-secondary': this.readonly && !this.disabled,
        })}
      >
        <foxy-i18n class="sr-only" infer="" key=${label}></foxy-i18n>

        <span class="relative leading-none font-medium flex items-center h-full">
          <span class="truncate">${this.t(options[value])}</span>
          <iron-icon class="icon-inline text-xl ml-xs" icon="icons:expand-more"></iron-icon>

          <select
            data-testclass="interactive editable"
            class="opacity-0 absolute inset-0 focus-outline-none"
            ?disabled=${!isInteractive}
            @change=${(evt: Event) => {
              const select = evt.currentTarget as HTMLSelectElement;
              onChange(select.options[select.selectedIndex].value);
            }}
          >
            ${Object.entries(options).map(([optionValue, optionKey]) => {
              return html`
                <option value=${optionValue} ?selected=${optionValue === value}>
                  ${this.t(optionKey)}
                </option>
              `;
            })}
          </select>
        </span>
      </label>
    `;
  }

  private __renderSwitch({ value, options, onChange }: RulesTierSwitchParams) {
    const isInteractive = !this.disabled && !this.readonly;
    const name = `switch-${Math.floor(Math.random() * Math.pow(10, 10))}`;
    const dotStyle = 'width: 0.4rem; height: 0.4rem';

    return html`
      <div
        class=${classMap({
          'h-xs px-xs space-x-xs flex items-center rounded-s transition-colors': true,
          'hover-bg-primary hover-text-primary-contrast focus-within-ring-2': isInteractive,
          'ring-primary-50 cursor-pointer bg-primary-10 text-primary': isInteractive,
          'bg-contrast-5 text-disabled': this.disabled,
          'bg-contrast-5 text-secondary': this.readonly && !this.disabled,
        })}
        @click=${(evt: Event) => {
          if (!isInteractive) return;

          const target = evt.currentTarget as HTMLDivElement;
          const firstInput = target.querySelector('input') as HTMLInputElement;

          firstInput.focus();
          onChange(value === 0 ? 1 : 0);
        }}
      >
        <div class="leading-none font-medium px-xs pointer-events-none">
          ${options.map((option, optionIndex) => {
            return html`
              <label>
                <foxy-i18n
                  class=${classMap({ 'sr-only': optionIndex !== value })}
                  infer=""
                  key=${option}
                >
                </foxy-i18n>

                <input
                  data-testclass="interactive editable"
                  class="sr-only"
                  value=${option}
                  name=${name}
                  type="radio"
                  ?disabled=${!isInteractive}
                  ?checked=${optionIndex === value}
                  @change=${(evt: Event) => {
                    const input = evt.currentTarget as HTMLInputElement;
                    if (input.checked) onChange(optionIndex);
                  }}
                />
              </label>
            `;
          })}
        </div>

        <div class="flex justify-evenly h-full ${value ? 'flex-col-reverse' : 'flex-col'}">
          <div style=${dotStyle} class="bg-current rounded-full"></div>
          <div style=${dotStyle} class="border border-current rounded-full"></div>
        </div>
      </div>
    `;
  }

  private __renderField({ value, label, onChange }: RulesTierFieldParams) {
    const isInteractive = !this.disabled && !this.readonly;

    return html`
      <label>
        <foxy-i18n class="sr-only" infer="" key=${label}></foxy-i18n>
        <input
          data-testclass="interactive editable"
          class=${classMap({
            'transition-colors border p-xs h-xs font-medium text-m rounded-s w-xl': true,
            'ring-primary-50 text-body bg-contrast-10': isInteractive,
            'hover-bg-contrast-20': isInteractive,
            'focus-outline-none focus-ring-2': isInteractive,
            'text-disabled bg-contrast-5': this.disabled,
            'text-secondary': this.readonly && !this.disabled,
            'border-transparent border-solid': !this.readonly,
            'border-dashed border-contrast-30': this.readonly,
          })}
          type="number"
          min="0"
          ?disabled=${!isInteractive}
          .value=${value}
          @input=${(evt: InputEvent) => {
            const input = evt.currentTarget as HTMLInputElement;
            onChange(input.value);
          }}
        />
      </label>
    `;
  }

  private __renderTier(params: RulesTierParams) {
    const tier = params.tier ?? '0-0';
    const sign = tier.includes('+') ? '+' : '-';
    const [from, adjustment] = tier.split(/[-+]/).map(v => parseFloat(v));

    return html`
      <div
        data-testclass="rules:tier"
        aria-label=${this.t('tier')}
        class=${classMap({
          'flex items-start justify-between rounded': true,
          'border border-contrast-10': true,
          'border-dashed': !params.tier,
        })}
      >
        <div
          class=${classMap({
            'transition-colors flex flex-wrap items-center gap-s p-s': true,
            'text-tertiary': !this.disabled,
            'text-disabled': this.disabled,
          })}
        >
          <foxy-i18n class="uppercase text-s font-semibold" infer="" key="tier_if"></foxy-i18n>

          ${this.__renderSwitch({
            options: ['total', 'quantity'],
            value: params.source === 'price' ? 0 : 1,
            onChange: i => params.onChange({ source: i ? 'quantity' : 'price' }),
          })}

          <div class="h-s w-s">${operatorGreaterThanOrEqual}</div>

          ${this.__renderField({
            label: 'from',
            value: String(from),
            onChange: v => params.onChange({ tier: `${v}${sign}${adjustment}` }),
          })}

          <foxy-i18n class="uppercase text-s font-semibold" infer="" key="tier_then"></foxy-i18n>

          ${this.__renderSwitch({
            options: ['reduce', 'increase'],
            value: sign === '-' ? 0 : 1,
            onChange: i => params.onChange({ tier: `${from}${i ? '+' : '-'}${adjustment}` }),
          })}

          <!---->

          ${this.__renderSelect({
            options: {
              incremental: 'tier_incremental',
              allunits: 'tier_allunits',
              repeat: 'tier_repeat',
              single: 'tier_single',
            },
            value: params.method,
            label: 'target',
            onChange: v => params.onChange({ method: v }),
          })}

          <foxy-i18n class="uppercase text-s font-semibold" infer="" key="tier_by"></foxy-i18n>

          ${this.__renderField({
            label: 'adjustment',
            value: String(adjustment),
            onChange: v => params.onChange({ tier: `${from}${sign}${v}` }),
          })}

          <!---->

          ${this.__renderSwitch({
            value: params.units === 'percentage' ? 0 : 1,
            options: ['%', '¤'],
            onChange: i => params.onChange({ units: i ? 'amount' : 'percentage' }),
          })}
        </div>

        ${params.tier
          ? html`
              <button
                data-testclass="interactive"
                aria-label=${this.t('delete')}
                class=${classMap({
                  'w-s h-s m-s flex-shrink-0 rounded-s transition-colors ring-primary-50': true,
                  'text-tertiary hover-text-secondary focus-outline-none focus-ring-2':
                    !this.disabled,
                  'text-disabled cursor-default': this.disabled,
                })}
                ?disabled=${this.disabled}
                ?hidden=${this.readonly}
                @click=${() => params.onDelete()}
              >
                <iron-icon icon="lumo:cross"></iron-icon>
              </button>
            `
          : ''}
      </div>
    `;
  }
}
