import { CSSResult, CSSResultArray, LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export class SwitchChangeEvent extends CustomEvent<boolean> {
  constructor(detail: boolean) {
    super('change', { detail });
  }
}

export class Switch extends LitElement {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      checked: { attribute: false },
      disabled: { attribute: false },
    };
  }

  public static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  public disabled = false;

  public checked = false;

  public render(): TemplateResult {
    return html`
      <label
        class=${classMap({
          'transition duration-200 flex justify-between items-center group': true,
          'cursor-pointer': !this.disabled,
        })}
      >
        <span class="text-body text-m mr-m">
          <slot></slot>
        </span>

        <span
          style="border-radius: var(--lumo-size-xl); width: calc((var(--lumo-space-l) * 2) + (var(--lumo-space-xs) * 2))"
          class=${classMap({
            'bg-contrast-10 focus-within-shadow-outline': this.disabled || !this.checked,
            'bg-contrast-20': !this.disabled && !this.checked,
            'bg-success focus-within-shadow-outline-success': !this.disabled && this.checked,
            'transition duration-150 relative flex flex-shrink-0 items-center': true,
          })}
        >
          <span
            style="width: var(--lumo-space-l); height: var(--lumo-space-l)"
            class=${classMap({
              'bg-tint transition duration-200 transform block rounded-full m-xs': true,
              'translate-x-l': this.checked,
              'translate-x-0': !this.checked,
              'shadow-xs group-hover-shadow-s group-hover-scale-110': !this.disabled,
            })}
          ></span>

          <input
            type="checkbox"
            class="opacity-0 absolute inset-0"
            .checked=${this.checked}
            .disabled=${this.disabled}
            @change=${() => {
              this.checked = !this.checked;
              this.dispatchEvent(new SwitchChangeEvent(this.checked));
            }}
          />
        </span>
      </label>
    `;
  }
}
