import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import { html, property } from 'lit-element';
import { actions, interpret } from 'xstate/dist/xstate.web.js';
import { Themeable } from '../../../mixins/themeable';
import { ChoiceChangeEvent } from './ChoiceChangeEvent';
import { ChoiceContext, ChoiceMachine } from './ChoiceMachine';

export class Choice extends Themeable {
  public static get scopedElements() {
    return {
      'vaadin-radio-button': customElements.get('vaadin-radio-button'),
      'vaadin-radio-group': customElements.get('vaadin-radio-group'),
    };
  }

  private readonly __machine = ChoiceMachine.withConfig({
    actions: {
      choose: actions.assign({
        value: (ctx, evt) => {
          if (evt.type !== 'CHOOSE') return ctx.value;
          this.dispatchEvent(new ChoiceChangeEvent(evt.value));
          return evt.value;
        },
      }),
      init: actions.assign({
        getText: (ctx, evt) => (evt.type === 'INIT' && evt.getText ? evt.getText : ctx.getText),
        items: (ctx, evt) => (evt.type === 'INIT' && evt.items ? evt.items : ctx.items),
        value: (ctx, evt) => (evt.type === 'INIT' && evt.value ? evt.value : ctx.value),
      }),
    },
  });

  private readonly __service = interpret(this.__machine)
    .onTransition(state => state.changed && this.requestUpdate())
    .start();

  @property({ type: Boolean, noAccessor: true })
  public get disabled() {
    return this.__service.state.matches('disabled');
  }
  public set disabled(value: boolean) {
    this.__service.send(value ? 'DISABLE' : 'ENABLE');
  }

  @property({ type: String, noAccessor: true })
  public get value() {
    return this.__service.state.context.value;
  }
  public set value(value: ChoiceContext['value']) {
    this.__service.send({ type: 'INIT', value });
  }

  @property({ type: Array, noAccessor: true })
  public get items() {
    return this.__service.state.context.items;
  }
  public set items(items: ChoiceContext['items']) {
    this.__service.send({ type: 'INIT', items });
  }

  @property({ type: Object, noAccessor: true })
  public get getText() {
    return this.__service.state.context.getText;
  }
  public set getText(getText: ChoiceContext['getText']) {
    this.__service.send({ type: 'INIT', getText });
  }

  public render() {
    return html`
      <vaadin-radio-group class="w-full" style="padding: 8px 0 0 13px">
        ${this.items.map(
          (item, index) => html`
            ${index > 0
              ? html`<div class="border-t border-contrast-10" style="margin: 8px 0 8px 35px"></div>`
              : ''}

            <vaadin-radio-button
              class="w-full"
              value=${item}
              data-testid=${`item-${item}`}
              ?checked=${this.value === item}
              .disabled=${this.disabled}
              @keydown=${this.__overrideFocus}
              @change=${(evt: Event) => {
                if ((evt.target as HTMLInputElement).checked) {
                  this.__service.send({ type: 'CHOOSE', value: item });
                }
              }}
            >
              <div style="margin-left: 5px">
                <slot name=${`${item}-label`}>
                  ${this.getText(item)}
                </slot>
              </div>
            </vaadin-radio-button>

            <div class="pr-m mt-s" style="padding-left: 35px">
              <slot name=${item}></slot>
            </div>

            <div class="mt-s"></div>
          `
        )}
      </vaadin-radio-group>
    `;
  }

  private __overrideFocus(evt: KeyboardEvent) {
    if (!evt.key.startsWith('Arrow')) return;

    let target = evt.target as HTMLInputElement | null;
    const targetTagName = target!.tagName;

    evt.preventDefault();
    evt.stopImmediatePropagation();

    while (target) {
      target = (evt.key === 'ArrowUp' || evt.key === 'ArrowLeft'
        ? target.previousElementSibling
        : target.nextElementSibling) as HTMLInputElement | null;

      if (target?.tagName === targetTagName) {
        target.click();
        target.focus();
        break;
      }
    }
  }
}
