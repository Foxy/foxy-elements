import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-checkbox';
import { html, property, TemplateResult } from 'lit-element';
import { interpret } from 'xstate';
import { Themeable } from '../../../mixins/themeable';
import { CheckboxChangeEvent } from './CheckboxChangeEvent';
import { CheckboxMachine } from './CheckboxMachine';

export class Checkbox extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
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
    return html`
      <vaadin-checkbox
        class="w-full"
        style="margin-left: -3px"
        data-testid="input"
        .checked=${this.checked}
        .disabled=${this.disabled}
        @change=${(evt: Event) => [evt.stopPropagation(), this.__service.send('TOGGLE')]}
      >
        <div class="font-lumo text-body" style="padding-left: 0.5rem">
          <slot></slot>
        </div>
      </vaadin-checkbox>

      <div class="font-lumo text-body" style="padding-left: 2.2rem">
        <slot name="content"></slot>
      </div>
    `;
  }
}
