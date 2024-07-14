import { Choice, Group, Metadata } from '../../private/index';
import { Data } from './types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import {
  getCurrentMonth,
  getCurrentQuarter,
  getCurrentYear,
  getLast30Days,
  getLast365Days,
  getPreviousMonth,
  getPreviousQuarter,
  getPreviousYear,
  toAPIDateTime,
  toDatePickerValue,
  toDateTimePickerValue,
} from './utils';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { ChoiceChangeEvent } from '../../private/Choice/ChoiceChangeEvent';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DateTimePicker } from '@vaadin/vaadin-date-time-picker';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { SelectElement } from '@vaadin/vaadin-select';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { live } from 'lit-html/directives/live';
import { render } from 'lit-html';

const Base = ScopedElementsMixin(
  ResponsiveMixin(
    ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, 'report-form')))
  )
);

/**
 * Form element for creating or editing reports (`fx:report`).
 *
 * @element foxy-report-form
 * @since 1.16.0
 */
export class ReportForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-date-time-picker': customElements.get('vaadin-date-time-picker'),
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
      'vaadin-select': customElements.get('vaadin-select'),
      'vaadin-button': customElements.get('vaadin-button'),

      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),

      'x-metadata': Metadata,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __showRangeTime: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name_required',
      ({ datetime_start: v }) => !!v || 'datetime_start_required',
      ({ datetime_end: v }) => !!v || 'datetime_end_required',
    ];
  }

  private __showRangeTime = false;

  render(): TemplateResult {
    const hidden = this.hiddenSelector;

    return html`
      <div
        data-testid="wrapper"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="space-y-l relative"
      >
        <div class="space-y-m">
          ${hidden.matches('name', true) ? '' : this.__renderName()}
          ${hidden.matches('range', true) ? '' : this.__renderRange()}
          ${hidden.matches('timestamps', true) || !this.data ? '' : this.__renderTimestamps()}
          ${hidden.matches('create', true) || this.data ? '' : this.__renderCreate()}
          ${hidden.matches('delete', true) || !this.data ? '' : this.__renderDelete()}
        </div>

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

  private __renderName() {
    const scope = 'name';
    const items = ['complete', 'customers', 'customers_ltv'];
    const isDisabled = !this.in('idle') || this.disabledSelector.matches(scope);
    const isReadonly = this.readonlySelector.matches(scope);

    return html`
      <div data-testid=${scope}>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <x-group frame>
          <foxy-i18n lang=${this.lang} slot="header" key="name" ns=${this.ns}></foxy-i18n>

          <x-choice
            data-testid="name-choice"
            .value=${this.form.name}
            .items=${items}
            ?readonly=${isReadonly}
            ?disabled=${isDisabled}
            @change=${(evt: Event) => {
              if (evt instanceof ChoiceChangeEvent) {
                this.edit({ name: evt.detail as Data['name'] });
              }
            }}
          >
            ${items.map(value => {
              return html`
                <div slot="${value}-label" class="py-s leading-s">
                  <foxy-i18n class="block" lang=${this.lang} key="name_${value}" ns=${this.ns}>
                  </foxy-i18n>

                  <foxy-i18n
                    class="block text-s opacity-70"
                    lang=${this.lang}
                    key="name_${value}_explainer"
                    ns=${this.ns}
                  >
                  </foxy-i18n>
                </div>
              `;
            })}
          </x-choice>
        </x-group>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  }

  private __renderRangePreset() {
    const options = [
      [
        { value: '0', label: 'preset_previous_quarter', ...getPreviousQuarter() },
        { value: '1', label: 'preset_previous_month', ...getPreviousMonth() },
        { value: '2', label: 'preset_previous_year', ...getPreviousYear() },
      ],
      [
        { value: '3', label: 'preset_this_quarter', ...getCurrentQuarter() },
        { value: '4', label: 'preset_this_month', ...getCurrentMonth() },
        { value: '5', label: 'preset_this_year', ...getCurrentYear() },
      ],
      [
        { value: '6', label: 'preset_last_365_days', ...getLast365Days() },
        { value: '7', label: 'preset_last_30_days', ...getLast30Days() },
      ],
    ];

    const currentOption = options.flat(1).find(option => {
      const { datetime_end: end, datetime_start: start } = this.form;
      return (
        start && end && toAPIDateTime(option.start) === start && toAPIDateTime(option.end) === end
      );
    });

    const renderer = (root: Element) => {
      const custom = html`<vaadin-item value="custom">${this.t('preset_custom')}</vaadin-item>`;
      const separator = html`<hr />`;
      const predefined = options.map(group => {
        const items = group.map(({ value, label }) => {
          return html`<vaadin-item value=${value}>${this.t(label)}</vaadin-item>`;
        });

        return html`${items}${separator}`;
      });

      if (!root.firstElementChild) root.appendChild(document.createElement('vaadin-list-box'));
      render(html`${predefined}${custom}`, root.firstElementChild as Element);
    };

    return html`
      <div>
        <vaadin-select
          data-testid="range:preset"
          label=${this.t('preset')}
          class="w-full -mt-m -mb-xs"
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('range', true)}
          ?readonly=${this.readonlySelector.matches('range', true)}
          .value=${live(currentOption?.value ?? 'custom')}
          .renderer=${renderer}
          @change=${(evt: CustomEvent) => {
            const select = evt.currentTarget as SelectElement;
            const option = options.flat(1).find(option => option.value === select.value);

            if (option) {
              this.edit({
                datetime_start: toAPIDateTime(option.start),
                datetime_end: toAPIDateTime(option.end),
              });
            }
          }}
        >
        </vaadin-select>
      </div>
    `;
  }

  private __renderRangeDateTimePicker(type: 'start' | 'end') {
    const field = type === 'end' ? 'datetime_end' : 'datetime_start';
    const error = this.errors.find(error => error.startsWith(`${field}_`));
    const value = this.form[field as keyof Data] as string;

    return html`
      <vaadin-date-time-picker
        date-placeholder=${this.t('select_date')}
        time-placeholder=${this.t('select_time')}
        error-message=${ifDefined(error ? this.t(error) : undefined)}
        data-testid="range:${type}"
        class="w-full"
        label=${this.t(type)}
        step="1"
        ?disabled=${!this.in('idle') || this.disabledSelector.matches('range', true)}
        ?readonly=${this.readonlySelector.matches('range', true)}
        .checkValidity=${() => !error}
        .value=${value ? toDateTimePickerValue(value) : ''}
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
        @change=${(evt: CustomEvent) => {
          const picker = evt.currentTarget as DateTimePicker;
          this.edit({ [field]: picker.value });
        }}
      >
      </vaadin-date-time-picker>
    `;
  }

  private __renderRangeDatePicker(type: 'start' | 'end') {
    const field = type === 'end' ? 'datetime_end' : 'datetime_start';
    const error = this.errors.find(error => error.startsWith(`${field}_`));
    const value = this.form[field as keyof Data] as string;

    return html`
      <vaadin-date-picker
        error-message=${ifDefined(error ? this.t(error) : undefined)}
        placeholder=${this.t('select_date')}
        data-testid="range:${type}"
        class="w-full"
        label=${this.t(type)}
        step="1"
        ?disabled=${!this.in('idle') || this.disabledSelector.matches('range', true)}
        ?readonly=${this.readonlySelector.matches('range', true)}
        .checkValidity=${() => !error}
        .value=${value ? toDatePickerValue(value) : ''}
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
        @change=${(evt: CustomEvent) => {
          const picker = evt.currentTarget as DateTimePicker;
          const time = type === 'end' ? '23:59:59' : '00:00:00';

          this.edit({ [field]: `${picker.value}T${time}` });
        }}
      >
      </vaadin-date-picker>
    `;
  }

  private __renderRange() {
    const renderer = this.__showRangeTime
      ? this.__renderRangeDateTimePicker
      : this.__renderRangeDatePicker;

    return html`
      <div data-testid="range">
        ${this.renderTemplateOrSlot('range:before')}

        <x-group frame>
          <foxy-i18n slot="header" lang=${this.lang} key="range" ns=${this.ns}></foxy-i18n>

          <div
            style="--lumo-border-radius: var(--lumo-border-radius-s)"
            class="p-m grid gap-m ${this.__showRangeTime ? 'grid-cols-1' : 'sm-grid-cols-2'}"
          >
            <div class=${this.__showRangeTime ? 'col-span-1' : 'sm-col-span-2'}>
              ${this.__renderRangePreset()}
            </div>

            ${renderer.call(this, 'start')} ${renderer.call(this, 'end')}

            <vaadin-checkbox
              data-testid="range:toggle"
              class="-my-xs w-full ${this.__showRangeTime ? 'col-span-1' : 'sm-col-span-2'}"
              ?disabled=${!this.in('idle') || this.disabledSelector.matches('range', true)}
              ?checked=${this.__showRangeTime}
              @change=${(evt: CustomEvent) => {
                const checkbox = evt.currentTarget as CheckboxElement;
                this.__showRangeTime = checkbox.checked;
              }}
            >
              <foxy-i18n lang=${this.lang} key="use_precise_time" ns=${this.ns}></foxy-i18n>
            </vaadin-checkbox>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('range:after')}
      </div>
    `;
  }

  private __renderTimestamps() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}

        <x-metadata
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data?.[field]
              ? this.t('date', { value: new Date(this.data[field] as string) })
              : '',
          }))}
        >
        </x-metadata>

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
