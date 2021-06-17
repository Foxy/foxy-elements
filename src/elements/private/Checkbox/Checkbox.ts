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
import { CheckboxMachine } from './CheckboxMachine';
import { Themeable } from '../../../mixins/themeable';
import { interpret } from 'xstate';

export class Checkbox extends LitElement {
  public static get styles(): CSSResultArray {
    return [
      Themeable.styles,
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
      checked: { noAccessor: true, type: Boolean },
      disabled: { noAccessor: true, type: Boolean },
    };
  }

  private readonly __machine = CheckboxMachine.withConfig({
    actions: {
      sendChange: () => {
        this.dispatchEvent(new CheckboxChangeEvent(this.checked));
      },
    },
  });

  private readonly __service = interpret(this.__machine)
    .onTransition(state => state.changed && this.requestUpdate())
    .start();

  public get checked(): boolean {
    return this.__service.state.matches('checked');
  }

  public set checked(value: boolean) {
    if (value !== this.checked) this.__service.send('FORCE_TOGGLE');
  }

  public get disabled(): boolean {
    const states = ['checked.disabled', 'unchecked.disabled'];
    return states.some(state => this.__service.state.matches(state));
  }

  public set disabled(value: boolean) {
    this.__service.send(value ? 'DISABLE' : 'ENABLE');
  }

  public render(): TemplateResult {
    const checked = this.checked;
    const ease = 'transition ease-in-out duration-200';
    const box = `${ease} ${checked ? 'bg-primary' : 'bg-contrast-20 group-hover-bg-contrast-30'}`;
    const dot = `${ease} transform ${checked ? 'scale-100' : 'scale-0'}`;

    return html`
      <label class="flex group cursor-pointer">
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
            @change=${(evt: Event) => [evt.stopPropagation(), this.__service.send('TOGGLE')]}
          />
        </div>
        <div class="font-lumo text-body leading-m -mt-xs ml-m">
          <slot></slot>
        </div>
      </label>

      <div class="font-lumo ${this.disabled ? 'text-tertiary' : 'text-body'} ml-xxl">
        <slot name="content"></slot>
      </div>
    `;
  }
}
