import { css } from 'lit-element';

/** The product form's sections, buttons, side panel and dialog. */
export const sectionStyles = css`
  .pd-section {
    border: 1px solid var(--lumo-contrast-10pct);
    border-radius: var(--lumo-border-radius-l);
    background: var(--lumo-base-color);
  }

  .pd-section-button {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem 1.125rem;
    border-radius: var(--lumo-border-radius-l);
    text-align: left;
    cursor: pointer;
  }

  .pd-section-button:hover {
    background: var(--lumo-contrast-5pct);
  }

  .pd-section-button:focus-visible,
  .pd-button:focus-visible,
  .pd-icon-button:focus-visible {
    outline: 2px solid var(--lumo-primary-color-50pct);
    outline-offset: -2px;
  }

  .pd-chevron {
    flex-shrink: 0;
    margin-top: 0.25rem;
    color: var(--lumo-secondary-text-color);
    transition: transform 0.15s;
  }

  [aria-expanded='true'] > .pd-chevron {
    transform: rotate(90deg);
  }

  .pd-section-heading {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.1875rem;
    min-width: 0;
  }

  .pd-section-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
  }

  .pd-section-title {
    font-size: var(--lumo-font-size-l);
    font-weight: 600;
  }

  .pd-section-summary,
  .pd-section-description {
    font-size: var(--lumo-font-size-s);
    font-weight: 400;
  }

  .pd-section-description {
    color: var(--lumo-secondary-text-color);
  }

  .pd-section-body {
    display: grid;
    gap: var(--lumo-space-m);
    padding: 0 1.125rem 1.25rem 2.875rem;
  }

  /* Not the hidden attribute: a control inside would take it as its own and render nothing. */
  .pd-section-body.pd-closed {
    display: none;
  }

  @media (max-width: 40rem) {
    .pd-section-body {
      padding-left: 1.125rem;
    }
  }

  .pd-label {
    font-size: var(--lumo-font-size-s);
    font-weight: 500;
    color: var(--lumo-body-text-color);
  }

  /* SKU gets a row of its own when narrow, and double width when not: price,
     list price and weight are always short. */
  /* Narrow, the prices and weight go two to a row, so their labels fit. */
  .pd-basics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--lumo-space-m) 0.75rem;
  }

  .pd-more-button {
    align-self: end;
    justify-self: start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--lumo-size-m);
    height: var(--lumo-size-m);
    border-radius: var(--lumo-border-radius-m);
    color: var(--lumo-secondary-text-color);
    cursor: pointer;
  }

  .pd-more-button:hover,
  .pd-more-button[aria-expanded='true'] {
    background: var(--lumo-contrast-10pct);
    color: var(--lumo-body-text-color);
  }

  .pd-more-button:focus-visible {
    outline: 2px solid var(--lumo-primary-color-50pct);
    outline-offset: 1px;
  }

  .pd-code {
    padding: 0.0625rem 0.3125rem;
    border-radius: var(--lumo-border-radius-s);
    background: var(--lumo-contrast-10pct);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.9em;
  }

  .pd-with-help {
    position: relative;
    min-width: 0;
  }

  /* Just after the field's label text, which the "?" measures. */
  .pd-help {
    position: absolute;
    left: var(--pd-help-x, 0);
    top: var(--pd-help-y, 0);
    transform: translateY(-50%);
  }

  .pd-identifiers {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: var(--lumo-space-m) 0.75rem;
    --lumo-secondary-text-color: var(--lumo-body-text-color);
  }

  .pd-basics > * {
    min-width: 0;
  }

  .pd-basics > .pd-name,
  .pd-basics > .pd-sku {
    grid-column: 1 / -1;
  }

  @media (min-width: 40rem) {
    .pd-basics {
      grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto;
    }

    .pd-basics > .pd-sku {
      grid-column: auto;
    }
  }

  /* The shared fields draw their label in this color. None here has helper text. */
  .pd-basics > :not([readonly]) {
    --lumo-secondary-text-color: var(--lumo-body-text-color);
  }

  /* The preview's toggle sits on the description's label row. Open, the
     preview sits beside the description while both have room, and below it
     after. */
  .pd-description {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'text' 'body';
    align-items: start;
    gap: var(--lumo-space-s) var(--lumo-space-l);
  }

  .pd-description > foxy-internal-product-form-description-control {
    grid-area: text;
    min-width: 0;
  }

  @media (min-width: 60rem) {
    .pd-description:has(> [open]) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-areas: 'text body';
    }
  }

  .pd-org {
    display: grid;
    gap: 1px;
    overflow: hidden;
    border-radius: var(--lumo-border-radius-l);
  }

  /* Two columns, filled top to bottom: category and template, then collection and listing. */
  @media (min-width: 60rem) {
    .pd-org {
      grid-auto-flow: column;
      grid-template-rows: repeat(2, auto);
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  /* The listing switch sits in a cell of its own, with its "?" beside it. */
  .pd-org > .pd-org-cell {
    display: grid;
    padding: 0;
    background: none;
  }

  .pd-org > *,
  .pd-org-cell > foxy-internal-switch-control {
    padding: 0.5625rem 0.75rem;
    background: var(--lumo-contrast-5pct);
    cursor: pointer;
  }

  .pd-org > :not([disabled]):not([readonly]):not(.pd-org-cell):hover,
  .pd-org-cell > :not([disabled]):not([readonly]):hover {
    background: var(--lumo-contrast-10pct);
  }

  .pd-org > [disabled],
  .pd-org > [readonly] {
    cursor: default;
  }

  .pd-org > *::part(label),
  .pd-org-cell > *::part(label) {
    flex: 0 0 7.5rem;
    color: var(--lumo-secondary-text-color);
    font-size: var(--lumo-font-size-s);
  }

  @media (max-width: 40rem) {
    .pd-org > *::part(label),
    .pd-org-cell > *::part(label) {
      flex-basis: 6.25rem;
    }
  }

  .pd-org > *::part(value) {
    flex: 1 1 0;
    text-align: left;
    font-weight: 400;
  }

  /* What a row shows without a value of its own: the default, or what it inherits. */
  .pd-org > .pd-unset:not([disabled])::part(value) {
    color: var(--lumo-secondary-text-color);
  }

  .pd-option-values {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    margin: 0;
    padding: 0.625rem 0.75rem;
    border-radius: var(--lumo-border-radius-m);
    background: var(--lumo-contrast-5pct);
  }

  .pd-option-values dt {
    font-size: var(--lumo-font-size-xs);
    color: var(--lumo-secondary-text-color);
  }

  .pd-option-values dd {
    margin: 0;
    font-weight: 600;
  }

  .pd-button {
    height: 2.25rem;
    padding: 0 0.875rem;
    border-radius: var(--lumo-border-radius-s);
    font-size: var(--lumo-font-size-s);
    cursor: pointer;
  }

  .pd-button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .pd-button-primary {
    background: var(--lumo-primary-color);
    color: var(--lumo-primary-contrast-color);
    font-weight: 600;
  }

  .pd-button-secondary {
    background: var(--lumo-contrast-10pct);
  }

  .pd-button-tertiary {
    background: var(--lumo-primary-color-10pct);
    color: var(--lumo-primary-text-color);
  }

  .pd-button-danger {
    background: var(--lumo-error-color);
    color: var(--lumo-error-contrast-color);
    font-weight: 600;
  }

  .pd-button-danger-text {
    padding: 0 0.625rem;
    color: var(--lumo-error-text-color);
  }

  .pd-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.125rem;
    height: 2.125rem;
    border-radius: var(--lumo-border-radius-s);
    cursor: pointer;
  }

  .pd-icon-button:hover {
    background: var(--lumo-contrast-10pct);
  }

  .pd-mono {
    font-family: ui-monospace, Menlo, monospace;
    overflow-wrap: anywhere;
  }

  .pd-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    margin: 0;
    padding: 1rem;
    border: 0;
    background: rgba(26, 39, 55, 0.45);
    color: inherit;
  }

  .pd-overlay[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pd-overlay::backdrop {
    background: transparent;
  }

  .pd-overlay-side[open] {
    justify-content: flex-end;
    padding: 0;
  }

  .pd-overlay aside {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 32rem;
    max-width: 100%;
    height: 100%;
    background: var(--lumo-base-color);
    box-shadow: -8px 0 24px rgba(26, 39, 55, 0.18);
  }

  .pd-panel-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.125rem 1.25rem;
    border-bottom: 1px solid var(--lumo-contrast-10pct);
  }

  .pd-panel-body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 1rem;
    padding: 1.125rem 1.25rem;
    overflow-y: auto;
  }

  .pd-panel-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    border-top: 1px solid var(--lumo-contrast-10pct);
  }

  .pd-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .pd-field label {
    font-size: var(--lumo-font-size-s);
    font-weight: 500;
  }

  .pd-field input {
    box-sizing: border-box;
    width: 100%;
    height: 2.375rem;
    padding: 0 0.625rem;
    border: 1px solid var(--lumo-contrast-30pct);
    border-radius: var(--lumo-border-radius-s);
    background: var(--lumo-base-color);
    color: inherit;
    font-size: var(--lumo-font-size-s);
  }

  .pd-field input[aria-invalid='true'] {
    border-color: var(--lumo-error-color);
  }

  .pd-dialog {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-sizing: border-box;
    width: 30rem;
    max-width: 100%;
    max-height: 100%;
    padding: 1.375rem;
    overflow-y: auto;
    border-radius: var(--lumo-border-radius-l);
    background: var(--lumo-base-color);
    box-shadow: 0 16px 40px rgba(26, 39, 55, 0.25);
  }

  .pd-delete-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
    padding: 0.625rem 0.875rem 0.625rem 1.875rem;
    border-radius: var(--lumo-border-radius-m);
    background: var(--lumo-error-color-10pct);
    font-size: var(--lumo-font-size-s);
    list-style: disc;
  }
`;

/** Field labels in body text, so they stand apart from the helper text under them. */
export const labelStyles = css`
  vaadin-text-field:not([focused]):not([readonly]):not([disabled])::part(label),
  vaadin-text-area:not([focused]):not([readonly]):not([disabled])::part(label) {
    color: var(--lumo-body-text-color);
  }
`;

/** The rows of a list of values, the small fields in them and the icon buttons beside them. */
export const rowStyles = css`
  .pd-icon-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--lumo-border-radius-s);
    color: var(--lumo-secondary-text-color);
    cursor: pointer;
  }

  .pd-icon-button:hover:not(:disabled) {
    background: var(--lumo-contrast-10pct);
    color: var(--lumo-body-text-color);
  }

  .pd-icon-button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .pd-icon-button.pd-danger:hover:not(:disabled) {
    background: var(--lumo-error-color-10pct);
    color: var(--lumo-error-text-color);
  }

  .pd-icon-button:focus-visible,
  .pd-text-button:focus-visible,
  .pd-file:focus-within {
    outline: 2px solid var(--lumo-primary-color-50pct);
    outline-offset: 1px;
  }

  .pd-input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: 2.25rem;
    padding: 0 0.625rem;
    border: 1px solid var(--lumo-contrast-20pct);
    border-radius: var(--lumo-border-radius-s);
    background: var(--lumo-base-color);
    color: inherit;
    font: inherit;
    font-size: var(--lumo-font-size-s);
  }

  .pd-input::placeholder {
    color: var(--lumo-tertiary-text-color);
  }

  .pd-input:focus {
    border-color: var(--lumo-primary-color);
    outline: 2px solid var(--lumo-primary-color-50pct);
    outline-offset: -1px;
  }

  .pd-input[aria-invalid='true'] {
    border-color: var(--lumo-error-color);
  }

  .pd-input:disabled {
    opacity: 0.6;
  }

  .pd-input-small {
    height: 1.875rem;
    padding: 0 0.5rem;
  }

  .pd-mono {
    font-family: ui-monospace, Menlo, monospace;
  }

  .pd-values {
    display: grid;
    gap: 0.375rem;
  }

  .pd-value-head,
  .pd-value-main {
    display: grid;
    grid-template-columns: var(--pd-columns);
    gap: 0.5rem;
    align-items: center;
  }

  .pd-value-head {
    padding: 0 0.625rem;
    color: var(--lumo-secondary-text-color);
    font-size: var(--lumo-font-size-xs);
    font-weight: 500;
  }

  .pd-value {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.5rem;
    padding: 0.625rem;
    border-radius: var(--lumo-border-radius-m);
    background: var(--lumo-contrast-5pct);
  }

  .pd-value-extra {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem 0.75rem;
    font-size: var(--lumo-font-size-xs);
  }

  .pd-appearance {
    display: flex;
    flex: 1 1 14rem;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem 0.5rem;
    min-width: 0;
  }

  .pd-swatch-image {
    width: 1.875rem;
    height: 1.875rem;
    object-fit: cover;
    border-radius: var(--lumo-border-radius-s);
    box-shadow: inset 0 0 0 1px var(--lumo-contrast-20pct);
  }

  .pd-text-button,
  .pd-file {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    height: 1.875rem;
    padding: 0 0.5rem;
    border-radius: var(--lumo-border-radius-s);
    color: var(--lumo-secondary-text-color);
    font-size: var(--lumo-font-size-xs);
    white-space: nowrap;
    cursor: pointer;
  }

  .pd-file {
    border: 1px dashed var(--lumo-contrast-30pct);
    background: var(--lumo-base-color);
  }

  .pd-text-button:hover,
  .pd-file:hover {
    color: var(--lumo-body-text-color);
  }

  .pd-text-button.pd-set {
    color: var(--lumo-body-text-color);
    font-weight: 500;
  }

  .pd-file[aria-disabled='true'] {
    opacity: 0.5;
    cursor: default;
  }

  .pd-text-button > svg {
    transition: transform 0.15s;
  }

  .pd-text-button[aria-expanded='true'] > svg {
    transform: rotate(90deg);
  }

  .pd-amounts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: 0.5rem 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--lumo-contrast-10pct);
  }

  .pd-small-field {
    display: grid;
    gap: 0.1875rem;
    align-content: start;
    min-width: 0;
    font-size: var(--lumo-font-size-xs);
    font-weight: 500;
  }

  .pd-small-field > input {
    font-weight: 400;
  }

  .pd-small-field > span:not(.text-error) {
    color: var(--lumo-secondary-text-color);
    font-weight: 400;
  }

  .pd-url {
    display: inline-flex;
    flex: 1 1 14rem;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
    max-width: 24rem;
  }

  .pd-icon-button[aria-pressed='true'] {
    background: var(--lumo-primary-color-10pct);
    color: var(--lumo-primary-text-color);
  }
`;
