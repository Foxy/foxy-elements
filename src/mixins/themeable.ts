/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { CSSResult, CSSResultArray, Constructor, LitElement, css } from 'lit-element';

import { ResponsiveMixin } from './responsive';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';

type Base = Constructor<LitElement> & { styles?: CSSResult | CSSResultArray | CSSStyleSheet };

export const ThemeableMixin = <TBase extends Base>(
  BaseElement: TBase
): TBase & { styles: CSSResultArray } => {
  return class ThemeableElement extends BaseElement {
    static get styles(): CSSResultArray {
      const originalCSS = super.styles;

      return [
        ...(originalCSS ? (Array.isArray(originalCSS) ? originalCSS : [originalCSS]) : []),
        css`
          @tailwind base;

          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          :host {
            display: block;
            color: var(--lumo-body-text-color);
            line-height: var(--lumo-line-height-m);
            font: normal var(--lumo-font-size-m) var(--lumo-font-family);
          }

          details > summary::-webkit-details-marker {
            display: none;
          }

          details > summary {
            list-style: none;
          }

          vaadin-select {
            margin-top: -4px;
            margin-bottom: -4px;
          }

          vaadin-text-area,
          vaadin-text-field,
          vaadin-date-picker,
          vaadin-email-field,
          vaadin-number-field,
          vaadin-custom-field,
          vaadin-integer-field,
          vaadin-password-field,
          vaadin-checkbox-group,
          vaadin-radio-group,
          vaadin-combo-box::part(text-field),
          vaadin-date-picker::part(text-field) {
            padding-top: 0;
            padding-bottom: 0;
          }

          vaadin-text-area::part(label),
          vaadin-text-field::part(label),
          vaadin-date-picker::part(label),
          vaadin-email-field::part(label),
          vaadin-number-field::part(label),
          vaadin-custom-field::part(label),
          vaadin-integer-field::part(label),
          vaadin-password-field::part(label),
          vaadin-checkbox-group::part(label),
          vaadin-radio-group::part(label),
          vaadin-combo-box::part(label),
          vaadin-date-picker::part(label) {
            margin-left: 0;
          }

          vaadin-time-picker,
          vaadin-date-time-picker {
            width: 100%;
          }

          vaadin-button,
          vaadin-checkbox::part(checkbox) {
            margin: 0;
          }

          vaadin-checkbox::part(label) {
            margin: 0.1875em var(--lumo-space-m);
          }

          .appearance-none {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }

          .appearance-none::-webkit-calendar-picker-indicator,
          .appearance-none::-webkit-outer-spin-button,
          .appearance-none::-webkit-inner-spin-button,
          .appearance-none::-webkit-list-button {
            opacity: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          input::-webkit-date-and-time-value {
            text-align: inherit !important;
          }

          [hidden] {
            display: none !important;
          }

          option {
            color: var(--lumo-body-text-color);
          }

          @tailwind components;

          @tailwind utilities;

          @layer utilities {
            .border-radius-overflow-fix {
              -webkit-mask-image: -webkit-radial-gradient(white, black);
            }

            @variants sm, md, lg, xl {
              .grid-rows-auto {
                grid-auto-rows: 1fr;
              }

              .icon-inline {
                --iron-icon-height: 1em;
                --iron-icon-width: 1em;
              }

              .bg-blurred {
                backdrop-filter: blur(25px);
                background: var(--lumo-tint-80pct);
              }

              .max-w-modal {
                max-width: 28rem;
              }

              .max-w-modal-wide {
                max-width: 50rem;
              }

              .w-narrow-modal {
                width: 18rem;
              }

              .snap-x-mandatory {
                scroll-snap-type: x mandatory;
              }

              .snap-start {
                scroll-snap-align: start;
              }

              .hljs-tag {
                color: var(--lumo-tertiary-text-color);
                font-weight: 500;
              }

              .hljs-name {
                color: var(--lumo-primary-text-color);
                font-weight: 500;
              }

              .hljs-attr {
                color: var(--lumo-secondary-text-color);
                font-weight: 500;
              }

              .hljs-string {
                color: var(--lumo-success-text-color);
                font-weight: 500;
              }
            }
          }
        `,
      ];
    }
  };
};

try {
  registerStyles(
    'vaadin-date-time-picker',
    css`
      vaadin-date-time-picker-custom-field {
        --lumo-text-field-size: auto;
        padding: 0;
      }

      vaadin-date-time-picker-custom-field::part(label) {
        padding-bottom: 0.5em;
      }
    `
  );
} catch {
  // ignore
}

try {
  registerStyles(
    'vaadin-date-time-picker-date-picker',
    css`
      :host {
        --lumo-text-field-size: auto;
      }
      vaadin-date-time-picker-date-text-field {
        padding: 0;
      }
    `
  );
} catch {
  // ignore
}

try {
  registerStyles(
    'vaadin-date-time-picker-time-picker',
    css`
      :host {
        --lumo-text-field-size: auto;
      }
      vaadin-date-time-picker-time-text-field {
        padding: 0;
      }
    `
  );
} catch {
  // ignore
}

try {
  registerStyles(
    'vaadin-button',
    css`
      #button {
        cursor: pointer;
      }

      :host([theme~='primary']) {
        font-weight: 500;
      }
    `
  );
} catch {
  // ignore
}

try {
  /** https://github.com/vaadin-component-factory/vcf-tooltip/issues/6 */
  registerStyles(
    'vcf-tooltip',
    css`
      :host([hidden]) [part='container'] {
        display: none !important;
      }
    `
  );
} catch {
  // ignore
}

/**
 * One of the base classes for each rel-specific element in the collection
 * providing shared TailwindCSS styles for Shadow DOM content.
 * This class MUST NOT be used on its own (hence the `abstract` keyword) or
 * referenced externally (outside of the package).
 *
 * @deprecated
 */
export abstract class Themeable extends ScopedElementsMixin(
  ResponsiveMixin(ThemeableMixin(LitElement))
) {}
