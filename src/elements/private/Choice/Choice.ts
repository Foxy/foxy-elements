import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-text-field/vaadin-text-field';

import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';

import { AttributePart } from 'lit-html';
import { ChoiceChangeEvent } from './ChoiceChangeEvent';
import { FrequencyInput } from '../FrequencyInput/FrequencyInput';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../mixins/translatable';
import { interpret } from 'xstate';
import { machine } from './machine';
import { spread } from '@open-wc/lit-helpers/src/spread';

const VALUE_OTHER = `@foxy.io/elements::other[${(Math.pow(10, 10) * Math.random()).toFixed(0)}]`;

/**
 * Renders the radio button input.
 *
 * @param readonly make the input readonly
 * @param disabled make the input disabled
 * @param checked whether the input is checked
 * @param attrs attributes for the input element
 * @param label user visible label
 * @param item the value of the item input
 * @returns rendered input
 */
function radio(
  readonly: boolean,
  disabled: boolean,
  checked: boolean,
  attrs: (part: AttributePart) => void,
  label: TemplateResult,
  item: string
) {
  const enabledBg = checked ? 'bg-primary' : 'bg-contrast-20 group-hover-bg-contrast-30';
  const disabledBg = checked ? 'bg-primary-50' : 'bg-contrast-10';
  const scale = checked ? 'scale-100' : 'scale-0';
  const color = disabled ? 'text-disabled' : readonly ? 'text-secondary' : 'text-body';
  const ease = 'transition ease-in-out duration-200';
  const dotBg = readonly ? 'bg-contrast-20' : 'bg-tint';
  const dot = `${ease} ${disabled || readonly ? '' : 'shadow-xs'} transform ${scale} ${dotBg}`;
  const bg = readonly ? '' : disabled ? disabledBg : enabledBg;
  const border = `border ${readonly ? 'border-contrast-20' : 'border-transparent'}`;

  return html`
    <label class="group flex items-start ${disabled || readonly ? '' : 'cursor-pointer'}">
      <div class="item flex items-center justify-center">
        <div class="flex radio rounded-full ${border} ${ease} ${bg} focus-within-shadow-outline">
          <div class="dot m-auto rounded-full ${dot}"></div>
          <input type="radio" class="sr-only" .checked=${checked} ...=${attrs} />
        </div>
      </div>
      <div class="font-lumo w-full leading-m ${color}">
        ${label} ${checked ? html`<slot name=${`${item}-conditional`}></slot>` : ``}
      </div>
    </label>
  `;
}

/**
 * Renders the checkbox input.
 *
 * @param readonly make the input readonly
 * @param disabled make the input disabled
 * @param checked whether the input is checked
 * @param attrs attributes for the input element
 * @param label user visible label
 * @param item the value of the item input
 * @returns rendered input
 */
function check(
  readonly: boolean,
  disabled: boolean,
  checked: boolean,
  attrs: (part: AttributePart) => void,
  label: TemplateResult,
  item: string
) {
  const enabledBg = checked ? 'bg-primary' : 'bg-contrast-20 group-hover-bg-contrast-30';
  const disabledBg = checked ? 'bg-primary-50' : 'bg-contrast-10';
  const scale = checked ? 'scale-100' : 'scale-0';
  const color = disabled ? 'text-disabled' : readonly ? 'text-secondary' : 'text-body';
  const ease = 'transition ease-in-out duration-200';
  const dot = `${ease} transform ${scale} ${readonly ? 'text-contrast-20' : 'text-tint'}`;
  const bg = readonly ? '' : disabled ? disabledBg : enabledBg;
  const border = `border ${readonly ? 'border-contrast-20' : 'border-transparent'}`;
  return html`
    <label class="group flex items-start ${disabled || readonly ? '' : 'cursor-pointer'}">
      <div class="item flex items-center justify-center text-primary-contrast">
        <div class="check rounded-s ${border} ${ease} ${bg} focus-within-shadow-outline">
          <iron-icon icon="lumo:checkmark" class="block w-full h-full ${dot}"></iron-icon>
          <input type="checkbox" class="sr-only" .checked=${checked} ...=${attrs} />
        </div>
      </div>
      <div class="font-lumo w-full leading-m ${color}">${label}</div>
      ${checked ? html`<slot name=${`${item}-conditional`}></slot>` : ``}
    </label>
  `;
}

export class Choice extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-frequency-input': FrequencyInput,
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

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultCustomValue: { type: String, attribute: 'default-custom-value' },
      disabled: { type: Boolean },
      readonly: { type: Boolean },
      custom: { type: Boolean },
      type: { type: String },
      min: { type: Number },
      max: { type: Number },
      value: { type: Array },
      items: { type: Array },
      getText: { attribute: false },
    };
  }

  public getText: (value: string) => string = v => v;

  private __service = interpret(machine)
    .onChange(() => this.requestUpdate())
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .start();

  public get defaultCustomValue(): string {
    return this.__service.state.context.defaultCustomValue;
  }

  public set defaultCustomValue(data: string) {
    this.__service.send('SET_DEFAULT_CUSTOM_VALUE', { data });
  }

  public get readonly(): boolean {
    return this.__service.state.matches('mutability.readonly');
  }

  public set readonly(data: boolean) {
    this.__service.send('SET_READONLY', { data });
  }

  public get disabled(): boolean {
    return this.__service.state.matches('interactivity.disabled');
  }

  public set disabled(data: boolean) {
    this.__service.send('SET_DISABLED', { data });
  }

  public get custom(): boolean {
    return this.__service.state.matches('extension.present');
  }

  public set custom(data: boolean) {
    this.__service.send('SET_CUSTOM', { data });
  }

  public get type(): 'text' | 'textarea' | 'integer' | 'frequency' {
    return this.__service.state.context.type;
  }

  public set type(data: 'text' | 'textarea' | 'integer' | 'frequency') {
    this.__service.send('SET_TYPE', { data });
  }

  public get min(): number | null {
    return this.__service.state.context.min;
  }

  public set min(data: number | null) {
    this.__service.send('SET_MIN', { data });
  }

  public get max(): number | null {
    return this.__service.state.context.max;
  }

  public set max(data: number | null) {
    this.__service.send('SET_MAX', { data });
  }

  public get value(): null | string | string[] {
    return this.__service.state.context.value;
  }

  public set value(data: null | string | string[]) {
    this.__service.send('SET_VALUE', { data });
  }

  public get items(): string[] {
    return this.__service.state.context.items;
  }

  public set items(data: string[]) {
    this.__service.send('SET_ITEMS', { data });
  }

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

        const disabled = this.disabled || !this._isI18nReady;

        const attributes = spread({
          '?disabled': disabled || this.readonly,
          '@change': (evt: Event) => {
            const checked = (evt.target as HTMLInputElement).checked;
            const newItem = item === VALUE_OTHER ? this.defaultCustomValue : item;
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
          'data-testid': `item-${item}`,
          'name': multiple ? item : 'choice',
          'value': other ? VALUE_OTHER : item,
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

          ${multiple
            ? check(this.readonly, disabled, checked, attributes, label, item)
            : radio(this.readonly, disabled, checked, attributes, label, item)}

          <div class="mr-m ml-xxl">
            ${item === VALUE_OTHER && otherChecked ? this.__field : ''}
            ${item !== VALUE_OTHER ? html`<slot name=${item}></slot>` : ''}
          </div>
        `;
      })}
    `;

    return html`<form>${children}</form> `;
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
      '?disabled': this.disabled,
      '?readonly': this.readonly,
      '@change': handleInput,
      'class': 'w-full mb-m',
      'data-testid': 'field',
      'max': this.max,
      'min': this.min,
      'placeholder': this._t('choice.other').toString(),
      'value': this.__service.state.context.customValue,
    });

    if (this.type === 'frequency') {
      return html`<x-frequency-input ...=${attributes}></x-frequency-input>`;
    } else if (this.type === 'integer') {
      return html`<vaadin-integer-field ...=${attributes} has-controls></vaadin-integer-field>`;
    } else if (this.type === 'textarea') {
      return html`<vaadin-text-area ...=${attributes}></vaadin-text-area>`;
    } else {
      return html`<vaadin-text-field ...=${attributes}></vaadin-text-field>`;
    }
  }
}
