import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { classMap } from '../../../utils/class-map';

export class InternalSwitchControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      invert: { type: Boolean },
    };
  }

  invert = false;

  renderControl(): TemplateResult {
    const checked = this.invert ? !this._value : !!this._value;
    return html`
      <div class="flex items-center leading-xs">
        <div class="flex-1">
          <label class="text-m text-body" for="input">${this.label}</label>
          <p class="text-s text-secondary">${this.helperText}</p>
          <p class="text-s text-error" ?hidden=${this.disabled || this.readonly}>
            ${this._errorMessage}
          </p>
        </div>

        ${this.readonly
          ? html`<p class="text-secondary">${checked ? this.t('checked') : this.t('unchecked')}</p>`
          : html`
              <div style="height: 1em" class="flex items-center">
                <div
                  style="border-radius: var(--lumo-size-xl); width: calc((var(--lumo-space-m) * 2) + (var(--lumo-space-xs) * 2))"
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
                    style="width: var(--lumo-space-m); height: var(--lumo-space-m)"
                    class=${classMap({
                      'transition-all transform block rounded-full m-xs': true,
                      'translate-x-m': checked,
                      'translate-x-0': !checked,
                      'bg-base': this.disabled,
                      'bg-tint': !this.disabled,
                      'group-hover-scale-110': !this.disabled,
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
      </div>
    `;
  }
}
