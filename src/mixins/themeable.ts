/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { CSSResult, CSSResultArray, Constructor, LitElement, css } from 'lit-element';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';

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
          vaadin-combo-box::part(text-field) {
            padding-top: 0;
            padding-bottom: 0;
          }

          vaadin-date-picker::part(text-field) {
            padding-top: 0;
            padding-bottom: 0;
          }

          vaadin-button {
            margin: 0;
          }

          vaadin-checkbox::part(checkbox) {
            margin: 0;
          }

          vaadin-checkbox::part(label) {
            margin: 0.1875em var(--lumo-space-m);
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

              .w-narrow-modal {
                width: 18rem;
              }

              .snap-x-mandatory {
                scroll-snap-type: x mandatory;
              }

              .snap-start {
                scroll-snap-align: start;
              }
            }
          }
        `,
      ];
    }
  };
};

/**
 * One of the base classes for each rel-specific element in the collection
 * providing shared TailwindCSS styles for Shadow DOM content.
 * This class MUST NOT be used on its own (hence the `abstract` keyword) or
 * referenced externally (outside of the package).
 *
 * @deprecated
 */
export abstract class Themeable extends ScopedElementsMixin(ThemeableMixin(LitElement)) {}
