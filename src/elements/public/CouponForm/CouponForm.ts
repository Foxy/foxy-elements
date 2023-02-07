import {
  Data,
  RulesTierFieldParams,
  RulesTierParams,
  RulesTierSelectParams,
  RulesTierSwitchParams,
} from './types';
import { Option, Type } from '../QueryBuilder/types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CategoryRestrictionsPage } from './private/CategoryRestrictionsPage';
import { Checkbox } from '../../private/Checkbox/Checkbox';
import { CheckboxChangeEvent } from '../../private/Checkbox/CheckboxChangeEvent';
import { Column } from '../Table/types';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { EditableList } from '../../private/EditableList/EditableList';
import { FormDialog } from '../FormDialog';
import { Group } from '../../private/Group/Group';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTable } from '../../private/PropertyTable/PropertyTable';
import { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { live } from 'lit-html/directives/live';
import { operatorGreaterThanOrEqual } from '../QueryBuilder/icons/operatorGreaterThanOrEqual';
import { repeat } from 'lit-html/directives/repeat';
import { serializeDate } from '../../../utils/serialize-date';

const NS = 'coupon-form';
const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(ResponsiveMixin(TranslatableMixin(NucleonElement, NS))))
);

/**
 * Form element for creating or editing coupons (`fx:coupon`).
 *
 * @slot name:before
 * @slot name:after
 *
 * @slot rules:before
 * @slot rules:after
 *
 * @slot codes:before
 * @slot codes:after
 *
 * @slot usage:before
 * @slot usage:after
 *
 * @slot product-restrictions:before
 * @slot product-restrictions:after
 *
 * @slot category-restrictions:before
 * @slot category-restrictions:after
 *
 * @slot options:before
 * @slot options:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-coupon-form
 * @since 1.15.0
 */
export class CouponForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),

      'iron-dropdown': customElements.get('iron-dropdown'),
      'iron-icon': customElements.get('iron-icon'),

      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-copy-to-clipboard': customElements.get('foxy-copy-to-clipboard'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-query-builder': customElements.get('foxy-query-builder'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-pagination': customElements.get('foxy-pagination'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-table': customElements.get('foxy-table'),
      'foxy-i18n': customElements.get('foxy-i18n'),

      'x-category-restrictions-page': CategoryRestrictionsPage,
      'x-property-table': PropertyTable,
      'x-editable-list': EditableList,
      'x-checkbox': Checkbox,
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __codesTableQuery: { attribute: false },
      __itemCategories: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name_required',
      ({ name: v }) => !v || v.length <= 50 || 'name_too_long',
    ];
  }

  private __codesTableColumns: Column<Resource<Rels.CouponCodes>>[] = [
    {
      header: ctx => html`<foxy-i18n lang=${ctx.lang} key="code" ns=${ctx.ns}></foxy-i18n>`,
      cell: ctx => {
        const isDisabled = !this.in('idle') || this.disabledSelector.matches('codes', true);

        return html`
          <div class="flex items-center gap-xs">
            <vaadin-button
              theme="tertiary-inline contrast"
              class="p-0"
              ?disabled=${isDisabled}
              @click=${(evt: CustomEvent) => {
                const dialog = this.renderRoot.querySelector<FormDialog>('#code-dialog')!;
                const button = evt.currentTarget as ButtonElement;

                dialog.href = ctx.data._links.self.href;
                dialog.show(button);
              }}
            >
              <span class="font-tnum">${ctx.data.code}</span>
            </vaadin-button>

            <foxy-copy-to-clipboard
              ?disabled=${isDisabled}
              text=${ctx.data.code}
              lang=${ctx.lang}
              ns="${ctx.ns} copy-to-clipboard"
            >
            </foxy-copy-to-clipboard>
          </div>
        `;
      },
    },
    {
      header: ctx => html`<foxy-i18n lang=${ctx.lang} key="date_created" ns=${ctx.ns}></foxy-i18n>`,
      cell: ctx => html`
        <foxy-i18n
          options=${JSON.stringify({ value: ctx.data.date_created })}
          class="text-tertiary"
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
        >
        </foxy-i18n>
      `,
    },
    {
      hideBelow: 'sm',
      header: c => html`<foxy-i18n lang=${c.lang} key="date_modified" ns=${c.ns}></foxy-i18n>`,
      cell: ctx => html`
        <foxy-i18n
          options=${JSON.stringify({ value: ctx.data.date_modified })}
          class="text-tertiary"
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
        >
        </foxy-i18n>
      `,
    },
    {
      header: c => html`<foxy-i18n lang=${c.lang} key="used_codes" ns=${c.ns}></foxy-i18n>`,
      cell: ctx => html`${ctx.data.number_of_uses_to_date}`,
    },
  ];

  private static readonly __codesQueryOptions: Option[] = [
    { label: 'code', path: 'code', type: Type.String },
    { label: 'used_codes', path: 'number_of_uses_to_date', type: Type.Number },
    { label: 'date_created', path: 'date_created', type: Type.Date },
    { label: 'date_modified', path: 'date_modified', type: Type.Date },
  ];

  private __codesTableQuery: string | null = null;

  private __itemCategories = '';

  render(): TemplateResult {
    const hidden = this.hiddenSelector;

    return html`
      <div class="relative space-y-l">
        ${hidden.matches('name', true) ? '' : this.__renderName()}
        ${hidden.matches('rules', true) ? '' : this.__renderRules()}
        ${hidden.matches('codes', true) || !this.data ? '' : this.__renderCodes()}
        ${hidden.matches('usage', true) ? '' : this.__renderUsage()}
        ${hidden.matches('product-restrictions', true) ? '' : this.__renderProductRestrictions()}
        ${hidden.matches('category-restrictions', true) || !this.data
          ? ''
          : this.__renderCategoryRestrictions()}
        ${hidden.matches('options', true) ? '' : this.__renderOptions()}
        ${hidden.matches('timestamps', true) ? '' : this.__renderTimestamps()}
        ${hidden.matches('create', true) || !!this.data ? '' : this.__renderCreate()}
        ${hidden.matches('delete', true) || !this.data ? '' : this.__renderDelete()}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': this.in('idle'),
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    type Store = Resource<Rels.Store>;

    const coupon = await super._sendGet();
    const store = await super._fetch<Store>(coupon._links['fx:store'].href);
    const categoriesURL = new URL(store._links['fx:item_categories'].href);

    categoriesURL.searchParams.set('limit', '5');
    this.__itemCategories = categoriesURL.toString();

    return coupon;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __getValidator(prefix: string) {
    return () => !this.errors.some(err => err.startsWith(prefix));
  }

  private __renderName() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('name:before')}

        <vaadin-text-field
          error-message=${this.__getErrorMessage('name')}
          helper-text=${this.t('coupon_name_helper_text')}
          data-testid="name"
          class="w-full"
          label=${this.t('name')}
          .checkValidity=${this.__getValidator('name')}
          .value=${this.form.name}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('name', true)}
          ?readonly=${this.readonlySelector.matches('name', true)}
          required
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: CustomEvent) => {
            const newName = (evt.currentTarget as TextFieldElement).value;
            this.edit({ name: newName });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot('name:after')}
      </div>
    `;
  }

  private __renderRulesPreset() {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);
    const isReadonly = this.readonlySelector.matches('rules', true);
    const details = this.form.coupon_discount_details;
    const type = this.form.coupon_discount_type;

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
          'text-body hover-text-primary focus-within-ring-2': !isDisabled && !isReadonly,
          'text-disabled': isDisabled,
          'text-secondary': isReadonly,
        })}
      >
        <foxy-i18n class="sr-only" lang=${this.lang} key="preset" ns=${this.ns}></foxy-i18n>

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
            ?disabled=${isDisabled || isReadonly}
            @change=${(evt: Event) => {
              const select = evt.currentTarget as HTMLSelectElement;
              const preset = presets[select.selectedIndex];

              this.edit({
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

            <option value="custom" ?selected=${!selectedPreset}>
              ${this.t('custom_discount')}
            </option>
          </select>
        </span>
      </label>
    `;
  }

  private __renderRulesTierSelect({ label, value, options, onChange }: RulesTierSelectParams) {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);
    const isReadonly = this.readonlySelector.matches('rules', true);
    const isInteractive = !isDisabled && !isReadonly;

    return html`
      <label
        class=${classMap({
          'h-xs whitespace-nowrap block ring-primary-50 rounded-s pl-s transition-colors': true,
          'hover-bg-primary hover-text-primary-contrast focus-within-ring-2': isInteractive,
          'bg-primary-10 text-primary': isInteractive,
          'bg-contrast-5 text-disabled': isDisabled,
          'bg-contrast-5 text-secondary': isReadonly && !isDisabled,
        })}
      >
        <foxy-i18n class="sr-only" lang=${this.lang} key=${label} ns=${this.ns}></foxy-i18n>

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

  private __renderRulesTierSwitch({ value, options, onChange }: RulesTierSwitchParams) {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);
    const isReadonly = this.readonlySelector.matches('rules', true);
    const isInteractive = !isDisabled && !isReadonly;
    const name = `switch-${Math.floor(Math.random() * Math.pow(10, 10))}`;
    const dotStyle = 'width: 0.4rem; height: 0.4rem';

    return html`
      <div
        class=${classMap({
          'h-xs px-xs space-x-xs flex items-center rounded-s transition-colors': true,
          'hover-bg-primary hover-text-primary-contrast focus-within-ring-2': isInteractive,
          'ring-primary-50 cursor-pointer bg-primary-10 text-primary': isInteractive,
          'bg-contrast-5 text-disabled': isDisabled,
          'bg-contrast-5 text-secondary': isReadonly && !isDisabled,
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
                  lang=${this.lang}
                  key=${option}
                  ns=${this.ns}
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

  private __renderRulesTierField({ value, label, onChange }: RulesTierFieldParams) {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);
    const isReadonly = this.readonlySelector.matches('rules', true);
    const isInteractive = !isDisabled && !isReadonly;

    return html`
      <label>
        <foxy-i18n class="sr-only" lang=${this.lang} key=${label} ns=${this.ns}></foxy-i18n>
        <input
          data-testclass="interactive editable"
          class=${classMap({
            'transition-colors border p-xs h-xs font-medium text-m rounded-s w-xl': true,
            'ring-primary-50 text-body bg-contrast-10': isInteractive,
            'hover-bg-contrast-20': isInteractive,
            'focus-outline-none focus-ring-2': isInteractive,
            'text-disabled bg-contrast-5': isDisabled,
            'text-secondary': isReadonly && !isDisabled,
            'border-transparent border-solid': !isReadonly,
            'border-dashed border-contrast-30': isReadonly,
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

  private __renderRulesTier(params: RulesTierParams) {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);
    const isReadonly = this.readonlySelector.matches('rules', true);
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
            'text-tertiary': !isDisabled,
            'text-disabled': isDisabled,
          })}
        >
          <foxy-i18n
            class="uppercase text-s font-semibold"
            lang=${this.lang}
            key="tier_if"
            ns=${this.ns}
          >
          </foxy-i18n>

          ${this.__renderRulesTierSwitch({
            options: ['total', 'quantity'],
            value: params.source === 'price' ? 0 : 1,
            onChange: i => params.onChange({ source: i ? 'quantity' : 'price' }),
          })}

          <div class="h-s w-s">${operatorGreaterThanOrEqual}</div>

          ${this.__renderRulesTierField({
            label: 'from',
            value: String(from),
            onChange: v => params.onChange({ tier: `${v}${sign}${adjustment}` }),
          })}

          <foxy-i18n
            class="uppercase text-s font-semibold"
            lang=${this.lang}
            key="tier_then"
            ns=${this.ns}
          >
          </foxy-i18n>

          ${this.__renderRulesTierSwitch({
            options: ['reduce', 'increase'],
            value: sign === '-' ? 0 : 1,
            onChange: i => params.onChange({ tier: `${from}${i ? '+' : '-'}${adjustment}` }),
          })}

          <!---->

          ${this.__renderRulesTierSelect({
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

          <foxy-i18n
            class="uppercase text-s font-semibold"
            lang=${this.lang}
            key="tier_by"
            ns=${this.ns}
          >
          </foxy-i18n>

          ${this.__renderRulesTierField({
            label: 'adjustment',
            value: String(adjustment),
            onChange: v => params.onChange({ tier: `${from}${sign}${v}` }),
          })}

          <!---->

          ${this.__renderRulesTierSwitch({
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
                  'w-s h-s m-s flex-shrink-0 rounded transition-colors ring-primary-50': true,
                  'text-tertiary hover-text-secondary focus-outline-none focus-ring-2': !isDisabled,
                  'text-disabled cursor-default': isDisabled,
                })}
                ?disabled=${isDisabled}
                ?hidden=${isReadonly}
                @click=${() => params.onDelete()}
              >
                <iron-icon icon="lumo:cross"></iron-icon>
              </button>
            `
          : ''}
      </div>
    `;
  }

  private __renderRulesUrlParameter() {
    const name = this.form.name ?? '';
    const type = this.form.coupon_discount_type ?? 'quantity_amount';
    const details = this.form.coupon_discount_details ?? '';
    const urlParameter = `discount_${type}=${encodeURIComponent(`${name}{${details}}`)}`;
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);

    return html`
      <div data-testid="rules:url" class="text-xs flex space-x-xs">
        <span
          class=${classMap({
            'flex-shrink-0 transition-colors': true,
            'text-tertiary': !isDisabled,
            'text-disabled': isDisabled,
          })}
        >
          <foxy-i18n lang=${this.lang} key="url_parameter" ns=${this.ns}></foxy-i18n>&#58;
        </span>

        <code
          class=${classMap({
            'bg-contrast-5 transition-colors font-lumo truncate rounded-s px-xs': true,
            'text-secondary': !isDisabled,
            'text-disabled': isDisabled,
          })}
        >
          ${urlParameter}
        </code>

        <foxy-copy-to-clipboard
          data-testid="rules:url:copy"
          text=${urlParameter}
          lang=${this.lang}
          ns="${this.ns} copy-to-clipboard"
          ?disabled=${isDisabled}
        >
        </foxy-copy-to-clipboard>
      </div>
    `;
  }

  private __renderRulesDescription() {
    const type = this.form.coupon_discount_type ?? 'quantity_amount';
    const details = this.form.coupon_discount_details ?? '';
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);

    return html`
      <div data-testid="rules:description" class="text-xs leading-m">
        <span class="transition-colors ${isDisabled ? 'text-disabled' : 'text-tertiary'}">
          <foxy-i18n lang=${this.lang} key="description" ns=${this.ns}></foxy-i18n>&#58;
        </span>

        <foxy-i18n
          options=${JSON.stringify({ params: { details, type, ns: this.ns } })}
          class="transition-colors ${isDisabled ? 'text-disabled' : 'text-secondary'}"
          lang=${this.lang}
          key="discount_summary"
          ns=${this.ns}
        >
        </foxy-i18n>
      </div>
    `;
  }

  private __renderRules() {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('rules', true);

    const details = this.form.coupon_discount_details ?? '';
    const tiers = details.split('|').filter(v => !!v.trim());
    const method = (/[-+]/.test(tiers[0]) ? null : tiers.shift()) ?? 'single';
    const renderedTiers = method === 'repeat' ? [tiers[0]] : [...tiers, undefined];

    const type = this.form.coupon_discount_type ?? 'quantity_amount';
    const [source, units] = type.split('_');

    return html`
      <div data-testid="rules">
        ${this.renderTemplateOrSlot('rules:before')}

        <div>
          <div class="flex items-center justify-between space-x-m text-s mb-xs">
            <foxy-i18n
              class=${classMap({
                'transition-colors font-medium flex-1': true,
                'text-secondary': !isDisabled,
                'text-disabled': isDisabled,
              })}
              lang=${this.lang}
              key="rule_plural"
              ns=${this.ns}
            >
            </foxy-i18n>

            <div class="min-w-0">${this.__renderRulesPreset()}</div>
          </div>

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

                this.edit({
                  coupon_discount_details: `${newMethod}|${newTiers.join('|')}`,
                  coupon_discount_type: `${newSource}_${newUnits}` as Data['coupon_discount_type'],
                });
              };

              const onDelete = () => {
                const newTiers = tiers.filter((_, i) => i !== tierIndex);
                this.edit({ coupon_discount_details: `${method}|${newTiers.join('|')}` });
              };

              return this.__renderRulesTier({ source, method, units, tier, onChange, onDelete });
            })}
          </div>

          <div class="space-y-xs mt-m">
            ${this.__renderRulesUrlParameter()} ${this.__renderRulesDescription()}
          </div>
        </div>

        ${this.renderTemplateOrSlot('rules:after')}
      </div>
    `;
  }

  private __renderCodes() {
    const { disabledSelector, group, data, lang, ns } = this;

    const isDisabled = !this.in('idle') || disabledSelector.matches('codes', true);
    const filters = this.__codesTableQuery;
    const url = new URL(data!._links['fx:coupon_codes'].href);

    new URLSearchParams(filters ?? '').forEach((value, name) => url.searchParams.set(name, value));
    url.searchParams.set('limit', '5');

    const filterButtonLabel = filters === null ? 'filter' : 'clear_filters';
    const filterButtonIcon = `icons:${filters === null ? 'filter-list' : 'clear'}`;

    return html`
      <div data-testid="codes">
        <foxy-form-dialog
          disabledcontrols=${disabledSelector.zoom('codes:generate:form').toString()}
          readonlycontrols=${this.readonlySelector.zoom('codes:generate:form').toString()}
          hiddencontrols="save-button current-balance ${this.hiddenSelector
            .zoom('codes:generate:form')
            .toString()}"
          related=${JSON.stringify([url.toString()])}
          header="generate"
          parent=${data?._links['fx:generate_codes'].href ?? ''}
          group=${group}
          lang=${lang}
          form="foxy-generate-codes-form"
          ns=${ns}
          id="generate-codes-dialog"
          alert
          .related=${[url.toString()]}
        >
        </foxy-form-dialog>

        <foxy-form-dialog
          disabledcontrols=${disabledSelector.zoom('codes:form').toString()}
          readonlycontrols=${this.readonlySelector.zoom('codes:form').toString()}
          hiddencontrols=${this.hiddenSelector.zoom('codes:form').toString()}
          header="code"
          parent=${url.toString()}
          group=${group}
          lang=${lang}
          form="foxy-coupon-code-form"
          ns=${ns}
          id="code-dialog"
        >
        </foxy-form-dialog>

        <foxy-form-dialog
          disabledcontrols=${disabledSelector.zoom('codes:import:form').toString()}
          readonlycontrols=${this.readonlySelector.zoom('codes:import:form').toString()}
          hiddencontrols="save-button ${this.hiddenSelector.zoom('codes:import:form').toString()}"
          header="import"
          parent=${data!._links['fx:coupon_codes'].href}
          group=${group}
          lang=${lang}
          form="foxy-coupon-codes-form"
          ns=${ns}
          id="import-dialog"
        >
        </foxy-form-dialog>

        ${this.renderTemplateOrSlot('codes:before')}

        <div class="flex items-center justify-between mb-xs space-x-s">
          <foxy-i18n
            class="text-s font-medium text-secondary leading-none flex-1"
            lang=${lang}
            key="code_plural"
            ns=${ns}
          >
          </foxy-i18n>

          <vaadin-button
            data-testid="codes:generate-button"
            theme="success tertiary small"
            ?disabled=${isDisabled}
            @click=${(evt: CustomEvent) => {
              const dialog = this.renderRoot.querySelector<FormDialog>('#generate-codes-dialog');
              const button = evt.currentTarget as ButtonElement;
              dialog?.show(button);
            }}
          >
            <foxy-i18n class="text-s" lang=${lang} key="generate" ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon="icons:add"></iron-icon>
          </vaadin-button>

          <vaadin-button
            data-testid="codes:import-button"
            theme="contrast tertiary small"
            ?disabled=${isDisabled}
            @click=${(evt: CustomEvent) => {
              const dialog = this.renderRoot.querySelector<FormDialog>('#import-dialog');
              const button = evt.currentTarget as ButtonElement;
              dialog?.show(button);
            }}
          >
            <foxy-i18n class="text-s" lang=${lang} key="import" ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon="icons:open-in-browser"></iron-icon>
          </vaadin-button>

          <vaadin-button
            data-testid="codes:filter-button"
            theme="contrast ${filters === null ? 'tertiary' : ''} small"
            ?disabled=${isDisabled}
            @click=${() => (this.__codesTableQuery = filters === null ? '' : null)}
          >
            <foxy-i18n class="text-s" lang=${lang} key=${filterButtonLabel} ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon=${filterButtonIcon}></iron-icon>
          </vaadin-button>
        </div>

        <foxy-query-builder
          class="my-s"
          lang=${lang}
          ns="${ns} ${customElements.get('foxy-query-builder')?.defaultNS ?? ''}"
          ?disabled=${isDisabled}
          ?hidden=${filters === null}
          .options=${CouponForm.__codesQueryOptions}
          .value=${filters}
          @change=${(evt: CustomEvent) => {
            const queryBuilder = evt.currentTarget as QueryBuilder;
            this.__codesTableQuery = queryBuilder.value;
          }}
        >
        </foxy-query-builder>

        <foxy-pagination
          first=${url.toString()}
          lang=${lang}
          ns="${ns} ${customElements.get('foxy-pagination')?.defaultNS ?? ''}"
          ?disabled=${isDisabled}
        >
          <foxy-table
            class="px-m mb-s border border-contrast-10 rounded"
            group=${group}
            lang=${lang}
            ns=${ns}
            .columns=${this.__codesTableColumns}
          >
          </foxy-table>
        </foxy-pagination>

        ${this.renderTemplateOrSlot('codes:after')}
      </div>
    `;
  }

  private __renderUsage() {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('usage', true);
    const isReadonly = this.readonlySelector.matches('usage', true);
    const usesPerCoupon = this.form.number_of_uses_allowed ?? 0;
    const usesPerCustomer = this.form.number_of_uses_allowed_per_customer ?? 0;
    const usesPerCouponCode = this.form.number_of_uses_allowed_per_code ?? 0;

    return html`
      <div data-testid="usage">
        ${this.renderTemplateOrSlot('usage:before')}

        <div class="space-y-s">
          <div class="grid gap-m grid-cols-3">
            <vaadin-integer-field
              placeholder=${this.t('unlimited')}
              data-testid="usage:per-coupon"
              label=${this.t('uses_per_coupon')}
              class="w-full"
              min="0"
              prevent-invalid-input
              has-controls
              .value=${usesPerCoupon || ''}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              @change=${(evt: CustomEvent) => {
                const field = evt.currentTarget as IntegerFieldElement;
                this.edit({ number_of_uses_allowed: parseInt(field.value) });
              }}
            >
            </vaadin-integer-field>

            <vaadin-integer-field
              placeholder=${this.t('unlimited')}
              data-testid="usage:per-coupon-code"
              label=${this.t('uses_per_coupon_code')}
              class="w-full"
              min="0"
              prevent-invalid-input
              has-controls
              .value=${usesPerCouponCode || ''}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              @change=${(evt: CustomEvent) => {
                const field = evt.currentTarget as IntegerFieldElement;
                this.edit({ number_of_uses_allowed_per_code: parseInt(field.value) });
              }}
            >
            </vaadin-integer-field>

            <vaadin-integer-field
              placeholder=${this.t('unlimited')}
              data-testid="usage:per-customer"
              label=${this.t('uses_per_customer')}
              class="w-full"
              min="0"
              prevent-invalid-input
              has-controls
              .value=${usesPerCustomer || ''}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              @change=${(evt: CustomEvent) => {
                const field = evt.currentTarget as IntegerFieldElement;
                this.edit({ number_of_uses_allowed_per_customer: parseInt(field.value) });
              }}
            >
            </vaadin-integer-field>
          </div>

          <div
            class=${classMap({
              'transition-colors text-xs leading-s': true,
              'text-secondary': !isDisabled,
              'text-disabled': isDisabled,
            })}
          >
            <foxy-i18n
              options=${JSON.stringify({ count: usesPerCoupon })}
              lang=${this.lang}
              key="uses_per_coupon_summary${usesPerCoupon ? '' : '_0'}"
              ns=${this.ns}
            >
            </foxy-i18n>

            <foxy-i18n
              options=${JSON.stringify({ count: usesPerCouponCode })}
              lang=${this.lang}
              key="uses_per_coupon_code_summary${usesPerCouponCode ? '' : '_0'}"
              ns=${this.ns}
            >
            </foxy-i18n>

            <foxy-i18n
              options=${JSON.stringify({ count: usesPerCustomer })}
              lang=${this.lang}
              key="uses_per_customer_summary${usesPerCustomer ? '' : '_0'}"
              ns=${this.ns}
            >
            </foxy-i18n>
          </div>
        </div>

        ${this.renderTemplateOrSlot('usage:after')}
      </div>
    `;
  }

  private __renderProductRestrictions() {
    const scope = 'product-restrictions';
    const isDisabled = !this.in('idle') || this.disabledSelector.matches(scope, true);
    const isReadonly = this.readonlySelector.matches(scope, true);
    const restrictions = this.form.product_code_restrictions ?? '';

    const groups = [
      { header: 'allow', items: [] as { label?: string; value: string }[] },
      { header: 'block', items: [] as { label?: string; value: string }[] },
    ];

    if (restrictions) {
      restrictions.split(',').forEach(value => {
        const isBlocklistValue = value.startsWith('-');
        const target = isBlocklistValue ? 1 : 0;
        const label = isBlocklistValue ? value.substring(1) : value;

        groups[target].items.push({ label, value });
      });
    }

    return html`
      <div data-testid="product-restrictions">
        ${this.renderTemplateOrSlot('product-restrictions:before')}

        <div class="space-y-s">
          <x-group frame>
            <foxy-i18n
              class=${isDisabled ? 'text-disabled' : 'text-secondary'}
              slot="header"
              lang=${this.lang}
              key="product_restrictions"
              ns=${this.ns}
            >
            </foxy-i18n>

            <div class="grid sm-grid-cols-2 bg-contrast-10" style="gap: 1px">
              ${groups.map((group, index) => {
                return html`
                  <x-group class="bg-base pt-m">
                    <foxy-i18n
                      class=${isDisabled ? 'text-disabled' : 'text-tertiary'}
                      slot="header"
                      lang=${this.lang}
                      key=${group.header}
                      ns=${this.ns}
                    >
                    </foxy-i18n>

                    <x-editable-list
                      data-testid="product-restrictions:${group.header}"
                      lang=${this.lang}
                      ns=${this.ns}
                      ?disabled=${isDisabled}
                      ?readonly=${isReadonly}
                      .items=${group.items}
                      @change=${(evt: CustomEvent) => {
                        const newItemsByGroup = [
                          index === 0 ? (evt.currentTarget as EditableList).items : groups[0].items,
                          index === 1 ? (evt.currentTarget as EditableList).items : groups[1].items,
                        ];

                        const newSanitizedItemsByGroup = newItemsByGroup
                          .map(list => list.map(v => v.value.replace(/^[\s-]*/, '').trimEnd()))
                          .map(list => list.filter(v => !!v))
                          .map(list => Array.from(new Set(list)));

                        const newRestrictions = newSanitizedItemsByGroup[0]
                          .concat(newSanitizedItemsByGroup[1].map(v => `-${v}`))
                          .join(',');

                        this.edit({ product_code_restrictions: newRestrictions });
                      }}
                    >
                    </x-editable-list>
                  </x-group>
                `;
              })}
            </div>
          </x-group>

          <foxy-i18n
            class=${classMap({
              'block text-xs leading-s transition-colors': true,
              'text-secondary': !isDisabled,
              'text-disabled': isDisabled,
            })}
            lang=${this.lang}
            key="product_restrictions_explainer"
            ns=${this.ns}
          >
          </foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('product-restrictions:after')}
      </div>
    `;
  }

  private __renderCategoryRestrictions() {
    const scope = 'category-restrictions';
    const isDisabled = !this.in('idle') || this.disabledSelector.matches(scope, true);
    const isReadonly = this.readonlySelector.matches(scope, true);

    return html`
      <div data-testid="category-restrictions">
        ${this.renderTemplateOrSlot('category-restrictions:before')}

        <div class="space-y-xs">
          <foxy-pagination
            first=${this.__itemCategories}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-pagination')?.defaultNS ?? ''}"
            ?disabled=${isDisabled}
          >
            <foxy-i18n
              class="block text-s font-medium text-secondary leading-none mb-s"
              lang=${this.lang}
              key="category_restrictions"
              ns=${this.ns}
            >
            </foxy-i18n>

            <x-category-restrictions-page
              coupon-item-categories=${ifDefined(
                this.data?._links['fx:coupon_item_categories'].href
              )}
              data-testid="category-restrictions:page"
              coupon=${this.href}
              class="border border-contrast-10 rounded mb-s"
              group=${this.group}
              lang=${this.lang}
              ns=${this.ns}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
            >
            </x-category-restrictions-page>
          </foxy-pagination>

          <foxy-i18n
            class="block text-xs leading-s text-tertiary"
            lang=${this.lang}
            key="category_restrictions_helper_text"
            ns=${this.ns}
          >
          </foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('category-restrictions:after')}
      </div>
    `;
  }

  private __renderOptions() {
    type Option = { param: keyof Data; label?: string; flip?: boolean };

    const isDisabled = !this.in('idle') || this.disabledSelector.matches('options', true);
    const isReadonly = this.readonlySelector.matches('options', true);
    const options: Option[] = [
      { param: 'multiple_codes_allowed' },
      { param: 'combinable' },
      { param: 'exclude_category_discounts', label: 'combine_with_category_discounts', flip: true },
      { param: 'exclude_line_item_discounts', label: 'combine_with_line_discounts', flip: true },
      { param: 'is_taxable', label: 'apply_taxes_before_coupon' },
    ];

    return html`
      <div data-testid="options">
        ${this.renderTemplateOrSlot('options:before')}

        <x-group frame>
          <foxy-i18n
            class="transition-colors ${isDisabled ? 'text-disabled' : 'text-secondary'}"
            slot="header"
            lang=${this.lang}
            key="option_plural"
            ns=${this.ns}
          >
          </foxy-i18n>

          ${options.map(option => {
            const value = this.form[option.param];
            const label = option.label ?? option.param;
            const color = isDisabled ? 'text-disabled' : 'text-secondary';

            return html`
              <x-checkbox
                data-testclass="inputs"
                data-testid="options:${option.param.replace(/_/g, '-')}"
                ?disabled=${isDisabled}
                ?readonly=${isReadonly}
                ?checked=${option.flip ? !value : value}
                class="m-m"
                @change=${(evt: CheckboxChangeEvent) => {
                  this.edit({ [option.param]: option.flip ? !evt.detail : evt.detail });
                }}
              >
                <div class="flex flex-col">
                  <foxy-i18n lang=${this.lang} key=${label} ns=${this.ns}></foxy-i18n>
                  <foxy-i18n
                    class="transition-colors text-xs leading-s ${color}"
                    lang=${this.lang}
                    key="${label}_explainer"
                    ns=${this.ns}
                  >
                  </foxy-i18n>
                </div>
              </x-checkbox>

              <div style="margin-left: calc(1.125rem + (var(--lumo-space-m) * 2))">
                <div class="border-b border-contrast-10"></div>
              </div>
            `;
          })}

          <x-checkbox
            data-testclass="inputs"
            data-testid="options:dates"
            ?disabled=${isDisabled}
            ?readonly=${isReadonly}
            ?checked=${this.form.start_date || this.form.end_date}
            class="m-m"
            @change=${(evt: Event) => {
              if (evt instanceof CheckboxChangeEvent) {
                let startDate: string | null = null;
                let endDate: string | null = null;

                if (evt.detail) {
                  const today = Date.now();
                  const oneMonthFromToday = new Date(today).setMonth(new Date().getMonth() + 1);

                  startDate = serializeDate(new Date(today));
                  endDate = serializeDate(new Date(oneMonthFromToday));
                }

                this.edit({ start_date: startDate, end_date: endDate });
              }
            }}
          >
            <div class="flex flex-col">
              <foxy-i18n lang=${this.lang} key="set_time_constraints" ns=${this.ns}></foxy-i18n>
              <foxy-i18n
                class="text-xs leading-s ${isDisabled ? 'text-disabled' : 'text-secondary'}"
                lang=${this.lang}
                key="set_time_constraints_explainer"
                ns=${this.ns}
              >
              </foxy-i18n>
            </div>

            ${this.form.start_date || this.form.end_date
              ? html`
                  <div
                    class="grid grid-cols-2 gap-m mt-m"
                    slot="content"
                    style="--lumo-border-radius: var(--lumo-border-radius-s)"
                  >
                    ${(['start_date', 'end_date'] as const).map(property => {
                      const formValue = this.form[property];
                      const pickerValue = formValue
                        ? formValue.length > 10
                          ? serializeDate(new Date(formValue))
                          : formValue
                        : '';

                      return html`
                        <vaadin-date-picker
                          data-testclass="inputs"
                          data-testid="options:${property.replace('_', '-')}"
                          placeholder=${this.t('select')}
                          label=${this.t(property)}
                          clear-button-visible
                          ?disabled=${isDisabled}
                          ?readonly=${isReadonly}
                          .value=${live(pickerValue)}
                          @change=${(evt: CustomEvent) => {
                            const field = evt.currentTarget as DatePickerElement;
                            this.edit({ [property]: field.value });
                          }}
                        >
                        </vaadin-date-picker>
                      `;
                    })}
                  </div>
                `
              : ''}
          </x-checkbox>
        </x-group>

        ${this.renderTemplateOrSlot('options:after')}
      </div>
    `;
  }

  private __renderTimestamps() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}

        <x-property-table
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data?.[field]
              ? this.t('date', { value: new Date(this.data[field] as string) })
              : '',
          }))}
        >
        </x-property-table>

        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  }

  private __renderCreate() {
    const isCleanTemplateInvalid = this.in({ idle: { template: { clean: 'invalid' } } });
    const isDirtyTemplateInvalid = this.in({ idle: { template: { dirty: 'invalid' } } });
    const isCleanSnapshotInvalid = this.in({ idle: { snapshot: { clean: 'invalid' } } });
    const isDirtySnapshotInvalid = this.in({ idle: { snapshot: { dirty: 'invalid' } } });
    const isTemplateInvalid = isCleanTemplateInvalid || isDirtyTemplateInvalid;
    const isSnaphotInvalid = isCleanSnapshotInvalid || isDirtySnapshotInvalid;
    const isInvalid = isTemplateInvalid || isSnaphotInvalid;
    const isIdle = this.in('idle');

    return html`
      <div>
        ${this.renderTemplateOrSlot('create:before')}

        <vaadin-button
          data-testid="create"
          class="w-full"
          theme="primary success"
          ?disabled=${!isIdle || isInvalid || this.disabledSelector.matches('create', true)}
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} key="create" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('create:after')}
      </div>
    `;
  }

  private __renderDelete() {
    return html`
      <div>
        <foxy-internal-confirm-dialog
          data-testid="confirm"
          message="delete_prompt"
          confirm="delete"
          cancel="cancel"
          header="delete"
          theme="primary error"
          lang=${this.lang}
          ns=${this.ns}
          id="confirm"
          @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.delete()}
        >
        </foxy-internal-confirm-dialog>

        ${this.renderTemplateOrSlot('delete:before')}

        <vaadin-button
          data-testid="delete"
          theme="error"
          class="w-full"
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('delete', true)}
          @click=${(evt: CustomEvent) => {
            const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
            confirm.show(evt.currentTarget as ButtonElement);
          }}
        >
          <foxy-i18n ns=${this.ns} key="delete" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('delete:after')}
      </div>
    `;
  }
}
