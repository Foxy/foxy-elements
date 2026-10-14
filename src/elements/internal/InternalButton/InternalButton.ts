import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { LitElement, css, html } from 'lit-element';

/**
 * Lumo-styled button. Drop-in replacement for the Vaadin 14 `vaadin-button`
 * supporting the same `theme` variants, `disabled` state and `prefix`/`suffix` slots.
 *
 * Unlike `vaadin-button`, this element has no hidden native button in its shadow root.
 * The host is the only node with `role="button"`, which avoids the nested-interactive
 * and empty button name issues reported by accessibility checkers.
 *
 * @element foxy-internal-button
 * @since 1.57.0
 */
export class InternalButton extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      disabled: { type: Boolean, reflect: true },
      theme: { type: String, reflect: true },
    };
  }

  static get styles(): CSSResultArray {
    return [
      css`
        :host {
          display: inline-block;
          position: relative;
          outline: none;
          white-space: nowrap;
          cursor: pointer;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Keep the host as the event target, like the transparent native button in vaadin-button did */
        ::slotted(*) {
          pointer-events: none;
        }

        /* Ensure the button is always aligned on the baseline */
        .container::before {
          content: '\\2003';
          display: inline-block;
          width: 0;
        }

        .container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
          height: 100%;
          min-height: inherit;
          text-shadow: inherit;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        [part='prefix'],
        [part='suffix'] {
          flex: none;
        }

        [part='label'] {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `,
      // Lumo theme for vaadin-button 2.4 (Apache 2.0, (c) Vaadin Ltd.) with `[active]` and
      // `[focus-ring]` replaced by `:active` and `:focus-visible`.
      css`
        :host {
          --lumo-button-size: var(--lumo-size-m);
          min-width: calc(var(--lumo-button-size) * 2);
          height: var(--lumo-button-size);
          padding: 0 calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius) / 2);
          margin: var(--lumo-space-xs) 0;
          box-sizing: border-box;
          font-family: var(--lumo-font-family);
          font-size: var(--lumo-font-size-m);
          font-weight: 500;
          color: var(--_lumo-button-color, var(--lumo-primary-text-color));
          background-color: var(--_lumo-button-background-color, var(--lumo-contrast-5pct));
          border-radius: var(--lumo-border-radius);
          -webkit-tap-highlight-color: transparent;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        [part='label'],
        [part='prefix'],
        [part='suffix'] {
          line-height: var(--lumo-line-height-xs);
        }

        [part='label'] {
          padding: calc(var(--lumo-button-size) / 6) 0;
        }

        :host([theme~='small']) {
          font-size: var(--lumo-font-size-s);
          --lumo-button-size: var(--lumo-size-s);
        }

        :host([theme~='large']) {
          font-size: var(--lumo-font-size-l);
          --lumo-button-size: var(--lumo-size-l);
        }

        :host([disabled][disabled]) {
          pointer-events: none;
          color: var(--lumo-disabled-text-color);
          background-color: var(--lumo-contrast-5pct);
        }

        :host::before,
        :host::after {
          content: '';
          position: absolute;
          z-index: 1;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: currentColor;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        :host(:hover)::before {
          opacity: 0.05;
        }

        @media (pointer: coarse) {
          :host(:not(:active):hover)::before {
            opacity: 0;
          }
        }

        :host::after {
          transition: opacity 1.4s, transform 0.1s;
          filter: blur(8px);
        }

        :host(:active)::before {
          opacity: 0.1;
          transition-duration: 0s;
        }

        :host(:active)::after {
          opacity: 0.1;
          transition-duration: 0s, 0s;
          transform: scale(0);
        }

        :host(:focus-visible) {
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
        }

        :host([theme~='tertiary']),
        :host([theme~='tertiary-inline']) {
          background-color: transparent !important;
          transition: opacity 0.2s;
          min-width: 0;
        }

        :host([theme~='tertiary'])::before,
        :host([theme~='tertiary-inline'])::before {
          display: none;
        }

        :host([theme~='tertiary']) {
          padding: 0 calc(var(--lumo-button-size) / 6);
        }

        @media (hover: hover) {
          :host([theme*='tertiary']:not(:active):hover) {
            opacity: 0.8;
          }
        }

        :host([theme~='tertiary']:active),
        :host([theme~='tertiary-inline']:active) {
          opacity: 0.5;
          transition-duration: 0s;
        }

        :host([theme~='tertiary-inline']) {
          margin: 0;
          height: auto;
          padding: 0;
          line-height: inherit;
          font-size: inherit;
        }

        :host([theme~='tertiary-inline']) [part='label'] {
          padding: 0;
          overflow: visible;
          line-height: inherit;
        }

        :host([theme~='primary']) {
          background-color: var(--_lumo-button-primary-background-color, var(--lumo-primary-color));
          color: var(--_lumo-button-primary-color, var(--lumo-primary-contrast-color));
          font-weight: 500;
          min-width: calc(var(--lumo-button-size) * 2.5);
        }

        :host([theme~='primary'][disabled]) {
          background-color: var(--lumo-primary-color-50pct);
          color: var(--lumo-primary-contrast-color);
        }

        :host([theme~='primary']:hover)::before {
          opacity: 0.1;
        }

        :host([theme~='primary']:active)::before {
          background-color: var(--lumo-shade-20pct);
        }

        @media (pointer: coarse) {
          :host([theme~='primary']:active)::before {
            background-color: var(--lumo-shade-60pct);
          }

          :host([theme~='primary']:not(:active):hover)::before {
            opacity: 0;
          }
        }

        :host([theme~='primary']:active)::after {
          opacity: 0.2;
        }

        :host([theme~='success']) {
          color: var(--lumo-success-text-color);
        }

        :host([theme~='success'][theme~='primary']) {
          background-color: var(--lumo-success-color);
          color: var(--lumo-success-contrast-color);
        }

        :host([theme~='success'][theme~='primary'][disabled]) {
          background-color: var(--lumo-success-color-50pct);
        }

        :host([theme~='error']) {
          color: var(--lumo-error-text-color);
        }

        :host([theme~='error'][theme~='primary']) {
          background-color: var(--lumo-error-color);
          color: var(--lumo-error-contrast-color);
        }

        :host([theme~='error'][theme~='primary'][disabled]) {
          background-color: var(--lumo-error-color-50pct);
        }

        :host([theme~='contrast']) {
          color: var(--lumo-contrast);
        }

        :host([theme~='contrast'][theme~='primary']) {
          background-color: var(--lumo-contrast);
          color: var(--lumo-base-color);
        }

        :host([theme~='contrast'][theme~='primary'][disabled]) {
          background-color: var(--lumo-contrast-50pct);
        }

        [part] ::slotted(iron-icon) {
          display: inline-block;
          width: var(--lumo-icon-size-m);
          height: var(--lumo-icon-size-m);
        }

        [part] ::slotted(iron-icon[icon^='vaadin:']) {
          padding: 0.25em;
          box-sizing: border-box !important;
        }

        [part='prefix'] {
          margin-left: -0.25em;
          margin-right: 0.25em;
        }

        [part='suffix'] {
          margin-left: 0.25em;
          margin-right: -0.25em;
        }

        :host([theme~='icon']:not([theme~='tertiary-inline'])) {
          min-width: var(--lumo-button-size);
          padding-left: calc(var(--lumo-button-size) / 4);
          padding-right: calc(var(--lumo-button-size) / 4);
        }

        :host([theme~='icon']) [part='prefix'],
        :host([theme~='icon']) [part='suffix'] {
          margin-left: 0;
          margin-right: 0;
        }

        :host([dir='rtl']) [part='prefix'] {
          margin-left: 0.25em;
          margin-right: -0.25em;
        }

        :host([dir='rtl']) [part='suffix'] {
          margin-left: -0.25em;
          margin-right: 0.25em;
        }

        :host([dir='rtl'][theme~='icon']) [part='prefix'],
        :host([dir='rtl'][theme~='icon']) [part='suffix'] {
          margin-left: 0;
          margin-right: 0;
        }
      `,
    ];
  }

  /** Same as the `disabled` attribute of a native button. */
  disabled = false;

  /** Space-separated Lumo variants, e.g. `primary`, `tertiary-inline`, `small`, `icon`. */
  theme: string | undefined;

  constructor() {
    super();

    this.addEventListener('keydown', evt => {
      if (this.disabled || evt.target !== this) return;
      if (evt.key === 'Enter') {
        evt.preventDefault();
        this.click();
      } else if (evt.key === ' ') {
        evt.preventDefault(); // prevents page scroll
      }
    });

    this.addEventListener('keyup', evt => {
      if (!this.disabled && evt.target === this && evt.key === ' ') this.click();
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
  }

  click(): void {
    if (!this.disabled) super.click();
  }

  render(): TemplateResult {
    return html`
      <div class="container">
        <span part="prefix"><slot name="prefix"></slot></span>
        <span part="label"><slot></slot></span>
        <span part="suffix"><slot name="suffix"></slot></span>
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (!changes.has('disabled')) return;

    if (this.disabled) {
      this.setAttribute('aria-disabled', 'true');
      this.removeAttribute('tabindex');
    } else {
      this.removeAttribute('aria-disabled');
      this.setAttribute('tabindex', '0');
    }
  }
}
