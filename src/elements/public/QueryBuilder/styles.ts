import { css } from 'lit-element';

export const styles = css`
  .gap-1px {
    gap: 1px;
  }

  .grid-vertical {
    grid-template: auto / var(--lumo-size-m) 1fr;
  }

  :host([sm]) .sm-grid-horizontal {
    grid-template: auto / var(--lumo-size-m) 1fr var(--lumo-size-m) 1fr;
  }

  input::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    position: absolute;
    right: 0;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input {
    -moz-appearance: textfield;
  }

  foxy-internal-summary-control[layout='details'][count]:not([open]) {
    --lumo-contrast-5pct: var(--lumo-primary-color-10pct);
    color: var(--lumo-primary-text-color);
  }
`;
