import { Choice, Group, PropertyTable } from '../../private/index';
import { Data, Templates } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-element';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ChoiceChangeEvent } from '../../private/Choice/ChoiceChangeEvent';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DateTimePicker } from '@vaadin/vaadin-date-time-picker';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, 'report-form')))
);

/**
 * Form element for creating or editing reports (`fx:report`).
 *
 * @slot name:before
 * @slot name:after
 *
 * @slot start:before
 * @slot start:after
 *
 * @slot end:before
 * @slot end:after
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
 * @element foxy-report-form
 * @since 1.16.0
 */
export class ReportForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-date-time-picker': DateTimePicker,
      'vaadin-button': customElements.get('vaadin-button'),

      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),

      'x-property-table': PropertyTable,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name_required',
      ({ datetime_start: v }) => !!v || 'start_required',
      ({ datetime_end: v }) => !!v || 'end_required',
    ];
  }

  templates: Templates = {};

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
          ${hidden.matches('start', true) ? '' : this.__renderStart()}
          ${hidden.matches('end', true) ? '' : this.__renderEnd()}
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
          <foxy-i18n
            class=${classMap({ 'transition-colors': true, 'text-disabled': isDisabled })}
            lang=${this.lang}
            slot="header"
            key="name"
            ns=${this.ns}
          >
          </foxy-i18n>

          <x-choice
            data-testid="content-type"
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

  private __renderStart() {
    const error = this.errors.find(error => error.startsWith('start_'));
    const value = this.form.datetime_start;

    return html`
      <div>
        ${this.renderTemplateOrSlot('start:before')}

        <vaadin-date-time-picker
          date-placeholder=${this.t('select_date')}
          time-placeholder=${this.t('select_time')}
          error-message=${ifDefined(error ? this.t(error) : undefined)}
          data-testid="start"
          class="-mt-m"
          label=${this.t('start')}
          step="1"
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('start', true)}
          ?readonly=${this.readonlySelector.matches('start', true)}
          .checkValidity=${() => !error}
          .value=${value ? this.__convertFormValueToPickerValue(value) : ''}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @change=${(evt: CustomEvent) => {
            const picker = evt.currentTarget as DateTimePicker;
            this.edit({ datetime_start: picker.value });
          }}
        >
        </vaadin-date-time-picker>

        ${this.renderTemplateOrSlot('start:after')}
      </div>
    `;
  }

  private __renderEnd() {
    const error = this.errors.find(error => error.startsWith('end_'));
    const value = this.form.datetime_end;

    return html`
      <div>
        ${this.renderTemplateOrSlot('end:before')}

        <vaadin-date-time-picker
          date-placeholder=${this.t('select_date')}
          time-placeholder=${this.t('select_time')}
          error-message=${ifDefined(error ? this.t(error) : undefined)}
          data-testid="end"
          label=${this.t('end')}
          class="-mt-m"
          step="1"
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('end', true)}
          ?readonly=${this.readonlySelector.matches('end', true)}
          .checkValidity=${() => !error}
          .value=${value ? this.__convertFormValueToPickerValue(value) : ''}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @change=${(evt: CustomEvent) => {
            const picker = evt.currentTarget as DateTimePicker;
            this.edit({ datetime_end: picker.value });
          }}
        >
        </vaadin-date-time-picker>

        ${this.renderTemplateOrSlot('end:after')}
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
          theme="primary error"
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

  private __convertFormValueToPickerValue(formValue: string) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.exec(formValue)?.[0] ?? '';
  }
}
