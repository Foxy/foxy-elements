import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';

import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { CheckboxChangeEvent } from './CheckboxChangeEvent';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';

export class Checkbox extends ConfigurableMixin(ThemeableMixin(LitElement)) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      checked: { type: Boolean },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .ml-xxl {
          margin-left: calc(var(--lumo-space-m) + 1.125rem);
        }

        .check {
          height: 1.125rem;
          width: 1.125rem;
        }
      `,
    ];
  }

  checked = false;

  render(): TemplateResult {
    const checked = this.checked;
    const ease = 'transition-colors ease-in-out duration-200';
    const box = `${ease} ${checked ? 'bg-primary' : 'bg-contrast-20 group-hover-bg-contrast-30'}`;
    const dot = `${ease} transform ${checked ? 'scale-100' : 'scale-0'}`;

    return html`
      <label
        class="flex group transition-opacity ${this.disabled
          ? 'cursor-default opacity-50'
          : 'cursor-pointer'}"
      >
        <div
          class="flex-shrink-0 check rounded-s ${box} text-primary-contrast focus-within-shadow-outline"
        >
          <iron-icon icon="lumo:checkmark" class="block w-full h-full ${dot}"></iron-icon>
          <input
            type="checkbox"
            class="sr-only"
            .checked=${checked}
            ?disabled=${this.disabled}
            data-testid="input"
            @change=${(evt: Event) => {
              evt.stopPropagation();
              this.checked = !this.checked;
              this.dispatchEvent(new CheckboxChangeEvent(this.checked));
            }}
          />
        </div>

        <div class="flex-1 font-lumo text-body leading-m -mt-xs ml-m">
          <slot></slot>
        </div>
      </label>

      <div class="font-lumo ${this.disabled ? 'text-tertiary' : 'text-body'} ml-xxl">
        <slot name="content"></slot>
      </div>
    `;
  }
}
