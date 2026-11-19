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

export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp';

const ICON_PATHS = {
  up: 'M4 10l4-4 4 4',
  down: 'M4 6l4 4 4-4',
  left: 'M10 4L6 8l4 4',
  right: 'M6 4l4 4-4 4',
  remove: 'M4 4l8 8M12 4l-8 8',
  add: 'M8 3v10M3 8h10',
  star: 'M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z',
  link: 'M6.8 9.2l2.4-2.4M7.3 4.7l.9-.9a2.6 2.6 0 013.7 3.7l-.9.9M8.7 11.3l-.9.9a2.6 2.6 0 01-3.7-3.7l.9-.9',
};

export function icon(name: keyof typeof ICON_PATHS, filled = false): TemplateResult {
  return html`
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill=${filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d=${ICON_PATHS[name]}></path>
    </svg>
  `;
}

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23E8E8E8"/%3E%3C/svg%3E';

/** What a preview loads: the small version of the image where there is one. */
export function previewSrc(
  src: string | undefined,
  getThumbnailUrl: ((src: string) => string) | null | undefined
): string {
  if (!src) return PLACEHOLDER_IMAGE;
  return getThumbnailUrl?.(src) || src;
}

/** For a preview that fails: the image itself in place of its small version, then a placeholder. */
export function previewFallback(src: string | undefined): (evt: Event) => void {
  return evt => {
    const img = evt.currentTarget as HTMLImageElement;
    const tried = img.getAttribute('src');
    if (tried === PLACEHOLDER_IMAGE) return;
    img.setAttribute('src', src && tried !== src ? src : PLACEHOLDER_IMAGE);
  };
}

export interface UrlFieldParams {
  label: string;
  addLabel: string;
  error: string;
  testid: string;
  onAdd: (url: string) => void;
  onCancel: () => void;
}

/** A field for an image's URL, in place of an upload: Enter or Add takes it, Escape leaves. */
export function urlField(params: UrlFieldParams): TemplateResult {
  const add = (input: HTMLInputElement | null) => input && params.onAdd(input.value.trim());
  return html`
    <span class="pd-url" data-testid=${params.testid}>
      <input
        class="pd-input pd-input-small"
        type="url"
        inputmode="url"
        placeholder="https://"
        autocomplete="off"
        spellcheck="false"
        data-testid="${params.testid}-input"
        aria-label=${params.label}
        aria-invalid=${params.error ? 'true' : 'false'}
        @keydown=${(evt: KeyboardEvent) => {
          if (evt.key === 'Enter') {
            evt.preventDefault();
            add(evt.currentTarget as HTMLInputElement);
          } else if (evt.key === 'Escape') {
            // Only the field closes, not a dialog the form may be in.
            evt.preventDefault();
            evt.stopPropagation();
            params.onCancel();
          }
        }}
      />
      <button
        type="button"
        class="pd-text-button pd-set"
        data-testid="${params.testid}-add"
        @click=${(evt: Event) =>
          add((evt.currentTarget as HTMLElement).parentElement!.querySelector('input'))}
      >
        ${params.addLabel}
      </button>
    </span>
    ${params.error
      ? html`<span class="text-xs text-error" role="alert" data-testid="${params.testid}-error">
          ${params.error}
        </span>`
      : ''}
  `;
}

export interface IconButtonParams {
  icon: keyof typeof ICON_PATHS;
  label: string;
  testid: string;
  disabled: boolean;
  onClick: () => void;
  danger?: boolean;
  /** For a button that switches something on and off. */
  pressed?: boolean;
}

/** A button showing only an icon, named for assistive technology and on hover. */
export function iconButton(params: IconButtonParams): TemplateResult {
  return html`
    <button
      type="button"
      class="pd-icon-button ${params.danger ? 'pd-danger' : ''}"
      data-testid=${params.testid}
      aria-label=${params.label}
      title=${params.label}
      aria-pressed=${ifDefined(
        params.pressed === undefined ? undefined : params.pressed ? 'true' : 'false'
      )}
      ?disabled=${params.disabled}
      @click=${params.onClick}
    >
      ${icon(params.icon)}
    </button>
  `;
}

/**
 * A plain field for a row of a list, committing on change. Named by its label
 * alone unless `visibleLabel` is set: a row's fields sit under shared headings.
 */
export function rowField(
  params: FieldParams & { visibleLabel?: boolean; mono?: boolean }
): TemplateResult {
  const input = html`
    <input
      class="pd-input ${params.visibleLabel ? 'pd-input-small' : ''} ${params.mono
        ? 'pd-mono'
        : ''}"
      data-testid=${params.testid}
      aria-label=${params.label}
      aria-invalid=${params.error ? 'true' : 'false'}
      placeholder=${ifDefined(params.placeholder)}
      ?disabled=${params.locked}
      .value=${params.value === undefined ? '' : String(params.value)}
      @change=${(evt: Event) => {
        params.onChange((evt.currentTarget as HTMLInputElement).value.trim());
      }}
    />
  `;

  if (!params.visibleLabel) return input;
  return html`
    <label class="pd-small-field">
      ${params.label} ${input}
      ${params.error
        ? html`<span class="text-error">${params.error}</span>`
        : params.helperText
        ? html`<span>${params.helperText}</span>`
        : ''}
    </label>
  `;
}

/** What is wrong with a row's fields, each named, since the fields show no message of their own. */
export function rowErrors(errors: [string, string | undefined][]): TemplateResult {
  const found = errors.filter(([, error]) => error);
  if (!found.length) return html``;
  return html`
    <p class="text-xs text-error" data-testid="row-errors">
      ${found.map(([label, error]) => `${label}: ${error}`).join(' ')}
    </p>
  `;
}

/** "Price +79.50 · Weight +0.5" for the changes a value makes, or nothing. */
export function amountSummary(
  item: { price_mod?: number | string; weight_mod?: number | string },
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const signed = (amount: number | string) => (Number(amount) > 0 ? `+${amount}` : String(amount));
  const isSet = (amount: number | string | undefined): amount is number | string =>
    amount !== undefined && amount !== '' && Number(amount) !== 0;
  return [
    isSet(item.price_mod) ? t('amounts_price', { amount: signed(item.price_mod) }) : '',
    isSet(item.weight_mod) ? t('amounts_weight', { amount: signed(item.weight_mod) }) : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Opens and closes a row's less-used fields, showing what they hold while closed. */
export function disclosure(params: {
  open: boolean;
  summary: string;
  label: string;
  testid: string;
  onToggle: () => void;
}): TemplateResult {
  return html`
    <button
      type="button"
      class="pd-text-button ${params.summary ? 'pd-set' : ''}"
      data-testid=${params.testid}
      aria-expanded=${params.open ? 'true' : 'false'}
      @click=${params.onToggle}
    >
      ${icon('right')} ${params.summary || params.label}
    </button>
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
  /** Icons in place of words, for rows where the words would repeat down the list. */
  icons?: boolean;
}

/** Move up, Move down and Remove for an entry of a list kept in display order. */
export function listActions(params: ListActionsParams): TemplateResult {
  const { index, length, locked, t, onMove, onRemove, testid } = params;

  if (params.icons) {
    return html`
      <div class="flex justify-end" data-testid=${testid}>
        ${iconButton({
          icon: 'up',
          label: t('move_up'),
          testid: 'move-up',
          disabled: locked || index === 0,
          onClick: () => onMove(index, index - 1),
        })}
        ${iconButton({
          icon: 'down',
          label: t('move_down'),
          testid: 'move-down',
          disabled: locked || index >= length - 1,
          onClick: () => onMove(index, index + 1),
        })}
        ${iconButton({
          icon: 'remove',
          label: t('remove'),
          testid: 'remove',
          disabled: locked,
          onClick: onRemove,
          danger: true,
        })}
      </div>
    `;
  }

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
