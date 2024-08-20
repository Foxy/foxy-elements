import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, PropertyDeclarations, svg, TemplateResult } from 'lit-element';
import { classMap } from '../../../utils/class-map';

export class InternalSwitchControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      helperTextAsToolip: { type: Boolean, attribute: 'helper-text-as-tooltip' },
      invert: { type: Boolean },
    };
  }

  helperTextAsToolip = false;

  invert = false;

  renderControl(): TemplateResult {
    const checked = this.invert ? !this._value : !!this._value;
    return html`
      <div class="flex items-start gap-s leading-xs text-m">
        <div class="flex-1">
          <label class="text-m text-body" for="input">${this.label}</label>
          ${this.helperTextAsToolip
            ? ''
            : html`<p class="text-xs text-secondary">${this.helperText}</p>`}
          <p class="text-xs text-error" ?hidden=${this.disabled || this.readonly}>
            ${this._errorMessage}
          </p>
        </div>

        ${this.readonly
          ? html`<p class="text-secondary">${checked ? this.t('checked') : this.t('unchecked')}</p>`
          : html`
              <div style="height: calc(1em * var(--lumo-line-height-xs))" class="flex items-center">
                <div
                  style="border-radius: var(--lumo-size-xl); width: calc((1em * var(--lumo-line-height-xs)) - 3px + var(--lumo-space-m))"
                  class=${classMap({
                    'cursor-pointer group transition-colors relative': true,
                    'flex flex-shrink-0 items-center': true,
                    'bg-success': !this.disabled && checked,
                    'bg-contrast-20 hover-bg-contrast-30': !this.disabled && !checked,
                    'bg-contrast-10': this.disabled,
                    'focus-within-ring-2 focus-within-ring-primary-50': true,
                  })}
                  @click=${() => (this._value = !this._value)}
                >
                  <div
                    style="margin: 1.5px; width: calc((1em * var(--lumo-line-height-xs)) - 6px); height: calc((1em * var(--lumo-line-height-xs)) - 6px)"
                    class=${classMap({
                      'transition-all transform block rounded-full': true,
                      'translate-x-m': checked,
                      'translate-x-0': !checked,
                      'bg-base': this.disabled,
                      'bg-tint': !this.disabled,
                    })}
                  ></div>

                  <input
                    class="opacity-0 absolute inset-0 focus-outline-none"
                    type="checkbox"
                    id="input"
                    switch
                    ?disabled=${this.disabled}
                    ?readonly=${this.readonly}
                    ?checked=${checked}
                    @change=${(evt: Event) => {
                      const checkbox = evt.currentTarget as HTMLInputElement;
                      this._value = this.invert ? !checkbox.checked : checkbox.checked;
                    }}
                  />
                </div>
              </div>
            `}
        ${this.helperTextAsToolip && this.helperText
          ? html`
              <div
                class="transition-colors text-tertiary flex-shrink-0 cursor-pointer hover-text-body"
                id="trigger"
              >
                ${svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: calc(1em * var(--lumo-line-height-xs)); height: calc(1em * var(--lumo-line-height-xs)); margin-right: -0.12em"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>`}
              </div>
              <vcf-tooltip
                for="trigger"
                style="--lumo-base-color: black; max-width: 30rem"
                class="mt-s"
                theme="light"
                position="bottom"
              >
                <span class="text-s" style="color: white">${this.helperText}</span>
              </vcf-tooltip>
            `
          : ''}
      </div>
    `;
  }
}
