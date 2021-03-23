import { CSSResult, CSSResultArray } from 'lit-element';
import { Choice, Group, PropertyTable } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ChoiceChangeEvent } from '../../private/events';
import { ConfirmDialog } from '../../private/ConfirmDialog/ConfirmDialog';
import { Data } from './types';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';

export class AttributeForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'x-property-table': PropertyTable,
      'x-confirm-dialog': ConfirmDialog,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-choice': Choice,
      'x-group': Group,
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-spinner': customElements.get('foxy-spinner'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ value }) => (value && value.length > 0) || 'value_required',
      ({ value }) => (value && value.length <= 1000) || 'value_too_long',
      ({ name }) => (name && name.length > 0) || 'name_required',
      ({ name }) => (name && name.length <= 500) || 'name_too_long',
    ];
  }

  private static readonly __visibilityOptions = ['private', 'restricted', 'public'] as const;

  private static readonly __ns = 'attribute-form';

  private __untrackTranslations?: () => void;

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const lang = this.lang;
    const ns = AttributeForm.__ns;

    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isDisabled = !this.in('idle');
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <x-confirm-dialog
        data-testid="confirm"
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        @hide=${this.__handleConfirmHide}
      >
      </x-confirm-dialog>

      <div class="relative" aria-busy=${this.in('busy')} aria-live="polite">
        <div class="grid grid-cols-1 gap-l">
          <vaadin-text-field
            data-testid="name"
            label=${this.__t('name').toString()}
            value=${ifDefined(this.form?.name)}
            .checkValidity=${this.__getValidator('name')}
            ?disabled=${isDisabled}
            error-message=${this.__getErrorMessage('name')}
            @keydown=${this.__handleKeyDown}
            @input=${this.__handleNameInput}
          >
          </vaadin-text-field>

          <vaadin-text-area
            data-testid="value"
            label=${this.__t('value').toString()}
            value=${ifDefined(this.form?.value)}
            .checkValidity=${this.__getValidator('value')}
            ?disabled=${isDisabled}
            error-message=${this.__getErrorMessage('value')}
            @input=${this.__handleValueInput}
          >
          </vaadin-text-area>

          <x-group frame>
            <foxy-i18n
              class=${classMap({ 'text-disabled': isDisabled })}
              lang=${lang}
              slot="header"
              key="visibility"
              ns=${ns}
            >
            </foxy-i18n>

            <x-choice
              .items=${AttributeForm.__visibilityOptions}
              .value=${(this.form?.visibility ?? 'private') as any}
              lang=${lang}
              ns=${ns}
              data-testid="visibility"
              ?disabled=${isDisabled}
              @change=${this.__handleChoiceChange}
            >
              <foxy-i18n ns=${ns} lang=${lang} slot="private-label" key="visibility_private">
              </foxy-i18n>

              <foxy-i18n ns=${ns} lang=${lang} slot="restricted-label" key="visibility_restricted">
              </foxy-i18n>

              <foxy-i18n ns=${ns} lang=${lang} slot="public-label" key="visibility_public">
              </foxy-i18n>
            </x-choice>
          </x-group>

          ${this.data
            ? html`
                <x-property-table
                  .items=${(['date_modified', 'date_created'] as const).map(field => ({
                    name: this.__t(field),
                    value: this.__t('date', { value: new Date(this.data![field]) }),
                  }))}
                >
                </x-property-table>

                <vaadin-button
                  data-testid="delete"
                  theme="error primary"
                  ?disabled=${isDisabled}
                  @click=${this.__handleDeleteClick}
                >
                  <foxy-i18n ns=${ns} lang=${lang} key="delete"></foxy-i18n>
                </vaadin-button>
              `
            : html`
                <vaadin-button
                  data-testid="create"
                  theme="success primary"
                  ?disabled=${isDisabled || !isValid}
                  @click=${this.submit}
                >
                  <foxy-i18n ns=${ns} lang=${lang} key="create"></foxy-i18n>
                </vaadin-button>
              `}
        </div>

        ${!this.in('idle')
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  data-testid="spinner"
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this.in('fail') ? 'error' : 'busy'}
                  layout="vertical"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
    this.__getValidator.cache.clear?.();
  }

  private get __confirmDialog(): ConfirmDialog {
    return this.renderRoot.querySelector('#confirm') as ConfirmDialog;
  }

  private get __t() {
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, AttributeForm.__ns);
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.__t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }

  private __handleNameInput(evt: InputEvent) {
    this.edit({ name: (evt.target as HTMLInputElement).value });
  }

  private __handleValueInput(evt: InputEvent) {
    this.edit({ value: (evt.target as HTMLInputElement).value });
  }

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.edit({ visibility: evt.detail as 'private' | 'restricted' | 'public' });
  }

  private __handleDeleteClick(evt: Event) {
    this.__confirmDialog.show(evt.currentTarget as HTMLElement);
  }

  private __handleConfirmHide(evt: DialogHideEvent) {
    if (!evt.detail.cancelled) this.delete();
  }
}
