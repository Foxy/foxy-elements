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

  private __hovered = false;

  private __focused = false;

  renderControl(): TemplateResult {
    let lineNumbersClass: string;
    let helperTextClass: string;
    let containerClass: string;
    let textAreaClass: string;
    let labelClass: string;

    if (this.disabled) {
      lineNumbersClass = 'bg-contrast-5 text-disabled';
      helperTextClass = 'text-disabled';
      textAreaClass = 'text-disabled';
      labelClass = 'text-disabled';

      if (this.readonly) {
        lineNumbersClass += ' border-dashed border-contrast-20';
        containerClass = 'border-dashed border-contrast-30';
      } else {
        lineNumbersClass += ' border-transparent';
        containerClass = 'border-contrast-10';
      }
    } else if (this.readonly) {
      lineNumbersClass = 'border-dashed border-contrast-30 bg-transparent text-secondary';
      helperTextClass = 'text-secondary';
      containerClass = 'border-dashed border-contrast-30';
      textAreaClass = 'text-secondary';
      labelClass = 'text-secondary';
      if (this.__focused) containerClass += ' ring-2 ring-primary-50';
    } else if (this.__focused) {
      lineNumbersClass = 'border-transparent bg-contrast-10 text-tertiary';
      helperTextClass = 'text-secondary';
      containerClass = 'border-primary-50 ring-1 ring-primary-50';
      textAreaClass = 'text-body';
      labelClass = 'text-primary';
    } else if (this.__hovered) {
      lineNumbersClass = 'border-transparent bg-contrast-20 text-tertiary';
      helperTextClass = 'text-body';
      containerClass = 'border-contrast-20';
      textAreaClass = 'text-body';
      labelClass = 'text-body';
    } else {
      lineNumbersClass = 'border-transparent bg-contrast-10 text-tertiary';
      helperTextClass = 'text-secondary';
      containerClass = 'border-contrast-10';
      textAreaClass = 'text-body';
      labelClass = 'text-secondary';
    }

    return html`
      <label
        class="block h-full"
        @mouseenter=${() => (this.__hovered = true)}
        @mouseleave=${() => (this.__hovered = false)}
      >
        <div
          class="mb-xs transition-colors leading-none text-s font-medium ${labelClass}"
          part="label"
        >
          ${this.label}
        </div>

        <div
          class="max-h-16em h-full transition-colors flex-1 flex bg-base rounded overflow-auto border ${containerClass}"
          part="editor"
        >
          <div
            class="h-full transition-colors monospace leading-s text-s p-m text-right border-r ${lineNumbersClass}"
          >
            ${repeat(
              this._value.split('\n') ?? [],
              (_, i) => String(i),
              (_, i) => html`<div>${i + 1}</div>`
            )}
          </div>

          <textarea
            placeholder=${this.placeholder}
            class="bg-base whitespace-pre leading-s text-s focus-outline-none monospace resize-none p-m block w-full select-text transition-colors ${textAreaClass}"
            rows="1"
            .value=${this._value}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @focus=${() => (this.__focused = true)}
            @blur=${() => (this.__focused = false)}
            @input=${(evt: InputEvent) => {
              const textarea = evt.currentTarget as HTMLTextAreaElement;
              this._value = textarea.value;
            }}
          >
          </textarea>
        </div>

        <div
          class="mt-xs transition-colors leading-xs text-xs ${helperTextClass}"
          part="helper-text"
        >
          ${this.helperText}
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
