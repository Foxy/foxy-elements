import { spread } from '@open-wc/lit-helpers/src/spread';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { css, CSSResultArray, html, property, TemplateResult } from 'lit-element';
import { AttributePart } from 'lit-html';
import { interpret } from 'xstate';
import { Translatable } from '../../../mixins/translatable';
import { ChoiceChangeEvent } from './ChoiceChangeEvent';
import { machine } from './machine';

const VALUE_OTHER = `@foxy.io/elements::other[${(Math.pow(10, 10) * Math.random()).toFixed(0)}]`;

function radio(checked: boolean, attrs: (part: AttributePart) => void, label: TemplateResult) {
  const ease = 'transition ease-in-out duration-200';
  const box = `${ease} ${checked ? 'bg-primary' : 'bg-contrast-20 group-hover:bg-contrast-30'}`;
  const dot = `${ease} transform ${checked ? 'scale-100' : 'scale-0'}`;

  return html`
    <label class="group flex items-center cursor-pointer">
      <div class="item flex items-center justify-center">
        <div class="flex radio rounded-full ${box} focus-within:shadow-outline">
          <div class="dot m-auto rounded-full bg-tint shadow-xs ${dot}"></div>
          <input type="radio" class="sr-only" .checked=${checked} ...=${attrs} />
        </div>
      </div>
      <div class="font-lumo text-body leading-m">${label}</div>
    </label>
  `;
}

function check(checked: boolean, attrs: (part: AttributePart) => void, label: TemplateResult) {
  const ease = 'transition ease-in-out duration-200';
  const box = `${ease} ${checked ? 'bg-primary' : 'bg-contrast-20 group-hover:bg-contrast-30'}`;
  const dot = `${ease} transform ${checked ? 'scale-100' : 'scale-0'}`;

  return html`
    <label class="group flex items-center cursor-pointer">
      <div class="item flex items-center justify-center text-primary-contrast">
        <div class="check rounded-s ${box} focus-within:shadow-outline">
          <iron-icon icon="lumo:checkmark" class="block w-full h-full ${dot}"></iron-icon>
          <input type="checkbox" class="sr-only" .checked=${checked} ...=${attrs} />
        </div>
      </div>
      <div class="font-lumo text-body leading-m">${label}</div>
    </label>
  `;
}

export class Choice extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          --item-width: calc((var(--lumo-space-m) * 2) + 1.25rem);
        }

        .ml-xxl {
          margin-left: var(--item-width);
        }

        .item {
          height: var(--lumo-size-l);
          width: var(--item-width);
        }

        .radio {
          height: 1.25rem;
          width: 1.25rem;
        }

        .check {
          height: 1.125rem;
          width: 1.125rem;
        }

        .dot {
          height: 0.5rem;
          width: 0.5rem;
        }
      `,
    ];
  }

  private get __field() {
    const handleInput = (evt: Event) => {
      evt.stopPropagation();
      const customValue = (evt.target as HTMLInputElement).value;

      if (Array.isArray(this.value)) {
        this.value = this.value.slice(0, this.value.length - 1).concat(customValue);
      } else {
        this.value = customValue;
      }

      this.dispatchEvent(new ChoiceChangeEvent(this.value));
    };

    const attributes = spread({
      placeholder: this._t('choice.other').toString(),
      class: 'w-full mb-m',
      value: this.__service.state.context.customValue,
      max: this.max,
      min: this.min,
      'data-testid': 'field',
      '@input': handleInput,
      '@change': handleInput,
    });

    if (this.type === 'integer') {
      return html`<vaadin-integer-field ...=${attributes} has-controls></vaadin-integer-field>`;
    } else if (this.type === 'textarea') {
      return html`<vaadin-text-area ...=${attributes}></vaadin-text-area>`;
    } else {
      return html`<vaadin-text-field ...=${attributes}></vaadin-text-field>`;
    }
  }

  private __service = interpret(machine)
    .onChange(() => this.requestUpdate())
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .start();

  @property({ type: Boolean })
  public get disabled(): boolean {
    return this.__service.state.matches('interactivity.disabled');
  }
  public set disabled(data: boolean) {
    this.__service.send('SET_DISABLED', { data });
  }

  @property({ type: Boolean })
  public get custom(): boolean {
    return this.__service.state.matches('extension.present');
  }
  public set custom(data: boolean) {
    this.__service.send('SET_CUSTOM', { data });
  }

  @property({ type: String })
  public get type(): 'text' | 'textarea' | 'integer' {
    return this.__service.state.context.type;
  }
  public set type(data: 'text' | 'textarea' | 'integer') {
    this.__service.send('SET_TYPE', { data });
  }

  @property({ type: Number })
  public get min(): number | null {
    return this.__service.state.context.min;
  }
  public set min(data: number | null) {
    this.__service.send('SET_MIN', { data });
  }

  @property({ type: Number })
  public get max(): number | null {
    return this.__service.state.context.max;
  }
  public set max(data: number | null) {
    this.__service.send('SET_MAX', { data });
  }

  @property({ type: Array })
  public get value(): null | string | string[] {
    return this.__service.state.context.value;
  }
  public set value(data: null | string | string[]) {
    this.__service.send('SET_VALUE', { data });
  }

  @property({ type: Array })
  public get items(): string[] {
    return this.__service.state.context.items;
  }
  public set items(data: string[]) {
    this.__service.send('SET_ITEMS', { data });
  }

  @property({ attribute: false })
  public getText: (value: string) => string = v => v;

  public render(): TemplateResult {
    const items = this.custom ? [...this.items, VALUE_OTHER] : this.items;
    const multiple = Array.isArray(this.value);
    const otherChecked = this.__service.state.matches('extension.present.selected');

    const children = html`
      ${items.map((item, index, array) => {
        const other = this.custom && index === array.length - 1;

        const checked = other
          ? otherChecked
          : multiple
          ? !!this.value?.includes(item)
          : item === String(this.value);

        const attributes = spread({
          value: other ? VALUE_OTHER : item,
          name: multiple ? item : 'choice',
          'data-testid': `item-${item}`,
          '?disabled': this.disabled,
          '@change': (evt: Event) => {
            const checked = (evt.target as HTMLInputElement).checked;
            const newItem = item === VALUE_OTHER ? '' : item;
            const value = this.value;

            if (Array.isArray(value)) {
              if (item === VALUE_OTHER) {
                this.value = checked ? [...value, newItem] : value.slice(0, value.length - 1);
              } else {
                this.value = checked ? [newItem, ...value] : value.filter(v => v !== newItem);
              }
            } else {
              this.value = checked ? newItem : null;
            }

            this.dispatchEvent(new ChoiceChangeEvent(this.value));
          },
        });

        const label = html`
          <div>
            ${item === VALUE_OTHER
              ? this._t('choice.other').toString()
              : html`<slot name=${`${item}-label`}>${this.getText(item)}</slot>`}
          </div>
        `;

        return html`
          <div class="ml-xxl border-t border-contrast-10 ${index ? '' : 'hidden'}"></div>

          ${multiple ? check(checked, attributes, label) : radio(checked, attributes, label)}

          <div class="mr-m ml-xxl">
            ${item === VALUE_OTHER && otherChecked ? this.__field : ''}
            ${item !== VALUE_OTHER ? html`<slot name=${item}></slot>` : ''}
          </div>
        `;
      })}
    `;

    return html`<form>${children}</form> `;
  }
}
