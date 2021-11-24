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
`;
