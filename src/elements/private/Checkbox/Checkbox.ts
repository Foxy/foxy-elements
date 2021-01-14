import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';

import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';

import { CheckboxChangeEvent } from './CheckboxChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export class Checkbox extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public static get styles(): CSSResultArray {
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

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      checked: { type: Boolean },
      disabled: { type: Boolean },
    };
  }

  public disabled = false;

  public checked = false;

  public render(): TemplateResult {
    return html`
      <label class="flex group cursor-pointer">
        <div
          class=${classMap({
            'transition ease-in-out duration-200 flex-shrink-0 check rounded-s text-primary-contrast focus-within:shadow-outline': true,
            'bg-primary': this.checked && !this.disabled,
            'bg-primary-50': this.checked && this.disabled,
            'bg-contrast-20 group-hover:bg-contrast-30': !this.checked && !this.disabled,
            'bg-contrast-5': !this.checked && this.disabled,
          })}
        >
          <iron-icon
            icon="lumo:checkmark"
            class=${classMap({
              'transform transition ease-in-out duration-200 block w-full h-full': true,
              'scale-100': this.checked,
              'scale-0': !this.checked,
            })}
          >
          </iron-icon>

          <input
            type="checkbox"
            class="sr-only"
            .checked=${this.checked}
            ?disabled=${this.disabled}
            data-testid="input"
            @change=${(evt: Event) => {
              evt.stopPropagation();
              const newValue = (evt.target as HTMLInputElement).checked;
              this.checked = newValue;
              this.dispatchEvent(new CheckboxChangeEvent(newValue));
            }}
          />
        </div>

        <div
          class=${classMap({
            'font-lumo leading-m -mt-xs ml-m': true,
            'text-disabled': this.disabled,
            'text-body': !this.disabled,
          })}
        >
          <slot></slot>
        </div>
      </label>

      <div class="font-lumo ${this.disabled ? 'text-tertiary' : 'text-body'} ml-xxl">
        <slot name="content"></slot>
      </div>
    `;
  }
}
