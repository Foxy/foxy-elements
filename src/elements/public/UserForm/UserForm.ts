import { Checkbox, Group } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { validate as isEmail } from 'email-validator';
import memoize from 'lodash-es/memoize';
import { roles } from './roles';

const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, 'user-form')))
);

export class UserForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-checkbox': Checkbox,
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-group': Group,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ first_name: v }) => !v || v.length <= 50 || 'first_name_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last_name_too_long',
      ({ email: v }) => (v && v.length > 0) || 'email_required',
      ({ email: v }) => (v && v.length <= 100) || 'email_too_long',
      ({ email: v }) => (v && isEmail(v)) || 'email_invalid_email',
      ({ phone: v }) => !v || v.length <= 50 || 'phone_too_long',
    ];
  }

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private __bindField = memoize((key: keyof Data) => {
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.edit({ [key]: target.value });
    };
  });

  render(): TemplateResult {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;
    const isBusy = this.in('busy');
    const isFail = this.in('fail');
    const isDisabled = isBusy || isFail || this.disabled;

    return html`
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
        @hide=${this.__handleConfirmHide}
      >
      </foxy-internal-confirm-dialog>

      <div
        data-testid="wrapper"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="space-y-l relative"
      >
        <div class="grid grid-cols-1 sm-grid-cols-2 gap-m">
          ${(['first_name', 'last_name', 'email', 'phone'] as const).map(
            field => html`
              <vaadin-text-field
                error-message=${this.__getErrorMessage(field)}
                data-testid=${field}
                ?disabled=${isDisabled}
                ?readonly=${this.readonly}
                class="w-full"
                label=${this.t(field)}
                value=${ifDefined((this.form as any)[field])}
                .checkValidity=${this.__getValidator(field)}
                @input=${this.__bindField(field)}
                @keydown=${this.__handleKeyDown}
              >
              </vaadin-text-field>
            `
          )}
        </div>

        <x-group frame>
          ${roles.map(
            (role, index) => html`
              <hr
                class=${index > 0 ? 'border-contrast-10' : 'hidden'}
                style="margin-left: calc((var(--lumo-space-m) * 2) + 1.125rem)"
              />

              <x-checkbox
                class="w-full p-m"
                ?readonly=${this.readonly}
                ?disabled=${isDisabled}
                ?checked=${this.form[role.property]}
                @change=${(evt: CustomEvent) => {
                  const checkbox = evt.target as Checkbox;
                  this.edit({ [role.property]: checkbox.checked });
                }}
              >
                <div class="flex items-start leading-s">
                  <div class="flex-1 flex flex-col">
                    <foxy-i18n key=${role.key} lang=${this.lang} ns=${this.ns}></foxy-i18n>
                    <foxy-i18n
                      class="text-s text-secondary"
                      lang=${this.lang}
                      key="${role.key}_explainer"
                      ns=${this.ns}
                    >
                    </foxy-i18n>
                  </div>

                  <div class="mt-xs" style="width: 1.125rem; height: 1.125rem;">${role.icon}</div>
                </div>
              </x-checkbox>
            `
          )}
        </x-group>

        <vaadin-button
          data-testid="action"
          theme=${this.in('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
          class="w-full"
          ?disabled=${(this.in({ idle: 'template' }) && !isValid) || isDisabled}
          @click=${this.__handleActionClick}
        >
          <foxy-i18n lang=${this.lang} key=${this.href ? 'delete' : 'create'} ns=${this.ns}>
          </foxy-i18n>
        </vaadin-button>

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isBusy && !isFail,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${isFail ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${this.lang}
            ns=${this.ns}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')) : '';
  }

  private __handleActionClick(evt: Event) {
    if (this.in({ idle: 'snapshot' })) {
      const confirm = this.renderRoot.querySelector('#confirm');
      (confirm as InternalConfirmDialog).show(evt.currentTarget as HTMLElement);
    } else {
      this.submit();
    }
  }

  private __handleConfirmHide(evt: CustomEvent) {
    if (!evt.detail.cancelled) this.delete();
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }
}
