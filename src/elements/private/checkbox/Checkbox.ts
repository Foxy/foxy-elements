import '@vaadin/vaadin-checkbox';
import { property, html } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';
import { interpret } from 'xstate';
import { CheckboxMachine } from './CheckboxMachine';
import { CheckboxChangeEvent } from './CheckboxChangeEvent';

// function test() {
//   const checkbox = document.createElement('vaadin-checkbox');
//   document.body.appendChild(checkbox);

//   checkbox.click();
//   checkbox.disabled = true;
//   checkbox.checked = true;

//   console.assert(checkbox.checked === true);
// }

export class Checkbox extends Themeable {
  public static get scopedElements() {
    return {
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
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

  @property({ type: Boolean, noAccessor: true })
  public get checked() {
    return this.__service.state.matches('checked');
  }
  public set checked(value: boolean) {
    if (value !== this.checked) this.__service.send('FORCE_TOGGLE');
  }

  @property({ type: Boolean, noAccessor: true })
  public get disabled() {
    const states = ['checked.disabled', 'unchecked.disabled'];
    return states.some(state => this.__service.state.matches(state));
  }
  public set disabled(value: boolean) {
    this.__service.send(value ? 'DISABLE' : 'ENABLE');
  }

  public render() {
    return html`
      <vaadin-checkbox
        class="w-full"
        style="margin-left: -3px"
        data-testid="input"
        .checked=${this.checked}
        .disabled=${this.disabled}
        @change=${(evt: Event) => [evt.stopPropagation(), this.__service.send('TOGGLE')]}
      >
        <div style="padding-left: 0.5rem">
          <slot></slot>
        </div>
      </vaadin-checkbox>

      <div style="padding-left: 2.2rem">
        <slot name="content"></slot>
      </div>
    `;
  }
}
