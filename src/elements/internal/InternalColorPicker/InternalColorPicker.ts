import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';
import { css, html } from 'lit-element';

/** Hue in degrees, then saturation and brightness in percent. */
type HSB = [number, number, number];

const HUES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'blue',
  'indigo',
  'purple',
  'pink',
] as const;

const HUE_DEGREES = [2, 24, 40, 52, 80, 135, 172, 192, 215, 240, 275, 330];

/** Saturation and lightness of each row of the palette, from light to dark. */
const SHADES: [number, number][] = [
  [90, 92],
  [85, 82],
  [80, 68],
  [78, 54],
  [78, 42],
  [75, 30],
  [70, 20],
];

const COLUMNS = HUES.length;

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return rgbToHex(channel(0) * 255, channel(8) * 255, channel(4) * 255);
}

function rgbToHex(...channels: number[]): string {
  return `#${channels
    .map(c =>
      Math.round(Math.max(0, Math.min(255, c)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/** `#rrggbb` for a hex color typed or pasted with or without `#`, in 3 or 6 digits. */
export function parseHex(text: string): string | null {
  const digits = text.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(digits)) return `#${digits.replace(/./g, '$&$&')}`;
  return /^[0-9a-f]{6}$/.test(digits) ? `#${digits}` : null;
}

export function hexToHsb(hex: string): HSB {
  const [r, g, b] = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let hue = 0;
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  return [
    Math.round((hue * 60 + 360) % 360),
    Math.round(max ? (delta / max) * 100 : 0),
    Math.round(max * 100),
  ];
}

export function hsbToHex([hue, saturation, brightness]: HSB): string {
  const s = saturation / 100;
  const v = brightness / 100;
  const channel = (n: number) => {
    const k = (n + hue / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return rgbToHex(channel(5), channel(3), channel(1));
}

/** A row of grays from white to black, then a column per hue running light to dark. */
export const PALETTE: { color: string; hue: (typeof HUES)[number] | 'gray' }[] = [
  ...HUES.map((_, index) => {
    const level = Math.round(255 * (1 - index / (COLUMNS - 1)));
    return { color: rgbToHex(level, level, level), hue: 'gray' as const };
  }),
  ...SHADES.flatMap(([saturation, lightness]) =>
    HUES.map((hue, index) => ({ color: hslToHex(HUE_DEGREES[index], saturation, lightness), hue }))
  ),
];

/**
 * A compact color picker: a button showing the color, opening a panel with a
 * palette, hue, saturation and brightness sliders, and a hex field. Its value
 * is `#rrggbb`, or an empty string for no color; `change` fires when it changes.
 *
 * @element foxy-internal-color-picker
 * @since 1.62.0
 */
export class InternalColorPicker extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      value: {},
      label: {},
      __alignEnd: { attribute: false },
      __open: { attribute: false },
      __hex: { attribute: false },
      __hsb: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        :host {
          display: inline-block;
          position: relative;
        }

        button,
        input {
          font: inherit;
        }

        button:focus-visible,
        input:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 1px;
        }

        .trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          height: 1.875rem;
          padding: 0 0.5rem 0 0.25rem;
          border: 1px solid var(--lumo-contrast-20pct);
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-base-color);
          color: var(--lumo-secondary-text-color);
          font-size: var(--lumo-font-size-xs);
          white-space: nowrap;
          cursor: pointer;
        }

        .trigger:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .chip {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.1875rem;
          box-shadow: inset 0 0 0 1px var(--lumo-contrast-20pct);
        }

        /* No color: a line across an empty square. */
        .chip.none {
          background: linear-gradient(
            to top right,
            transparent calc(50% - 1px),
            var(--lumo-error-color) calc(50% - 1px),
            var(--lumo-error-color) calc(50% + 1px),
            transparent calc(50% + 1px)
          );
        }

        .panel {
          position: absolute;
          top: calc(100% + 0.25rem);
          left: 0;
          z-index: 10;
          display: grid;
          gap: 0.625rem;
          box-sizing: border-box;
          width: 17.5rem;
          max-width: calc(100vw - 2rem);
          padding: 0.75rem;
          border: 1px solid var(--lumo-contrast-20pct);
          border-radius: var(--lumo-border-radius-m);
          background: var(--lumo-base-color);
          box-shadow: var(--lumo-box-shadow-m);
          font-size: var(--lumo-font-size-xs);
        }

        .panel.end {
          right: 0;
          left: auto;
        }

        .palette {
          display: grid;
          /* One column per hue. Written out: the build takes no values inside css. */
          grid-template-columns: repeat(12, 1fr);
          gap: 2px;
        }

        .palette button {
          aspect-ratio: 1;
          border-radius: 2px;
          box-shadow: inset 0 0 0 1px var(--lumo-contrast-10pct);
          cursor: pointer;
        }

        .palette button:hover,
        .palette button:focus-visible {
          position: relative;
          transform: scale(1.25);
        }

        .palette button[aria-pressed='true'] {
          outline: 2px solid var(--lumo-body-text-color);
          outline-offset: 1px;
        }

        .slider {
          display: grid;
          grid-template-columns: 5rem minmax(0, 1fr);
          align-items: center;
          gap: 0.5rem;
          color: var(--lumo-secondary-text-color);
        }

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 0.75rem;
          margin: 0;
          border-radius: 0.375rem;
          background: var(--track);
          box-shadow: inset 0 0 0 1px var(--lumo-contrast-20pct);
          cursor: pointer;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 1rem;
          height: 1rem;
          border: 2px solid #fff;
          border-radius: 50%;
          background: transparent;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.5);
        }

        input[type='range']::-moz-range-thumb {
          box-sizing: border-box;
          width: 1rem;
          height: 1rem;
          border: 2px solid #fff;
          border-radius: 50%;
          background: transparent;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.5);
        }

        .hex {
          box-sizing: border-box;
          width: 5.5rem;
          height: 1.875rem;
          padding: 0 0.5rem;
          border: 1px solid var(--lumo-contrast-20pct);
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-base-color);
          color: var(--lumo-body-text-color);
          font-family: ui-monospace, Menlo, monospace;
        }

        .hex[aria-invalid='true'] {
          border-color: var(--lumo-error-color);
        }

        .action {
          white-space: nowrap;
          height: 1.875rem;
          padding: 0 0.5rem;
          border-radius: var(--lumo-border-radius-s);
          cursor: pointer;
        }

        .action:hover {
          background: var(--lumo-contrast-10pct);
        }
      `,
    ];
  }

  /** `#rgb` or `#rrggbb`, or an empty string for no color. */
  value = '';

  /** What the color is for, such as "Swatch color". Names the button and the panel. */
  label = '';

  private __open = false;

  private __alignEnd = false;

  /** The hex field as typed, which may not be a color yet. */
  private __hex = '';

  /** Kept beside the value, which can't tell one hue from another once it is gray or black. */
  private __hsb: HSB = [0, 0, 100];

  private readonly __closeOnOutsidePress = (evt: Event) => {
    if (!evt.composedPath().includes(this)) this.__open = false;
  };

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.__closeOnOutsidePress);
  }

  update(changes: Map<keyof this, unknown>): void {
    const color = parseHex(this.value ?? '');
    if (changes.has('value') && color !== hsbToHex(this.__hsb)) {
      if (color) this.__hsb = hexToHsb(color);
      // What is being typed stays as typed while it means the same color.
      if (parseHex(this.__hex) !== color) this.__hex = this.value ?? '';
    }
    super.update(changes);
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (!changes.has('__open' as keyof this)) return;

    if (this.__open) {
      document.addEventListener('pointerdown', this.__closeOnOutsidePress);
      this.__paletteButton(this.__paletteIndex)?.focus();
    } else {
      document.removeEventListener('pointerdown', this.__closeOnOutsidePress);
    }
  }

  renderControl(): TemplateResult {
    const color = parseHex(this.value ?? '');
    const name = this.value || this.t('none');
    const locked = this.disabled || this.readonly;

    return html`
      <button
        type="button"
        class="trigger"
        data-testid="trigger"
        aria-haspopup="dialog"
        aria-expanded=${this.__open ? 'true' : 'false'}
        aria-label="${this.label}: ${name}"
        ?disabled=${locked}
        @click=${this.__toggle}
      >
        <span class="chip ${color ? '' : 'none'}" style="background-color: ${color ?? ''}"></span>
        ${name}
      </button>
      ${this.__open && !locked ? this.__renderPanel(color) : ''}
    `;
  }

  private __renderPanel(color: string | null) {
    // The tracks run to the hue at full strength, so they show what they set
    // even while the color itself is nearly black or gray.
    const full = hsbToHex([this.__hsb[0], 100, 100]);
    const roving = this.__paletteIndex;
    const slider = (key: 'hue' | 'saturation' | 'brightness', at: 0 | 1 | 2, track: string) => html`
      <label class="slider">
        ${this.t(key)}
        <input
          type="range"
          min="0"
          max=${at === 0 ? 360 : 100}
          style="--track: ${track}"
          data-testid=${key}
          .value=${String(this.__hsb[at])}
          @input=${(evt: Event) => {
            const hsb = [...this.__hsb] as HSB;
            hsb[at] = Number((evt.currentTarget as HTMLInputElement).value);
            this.__pick(hsb);
          }}
        />
      </label>
    `;

    return html`
      <div
        class="panel ${this.__alignEnd ? 'end' : ''}"
        role="dialog"
        aria-label=${this.label}
        data-testid="panel"
        @keydown=${this.__handlePanelKey}
        @focusout=${(evt: FocusEvent) => {
          const next = evt.relatedTarget as Node | null;
          if (next && !this.renderRoot.contains(next)) this.__open = false;
        }}
      >
        <div
          class="palette"
          role="group"
          aria-label=${this.t('palette')}
          data-testid="palette"
          @keydown=${this.__handlePaletteKey}
        >
          ${PALETTE.map(
            (entry, index) => html`
              <button
                type="button"
                tabindex=${index === roving ? '0' : '-1'}
                style="background: ${entry.color}"
                title=${entry.color}
                aria-label="${this.t(`hue_${entry.hue}`)} ${entry.color}"
                aria-pressed=${entry.color === color ? 'true' : 'false'}
                data-color=${entry.color}
                @click=${() => this.__pick(hexToHsb(entry.color), entry.color)}
              ></button>
            `
          )}
        </div>

        ${slider('hue', 0, 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)')}
        ${slider('saturation', 1, `linear-gradient(to right, #fff, ${full})`)}
        ${slider('brightness', 2, `linear-gradient(to right, #000, ${full})`)}

        <div class="flex items-center" style="gap: 0.5rem">
          <label class="flex items-center text-secondary" style="gap: 0.5rem">
            ${this.t('hex')}
            <input
              class="hex"
              data-testid="hex"
              placeholder="#1d1d1f"
              spellcheck="false"
              autocomplete="off"
              aria-invalid=${this.__hex.trim() && !parseHex(this.__hex) ? 'true' : 'false'}
              .value=${this.__hex}
              @input=${(evt: Event) => {
                this.__hex = (evt.currentTarget as HTMLInputElement).value;
                const typed = parseHex(this.__hex);
                if (typed) {
                  this.__hsb = hexToHsb(typed);
                  this.__setValue(typed);
                }
              }}
              @change=${() => (this.__hex = this.value)}
            />
          </label>
          <span class="flex-1"></span>
          <button
            type="button"
            class="action text-secondary"
            data-testid="clear"
            ?disabled=${!this.value}
            @click=${() => {
              this.__hex = '';
              this.__setValue('');
            }}
          >
            ${this.t('clear')}
          </button>
          <button
            type="button"
            class="action font-medium"
            data-testid="done"
            @click=${this.__close}
          >
            ${this.t('done')}
          </button>
        </div>
      </div>
    `;
  }

  /** The palette entry that takes focus: the current color's, or the first. */
  private get __paletteIndex(): number {
    const color = parseHex(this.value ?? '');
    return Math.max(
      0,
      PALETTE.findIndex(entry => entry.color === color)
    );
  }

  private __paletteButton(index: number): HTMLElement | null {
    return this.renderRoot.querySelectorAll<HTMLElement>('.palette button')[index] ?? null;
  }

  private __toggle() {
    if (this.__open) return this.__close();
    const left = this.getBoundingClientRect().left;
    const width = 17.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.__alignEnd = left + width > window.innerWidth - 16;
    this.__open = true;
  }

  private __close() {
    this.__open = false;
    this.renderRoot.querySelector<HTMLElement>('.trigger')?.focus();
  }

  /** `hex` is given for a color that must come out exactly, which whole percents can miss. */
  private __pick(hsb: HSB, hex = hsbToHex(hsb)) {
    this.__hsb = hsb;
    this.__hex = hex;
    this.__setValue(hex);
  }

  private __setValue(value: string) {
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new Event('change'));
  }

  private __handlePanelKey(evt: KeyboardEvent) {
    if (evt.key !== 'Escape') return;
    // Only the picker closes, not a dialog it may be in.
    evt.stopPropagation();
    evt.preventDefault();
    this.__close();
  }

  private __handlePaletteKey(evt: KeyboardEvent) {
    const buttons = Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.palette button'));
    const from = buttons.indexOf(evt.target as HTMLElement);
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -COLUMNS,
      ArrowDown: COLUMNS,
      Home: -(from % COLUMNS),
      End: COLUMNS - 1 - (from % COLUMNS),
    };
    const to = from + (steps[evt.key] ?? 0);
    if (from === -1 || !(evt.key in steps) || to < 0 || to >= buttons.length) return;

    evt.preventDefault();
    buttons[from].tabIndex = -1;
    buttons[to].tabIndex = 0;
    buttons[to].focus();
  }
}
