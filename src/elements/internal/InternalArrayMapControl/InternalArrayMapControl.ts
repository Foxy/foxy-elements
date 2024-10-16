import type { CSSResultArray, TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { css, html, svg } from 'lit-element';
import { classMap } from '../../../utils/class-map';
import { repeat } from 'lit-html/directives/repeat';

type InputParams = { label: string; value: string; onChange: (newValue?: string) => void };
type RuleParams = { rule?: Rule; onChange: (newRule: Rule) => void; onDelete?: () => void };
type Rule = { key: string; items: string[] };

class InternalArrayMapControl extends ResponsiveMixin(InternalEditableControl) {
  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .gap-1px {
          gap: 1px;
        }

        .grid-vertical {
          grid-template: auto / var(--lumo-size-m) 1fr;
        }

        :host([sm]) .sm-grid-horizontal {
          grid-template: auto / var(--lumo-size-m) 1fr var(--lumo-size-m) 1fr;
        }
      `,
    ];
  }

  renderControl(): TemplateResult {
    const divider = html`
      <div class="flex items-center h-s">
        <div class="w-m text-center leading-none uppercase font-medium text-xs text-contrast-20">
          <foxy-i18n infer="" key="or"></foxy-i18n>
        </div>

        <div class="flex-1 border-t border-contrast-10"></div>
        <div class="w-m ml-s flex-shrink-0"></div>
      </div>
    `;

    return html`
      <div class="mb-s" ?hidden=${!this.label && !this.helperText}>
        <p class="font-medium text-body text-l" ?hidden=${!this.label}>${this.label}</p>
        <p class="text-s text-secondary" ?hidden=${!this.helperText}>${this.helperText}</p>
      </div>

      <div
        class="rounded bg-contrast-5"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        ${repeat(
          [...Object.entries(this._value || {}), null],
          (rule, ruleIndex) => String(ruleIndex),
          (rule, ruleIndex) => {
            if (rule === null) {
              return [
                ruleIndex > 0 ? divider : '',
                this.__renderRule({
                  onChange: ({ key, items }) => {
                    this._value = {
                      ...this._value,
                      [key]: [...(this._value[key] ?? []), ...items],
                    };
                  },
                }),
              ];
            }

            return [
              ruleIndex > 0 ? divider : '',
              this.__renderRule({
                rule: { key: rule[0], items: rule[1] },
                onChange: updatedRule => {
                  const newValue: Record<string, string[]> = {};
                  const oldKeys = Object.keys(this._value);

                  for (let i = 0; i < oldKeys.length; i++) {
                    const oldKey = oldKeys[i];
                    if (oldKey === rule[0]) {
                      if (updatedRule.key === oldKey) {
                        newValue[oldKey] = updatedRule.items;
                      } else {
                        const existingItems = this._value[updatedRule.key] ?? [];
                        if (i > oldKeys.indexOf(updatedRule.key)) {
                          newValue[updatedRule.key] = [...existingItems, ...updatedRule.items];
                        } else {
                          newValue[updatedRule.key] = [...updatedRule.items, ...existingItems];
                          oldKeys.splice(oldKeys.indexOf(updatedRule.key), 1);
                        }
                      }
                    } else {
                      newValue[oldKey] = this._value[oldKey] ?? [];
                    }
                  }

                  this._value = newValue;
                },
                onDelete: () => {
                  const newValue = { ...this._value };
                  delete newValue[rule[0]];
                  this._value = newValue;
                },
              }),
            ];
          }
        )}
      </div>

      <p
        class="text-s text-error mt-s"
        ?hidden=${!this._errorMessage || this.disabled || this.readonly}
      >
        ${this._errorMessage}
      </p>
    `;
  }

  protected get _value(): Record<string, string[]> {
    return (super._value as Record<string, string[]>) ?? {};
  }

  protected set _value(value: Record<string, string[]>) {
    super._value = value;
  }

  private __renderRule({ rule, onDelete, onChange }: RuleParams) {
    const items = rule?.items ?? [];

    return html`
      <div class="flex items-center space-x-s" aria-label=${this.t('rule')}>
        <div class="flex-1 bg-base rounded-s overflow-hidden border border-contrast-10">
          <div class="bg-contrast-10">
            <div class="grid gap-1px grid-vertical sm-grid-horizontal">
              <div class="bg-base">
                <div
                  aria-hidden="true"
                  class=${classMap({
                    'text-tertiary': !this.readonly && !this.disabled,
                    'text-disabled': this.readonly || this.disabled,
                    'w-m h-m': true,
                  })}
                >
                  ${svg`<svg class="w-full h-full" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 8C12.48 8 8 12.48 8 18C8 23.52 12.48 28 18 28C23.52 28 28 23.52 28 18C28 12.48 23.52 8 18 8ZM18 26C13.59 26 10 22.41 10 18C10 13.59 13.59 10 18 10C22.41 10 26 13.59 26 18C26 22.41 22.41 26 18 26Z" class="fill-current"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19.49 17.38C19.92 16.16 19.66 14.74 18.68 13.76C17.57 12.65 15.89 12.46 14.58 13.17L16.93 15.52L15.52 16.93L13.17 14.58C12.46 15.9 12.65 17.57 13.76 18.68C14.74 19.66 16.16 19.92 17.38 19.49L20.79 22.9C20.99 23.1 21.3 23.1 21.5 22.9L22.9 21.5C23.1 21.3 23.1 20.99 22.9 20.79L19.49 17.38Z" class="fill-current"/></svg>`}
                </div>
              </div>
              <div class="bg-base">
                ${this.__renderInput({
                  value: rule?.key ?? '',
                  label: this.t('option_name'),
                  onChange: newPath => {
                    if (newPath === undefined) {
                      onDelete?.();
                    } else {
                      onChange({ key: newPath, items });
                    }
                  },
                })}
              </div>
              <div class="bg-base">
                <div
                  class=${classMap({
                    'flex items-center justify-center w-m h-m transition-colors': true,
                    'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
                    'cursor-default text-tertiary': !(this.disabled || this.readonly),
                    'text-disabled cursor-default': this.disabled || this.readonly,
                  })}
                >
                  <div aria-hidden="true">
                    ${svg`<svg class="w-full h-full" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 9.8C11.0088 9.8 9.8 11.0088 9.8 12.5V23.5C9.8 24.9912 11.0088 26.2 12.5 26.2H14C14.6627 26.2 15.2 25.6627 15.2 25C15.2 24.3373 14.6627 23.8 14 23.8H13.5C12.782 23.8 12.2 23.218 12.2 22.5V13.5C12.2 12.782 12.782 12.2 13.5 12.2H14C14.6627 12.2 15.2 11.6627 15.2 11C15.2 10.3373 14.6627 9.8 14 9.8H12.5Z" class="fill-current"/><path d="M22 9.8C21.3373 9.8 20.8 10.3373 20.8 11C20.8 11.6627 21.3373 12.2 22 12.2H22.5C23.218 12.2 23.8 12.782 23.8 13.5V22.5C23.8 23.218 23.218 23.8 22.5 23.8H22C21.3373 23.8 20.8 24.3373 20.8 25C20.8 25.6627 21.3373 26.2 22 26.2H23.5C24.9912 26.2 26.2 24.9912 26.2 23.5V12.5C26.2 11.0088 24.9912 9.8 23.5 9.8H22Z" class="fill-current"/></svg>`}
                  </div>
                </div>
              </div>
              <div class="bg-base">
                <div class="bg-contrast-10 grid grid-cols-1 gap-1px">
                  ${repeat(
                    this.readonly ? items : [...items, null],
                    (value, index) => index,
                    (value, index) => html`
                      <div class="bg-base">
                        ${this.__renderInput({
                          value: value ?? '',
                          label: value ? String(index + 1) : this.t('add_value'),
                          onChange: newValue => {
                            const newItems = [...items];

                            if (newValue) {
                              if (value === null) {
                                newItems.push(newValue);
                              } else {
                                newItems[index] = newValue;
                              }
                            } else {
                              newItems.splice(index, 1);
                            }

                            if (rule) onChange({ key: rule.key, items: newItems });
                          },
                        })}
                      </div>
                    `
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex -mr-s self-start flex-col sm-flex-row flex-shrink-0 items-center border-t border-b border-transparent divide-y divide-transparent"
          ?hidden=${this.readonly || Object.keys(this._value).length === 0}
        >
          <button
            aria-label=${this.t('delete')}
            class=${classMap({
              'box-content flex items-center justify-center': true,
              'w-m h-m rounded-full transition-colors': true,
              'text-secondary hover-bg-contrast-5 hover-text-error': !this.disabled,
              'cursor-default text-disabled': this.disabled,
              'focus-outline-none focus-ring-2 ring-primary-50': true,
              'opacity-0 pointer-events-none': !rule,
            })}
            ?disabled=${this.disabled || this.readonly || !rule}
            @click=${() => onDelete?.()}
          >
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-l" style="width: 1.25em; height: 1.25em"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`}
          </button>
        </div>
      </div>
    `;
  }

  private __renderInput(params: InputParams) {
    return html`
      <label class="relative flex items-center cursor-text group text-tertiary">
        <div class="relative flex-1 min-w-0 overflow-hidden">
          <input
            placeholder=${params.label}
            class=${classMap({
              'bg-base relative flex h-m px-s font-medium w-full': true,
              'text-body': !this.disabled && !this.readonly,
              'text-disabled': this.disabled,
              'text-secondary': this.readonly,
              'flex max-w-full whitespace-nowrap': true, // ugh safari
              'focus-outline-none': true,
            })}
            .value=${params.value}
            ?disabled=${this.disabled || this.readonly}
            @keydown=${(evt: KeyboardEvent) => {
              const input = evt.currentTarget as HTMLInputElement;
              if (evt.key === 'Backspace' && !input.value) params.onChange();
            }}
            @change=${(evt: Event) => {
              const input = evt.currentTarget as HTMLInputElement;
              if (!input.value) params.onChange();
            }}
            @input=${(evt: Event) => {
              const input = evt.currentTarget as HTMLInputElement;
              params.onChange(input.value);
            }}
          />
        </div>

        <span
          class=${classMap({
            'font-tnum text-xs font-medium border border-current mr-s px-xs rounded-s': true,
            'inline-block': !!params.value,
            'sr-only': !params.value,
            'text-body': !this.disabled && !this.readonly,
            'text-disabled': this.disabled,
            'text-secondary': this.readonly,
          })}
        >
          ${this.t(params.label)}
        </span>

        ${this.disabled || this.readonly
          ? ''
          : html`
              <div
                class="absolute inset-0 transition-colors bg-transparent group-hover-bg-contrast-5 pointer-events-none"
              ></div>
            `}
      </label>
    `;
  }
}

export { InternalArrayMapControl };
