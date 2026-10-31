import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { TemplateResult } from 'lit-html';

import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export interface FieldParams {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  locked: boolean;
  testid: string;
  error?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

/** A text field committing on change, showing an error worked out by the caller. */
export function textField(params: FieldParams): TemplateResult {
  return html`
    <vaadin-text-field
      class=${params.className ?? 'w-full'}
      data-testid=${params.testid}
      label=${params.label}
      placeholder=${ifDefined(params.placeholder)}
      helper-text=${ifDefined(params.helperText)}
      error-message=${ifDefined(params.error)}
      ?invalid=${!!params.error}
      ?disabled=${params.locked}
      .checkValidity=${() => !params.error}
      .value=${params.value === undefined ? '' : String(params.value)}
      @change=${(evt: Event) => {
        params.onChange((evt.currentTarget as TextFieldElement).value.trim());
      }}
    >
    </vaadin-text-field>
  `;
}

export interface ListActionsParams {
  index: number;
  length: number;
  locked: boolean;
  t: (key: string) => string;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  testid: string;
}

/** Move up, Move down and Remove for an entry of a list kept in display order. */
export function listActions(params: ListActionsParams): TemplateResult {
  const { index, length, locked, t, onMove, onRemove, testid } = params;
  return html`
    <div class="flex flex-wrap text-s" style="gap: 1rem" data-testid=${testid}>
      ${index > 0
        ? html`
            <button
              class="text-primary"
              type="button"
              ?disabled=${locked}
              @click=${() => onMove(index, index - 1)}
            >
              ${t('move_up')}
            </button>
          `
        : ''}
      ${index < length - 1
        ? html`
            <button
              class="text-primary"
              type="button"
              ?disabled=${locked}
              @click=${() => onMove(index, index + 1)}
            >
              ${t('move_down')}
            </button>
          `
        : ''}
      <button class="text-error" type="button" ?disabled=${locked} @click=${onRemove}>
        ${t('remove')}
      </button>
    </div>
  `;
}

export function move<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  result.splice(to, 0, ...result.splice(from, 1));
  return result;
}

/** Sets `key` to `value`, or removes it when the value is empty. */
export function withField<T>(item: T, key: string, value: unknown): T {
  const result = { ...item } as Record<string, unknown>;
  if (value === '' || value === undefined || value === null) delete result[key];
  else result[key] = value;
  return result as T;
}

/** A decimal amount as typed; a weight as a number. Empty removes the field. */
export function parseWeight(value: string): number | string | undefined {
  if (value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}
