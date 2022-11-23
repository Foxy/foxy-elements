import type { SubscriptionSettingsForm } from '../../SubscriptionSettingsForm';
import type { RadioGroupElement } from '@vaadin/vaadin-radio-button/vaadin-radio-group';
import type { TemplateResult } from 'lit-html';
import type { CSSResultArray } from 'lit-element';
import type { Item } from '../../../../internal/InternalEditableListControl/types';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { html } from 'lit-html';
import { css } from 'lit-element';

export class InternalSubscriptionSettingsFormReattemptBypass extends InternalEditableControl {
  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .visible-if-checked {
          display: none;
        }

        [checked] .visible-if-checked {
          display: block;
        }
      `,
    ];
  }

  nucleon: SubscriptionSettingsForm | null = null;

  private __getReattemptBypassStringsValue = () => {
    const strings = this.nucleon?.form.reattempt_bypass_strings?.split(',') ?? [];

    return strings
      .map(text => text.trim())
      .filter((text, index, strings) => text && strings.indexOf(text) === index)
      .map(text => ({ value: text }));
  };

  private __setReattemptBypassStringsValue = (newValue: Item[]) => {
    type Logic = 'skip_if_exists' | 'reattempt_if_exists';

    const group = this.renderRoot.querySelector('vaadin-radio-group');
    const logic = (group?.value ?? 'reattempt_if_exists') as Logic;

    this.nucleon?.edit({
      reattempt_bypass_strings: newValue.map(({ value }) => value).join(),
      reattempt_bypass_logic: logic,
    });
  };

  renderControl(): TemplateResult {
    const reattemptBypassStringsTemplate = html`
      <foxy-internal-editable-list-control
        infer="reattempt-bypass-strings"
        class="w-full visible-if-checked"
        .getValue=${this.__getReattemptBypassStringsValue}
        .setValue=${this.__setReattemptBypassStringsValue}
        @mousedown=${(evt: MouseEvent) => evt.stopPropagation()}
        @mouseup=${(evt: MouseEvent) => evt.stopPropagation()}
        @keydown=${(evt: MouseEvent) => evt.stopPropagation()}
        @click=${(evt: MouseEvent) => (evt.preventDefault(), evt.stopPropagation())}
      >
      </foxy-internal-editable-list-control>
    `;

    let groupValue: string | undefined = void 0;

    const nucleon = this.nucleon;
    const reattemptBypassLogic = nucleon?.form.reattempt_bypass_logic;
    const reattemptBypassStrings = nucleon?.form.reattempt_bypass_strings;

    if (reattemptBypassStrings) {
      groupValue = reattemptBypassLogic;
    } else if (reattemptBypassLogic === 'reattempt_if_exists') {
      groupValue = 'never_reattempt';
    } else if (reattemptBypassLogic === 'skip_if_exists') {
      groupValue = 'always_reattempt';
    }

    return html`
      <vaadin-radio-group
        helper-text=${this.helperText}
        label=${this.label}
        class="foxy-internal-subscription-settings-form-reattempt-bypass w-full divide-y divide-contrast-10 group"
        theme="vertical"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .value=${groupValue}
        @value-changed=${this.__handleGroupValueChanged}
      >
        <vaadin-radio-button
          class="foxy-internal-subscription-settings-form-reattempt-bypass p-s w-full space-y-m transition-colors group-hover-divide-contrast-20"
          value="reattempt_if_exists"
        >
          <foxy-i18n infer="" key="option_reattempt_if_exists"></foxy-i18n>
          ${reattemptBypassStringsTemplate}
        </vaadin-radio-button>

        <vaadin-radio-button
          class="foxy-internal-subscription-settings-form-reattempt-bypass p-s w-full space-y-m transition-colors group-hover-divide-contrast-20"
          value="skip_if_exists"
        >
          <foxy-i18n infer="" key="option_skip_if_exists"></foxy-i18n>
          ${reattemptBypassStringsTemplate}
        </vaadin-radio-button>

        <vaadin-radio-button
          class="foxy-internal-subscription-settings-form-reattempt-bypass p-s w-full space-y-m transition-colors group-hover-divide-contrast-20"
          value="always_reattempt"
        >
          <foxy-i18n infer="" key="option_always_reattempt"></foxy-i18n>
        </vaadin-radio-button>

        <vaadin-radio-button
          class="foxy-internal-subscription-settings-form-reattempt-bypass p-s w-full space-y-m transition-colors group-hover-divide-contrast-20"
          value="never_reattempt"
        >
          <foxy-i18n infer="" key="option_never_reattempt"></foxy-i18n>
        </vaadin-radio-button>
      </vaadin-radio-group>
    `;
  }

  private __handleGroupValueChanged(evt: CustomEvent) {
    const value = (evt.currentTarget as RadioGroupElement).value;
    const nucleon = this.nucleon;

    if (value === 'never_reattempt' || value === 'always_reattempt') {
      if (value === 'never_reattempt') {
        if (nucleon?.form.reattempt_bypass_logic !== 'reattempt_if_exists') {
          nucleon?.edit({ reattempt_bypass_logic: 'reattempt_if_exists' });
        }
      } else {
        if (nucleon?.form.reattempt_bypass_logic !== 'skip_if_exists') {
          nucleon?.edit({ reattempt_bypass_logic: 'skip_if_exists' });
        }
      }

      if (nucleon?.form.reattempt_bypass_strings) nucleon?.edit({ reattempt_bypass_strings: '' });
    }
  }
}
