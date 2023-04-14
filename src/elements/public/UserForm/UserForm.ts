import type { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import type { ScopedElementsMap } from '@open-wc/scoped-elements';
import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { validate as isEmail } from 'email-validator';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Checkbox } from '../../private/Checkbox/Checkbox';
import { Group } from '../../private/Group/Group';
import { roles } from './roles';
import { html } from 'lit-html';

import memoize from 'lodash-es/memoize';

const Base = ScopedElementsMixin(ResponsiveMixin(TranslatableMixin(InternalForm, 'user-form')));

/**
 * Form element for `fx:user` resources.
 *
 * @slot first-name:before – new in v1.22.0
 * @slot first-name:after – new in v1.22.0
 * @slot last-name:before – new in v1.22.0
 * @slot last-name:after – new in v1.22.0
 * @slot email:before – new in v1.22.0
 * @slot email:after – new in v1.22.0
 * @slot phone:before – new in v1.22.0
 * @slot phone:after – new in v1.22.0
 * @slot role:before – new in v1.22.0
 * @slot role:after – new in v1.22.0
 * @slot create:before – new in v1.22.0
 * @slot create:after – new in v1.22.0
 * @slot delete:before – new in v1.22.0
 * @slot delete:after – new in v1.22.0
 *
 * @element foxy-user-form
 * @since 1.3.0
 */
export class UserForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
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
      ({ email: v }) => !v || v.length <= 100 || 'email_too_long',
      ({ email: v }) => !v || isEmail(v) || 'email_invalid_email',
      ({ phone: v }) => !v || v.length <= 50 || 'phone_too_long',
    ];
  }

  templates: Templates = {};

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private __bindField = memoize((key: keyof Data) => {
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.edit({ [key]: target.value });
    };
  });

  renderBody(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const action = this.href ? 'delete' : 'create';
    const fields = ['first_name', 'last_name', 'email', 'phone'] as const;

    return html`
      <div class="grid sm-grid-cols-2 gap-m">
        ${fields.map(field => this.__renderField(field))}
        ${hiddenSelector.matches('role', true) ? '' : this.__renderRole()}
        ${hiddenSelector.matches(action, true) ? '' : this.__renderAction()}
      </div>
    `;
  }

  private __renderField(property: keyof Data) {
    const control = property.replace('_', '-');
    if (this.hiddenSelector.matches(control)) return;

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${control}:before`)}

        <vaadin-text-field
          error-message=${this.__getErrorMessage(property)}
          data-testid=${property}
          label=${this.t(property)}
          class="w-full"
          value=${ifDefined((this.form as any)[property])}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches(control, true)}
          ?readonly=${this.readonlySelector.matches(control, true)}
          .checkValidity=${this.__getValidator(property)}
          @input=${this.__bindField(property)}
          @keydown=${this.__handleKeyDown}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot(`${control}:after`)}
      </div>
    `;
  }

  private __renderRole() {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('role', true);

    return html`
      <div class="sm-col-span-2">
        ${this.renderTemplateOrSlot('role:before')}

        <x-group data-testid="role" frame>
          ${roles.map(
            (role, index) => html`
              <hr
                class=${index > 0 ? 'border-contrast-10' : 'hidden'}
                style="margin-left: calc((var(--lumo-space-m) * 2) + 1.125rem)"
              />

              <x-checkbox
                data-testclass="role-option"
                class="w-full p-m"
                ?readonly=${this.readonlySelector.matches('role', true)}
                ?disabled=${isDisabled}
                ?checked=${this.form[role.property]}
                @change=${(evt: CustomEvent) => {
                  const checkbox = evt.currentTarget as Checkbox;
                  this.edit({ [role.property]: checkbox.checked });
                }}
              >
                <div class="flex items-start leading-s">
                  <div class="flex-1 flex flex-col">
                    <foxy-i18n key=${role.key} infer=""></foxy-i18n>
                    <foxy-i18n
                      class="text-s ${isDisabled ? '' : 'text-secondary'}"
                      infer=""
                      key="${role.key}_explainer"
                    >
                    </foxy-i18n>
                  </div>

                  <div class="mt-xs" style="width: 1.125rem; height: 1.125rem;">${role.icon}</div>
                </div>
              </x-checkbox>
            `
          )}
        </x-group>

        ${this.renderTemplateOrSlot('role:after')}
      </div>
    `;
  }

  private __renderAction() {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;
    const action = this.href ? 'delete' : 'create';
    const isActionDisabled =
      (this.in({ idle: 'template' }) && !isValid) ||
      this.in('busy') ||
      this.in('fail') ||
      this.disabledSelector.matches(action, true);

    return html`
      <div class="sm-col-span-2">
        ${this.renderTemplateOrSlot(`${action}:before`)}

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

        <vaadin-button
          data-testid=${action}
          theme=${this.in('idle') ? `${this.href ? 'error' : 'primary success'}` : ''}
          class="w-full"
          ?disabled=${isActionDisabled}
          @click=${this.__handleActionClick}
        >
          <foxy-i18n lang=${this.lang} key=${action} ns=${this.ns}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot(`${action}:after`)}
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
