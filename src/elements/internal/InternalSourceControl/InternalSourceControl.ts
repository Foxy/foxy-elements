import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';

/**
 * Internal control displaying editable source code.
 *
 * @since 1.23.0
 * @element foxy-internal-source-control
 */
export class InternalSourceControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __isErrorVisible: { attribute: false },
      __hovered: { attribute: false },
      __focused: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        .monospace {
          font-family: monospace;
        }

        .resize-none {
          resize: none;
        }

        .max-h-16em {
          max-height: 16em;
        }

        textarea::selection {
          background: var(--lumo-contrast-10pct);
        }
      `,
    ];
  }

  private __isErrorVisible = false;

  private __hovered = false;

  private __focused = false;

  renderControl(): TemplateResult {
    let lineNumbersClass: string;
    let containerClass: string;
    let textAreaClass: string;

    if (this.disabled) {
      lineNumbersClass = 'bg-contrast-5 text-disabled';
      textAreaClass = 'text-disabled';

      if (this.readonly) {
        lineNumbersClass += ' border-dashed border-contrast-20';
        containerClass = 'border-dashed border-contrast-30';
      } else {
        lineNumbersClass += ' border-transparent';
        containerClass = 'border-contrast-10';
      }
    } else if (this.readonly) {
      lineNumbersClass = 'border-dashed border-contrast-30 bg-transparent text-secondary';
      containerClass = 'border-dashed border-contrast-30';
      textAreaClass = 'text-secondary';
      if (this.__focused) containerClass += ' ring-2 ring-primary-50';
    } else if (this.__focused) {
      lineNumbersClass = 'border-transparent bg-contrast-10 text-tertiary';
      containerClass = 'border-primary-50 ring-1 ring-primary-50';
      textAreaClass = 'text-body';
    } else if (this.__hovered) {
      lineNumbersClass = 'border-transparent bg-contrast-20 text-tertiary';
      containerClass = 'border-contrast-20';
      textAreaClass = 'text-body';
    } else {
      lineNumbersClass = 'border-transparent bg-contrast-10 text-tertiary';
      containerClass = 'border-contrast-10';
      textAreaClass = 'text-body';
    }

    return html`
      <label
        class="block h-full"
        @mouseenter=${() => (this.__hovered = true)}
        @mouseleave=${() => (this.__hovered = false)}
      >
        <div class="mb-s leading-s" ?hidden=${!this.label && !this.helperText}>
          <div class="transition-colors text-l font-medium" part="label">${this.label}</div>
          <div class="transition-colors text-s text-secondary" part="helper-text">
            ${this.helperText}
          </div>
        </div>

        <div
          class="max-h-16em h-full transition-colors flex-1 flex bg-base rounded overflow-auto border ${containerClass}"
          part="editor"
        >
          <div
            class="h-full transition-colors monospace leading-s text-s text-right border-r ${lineNumbersClass}"
            style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
          >
            ${repeat(
              this._value.split('\n') ?? [],
              (_, i) => String(i),
              (_, i) =>
                html`<div>${i < 9 ? html`<span class="opacity-0">0</span>` : ''}${
                  i < 99 ? html`<span class="opacity-0">0</span>` : ''
                }<span>${i + 1}<span></div>`
            )}
          </div>

          <textarea
            placeholder=${this.placeholder}
            class="bg-base whitespace-pre leading-s text-s focus-outline-none monospace resize-none block w-full select-text transition-colors ${textAreaClass}"
            style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
            rows="1"
            .value=${this._value}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @focus=${() => (this.__focused = true)}
            @blur=${() => {
              this.__focused = false;
              this.__isErrorVisible = true;
            }}
            @input=${(evt: InputEvent) => {
              const textarea = evt.currentTarget as HTMLTextAreaElement;
              this._value = textarea.value;
            }}
          >
          </textarea>
        </div>

        <div
          class="mt-s text-s leading-xs text-error"
          ?hidden=${!this.__isErrorVisible || !this._errorMessage || this.disabled || this.readonly}
        >
          ${this._errorMessage}
        </div>
      </label>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    this.renderRoot.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    });
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
