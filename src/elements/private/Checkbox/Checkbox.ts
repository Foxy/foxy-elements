import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';
import { css, CSSResultArray, html, property, TemplateResult } from 'lit-element';
import { interpret } from 'xstate';
import { Themeable } from '../../../mixins/themeable';
import { CheckboxChangeEvent } from './CheckboxChangeEvent';
import { CheckboxMachine } from './CheckboxMachine';

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

  @property({ type: Boolean, noAccessor: true })
  public get checked(): boolean {
    return this.__service.state.matches('checked');
  }
  public set checked(value: boolean) {
    if (value !== this.checked) this.__service.send('FORCE_TOGGLE');
  }

  @property({ type: Boolean, noAccessor: true })
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
    const box = `${ease} ${checked ? 'bg-primary' : 'bg-contrast-20 group-hover:bg-contrast-30'}`;
    const dot = `${ease} transform ${checked ? 'scale-100' : 'scale-0'}`;

    return html`
      <label class="flex group cursor-pointer">
        <div class="check rounded-s ${box} text-primary-contrast focus-within:shadow-outline">
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

      <div class="font-lumo text-body ml-xxl">
        <slot name="content"></slot>
      </div>
    `;
  }
}
