import { Checkbox, Group } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, CSSResultArray, html, css } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data, TextFieldParams, DateTimePickerParams } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';
import { versions } from './versions';
import { TimePickerElement } from '@vaadin/vaadin-time-picker';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { DateTimePicker } from '@vaadin/vaadin-date-time-picker';
import { parseDate } from '../../../utils/parse-date';

const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, 'user-form')))
);

export class ReportForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'vaadin-time-picker': TimePickerElement,
      'vaadin-date-picker': DatePickerElement,
      'vaadin-date-time-picker': DateTimePicker,
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-group': Group,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !v || v.length <= 50 || 'name_too_long',
      ({ version: v }) => !v || v.length <= 50 || 'version_too_long',
      ({ datetime_start: v }) => !!v || 'datetime_start_required',
      ({ datetime_end: v }) => !!v || 'datetime_end_required',
    ];
  }

  private __bindField = memoize((key: keyof Data) => {
    console.log(key);
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.edit({ [key]: target.value });
    };
  });

  private readonly __renderCreate = () => {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <div>
        ${this.renderTemplateOrSlot('create:before')}

        <vaadin-button
          data-testid="create"
          class="w-full"
          theme="success primary"
          ?disabled=${!this.in('idle') || !isValid || this.disabledSelector.matches('create', true)}
          @click=${() => this.submit()}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="create"></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('create:after')}
      </div>
    `;
  };

  private __renderTextField = ({ field }: TextFieldParams) => {
    return html`
      <vaadin-text-field
        error-message=${this.__getErrorMessage(field)}
        data-testid=${field}
        ?readonly=${this.readonly}
        class="w-full"
        label=${this.t(field)}
        value=${ifDefined(this.form?.[field]?.toString())}
        .checkValidity=${this.__getValidator(field)}
        @input=${this.__bindField(field)}
        @keydown=${this.__handleKeyDown}
      >
      </vaadin-text-field>
    `;
  }

  private __renderReportVersions = () => {
    const displayVersions = {};

    versions.map(version => {
      displayVersions[version.key] = version.text;
    });

    return html`
      <vaadin-combo-box
        class="w-full"
        label=${this.t('version')}
        value=${ifDefined(displayVersions[this.form?.['version']?.toString()])}
        error-message=${this.__getErrorMessage('version')}
        item-value-path="code"
        item-label-path="text"
        .checkValidity=${this.__getValidator('version')}
        .items=${versions.map(version => ({ text: version.text, code: version.key }))}
        ?allow-custom-value=${'version'}
        @change=${this.__bindField('version')}
      >
      </vaadin-combo-box>
    `;
  }

  private __renderDateTimePicker = ({fieldDate, fieldTime, handleFunction, param, min}: DateTimePickerParams) => {
    const minValue = min ?? '';

    return html`
      <vaadin-date-time-picker
        data-testid="${fieldDate.replace(' ', '_')}"
        @change=${handleFunction}
        .value=${param}
        .min=${minValue}
        .datePlaceholder=${this.t(fieldDate)}
        .timePlaceholder=${this.t(fieldTime)}
      >
      </vaadin-date-time-picker>
      `;
  }

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private __startDate = '';

  private __endDate = '';

  render(): TemplateResult {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;
    const isBusy = this.in('busy');
    const isFail = this.in('fail');
    const isDisabled = isBusy || isFail || this.disabled;

    return html`
      <div
        data-testid="wrapper"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="space-y-l relative"
      >
        ${this.__renderTextField({field: 'name'})}
        ${this.__renderReportVersions()}

        <div class="sm-flex sm-items-end">
          ${this.__renderDateTimePicker({
            fieldDate: 'start date',
            fieldTime: 'start time',
            handleFunction: this.__handleStartDateChange,
            param: this.__startDate
          })}
        </div>
        <div class="sm-flex sm-items-end">
          ${this.__renderDateTimePicker({
            fieldDate: 'end date',
            fieldTime: 'end time',
            handleFunction: this.__handleEndDateChange,
            param: this.__endDate,
            min: this.__startDate,
          })}
        </div>
        ${this.__renderCreate()}
      </div>
    `;
  }

  private __handleStartDateChange(evt: InputEvent) {
    console.log('test');
    evt.stopPropagation();
    this.__startDate = (evt.target as DateTimePicker).value;
    console.log(this.__startDate);

    const end = parseDate(this.__endDate);
    const start = parseDate(this.__startDate)!;
    if (end && end.getTime() < start.getTime()) this.__endDate = '';

    this.requestUpdate();
  }

  private __handleEndDateChange(evt: InputEvent) {
    evt.stopPropagation();
    this.__endDate = (evt.target as DateTimePicker).value;
    this.requestUpdate();
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')) : '';
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }
}
