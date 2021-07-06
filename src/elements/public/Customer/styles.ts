import { css } from 'lit-element';

export const styles = css`
  :host {
    --tile-width: 16rem;
  }

  .w-tile {
    width: var(--tile-width);
  }

  .w-payment-method-card {
    width: calc(var(--tile-width) + ((var(--lumo-space-m) * 2)) + 2px);
  }
`;
