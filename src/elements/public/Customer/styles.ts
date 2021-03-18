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

  :host([md]) .w-payment-method-card,
  :host([lg]) .w-payment-method-card,
  :host([xl]) .w-payment-method-card {
    --padding: calc((var(--lumo-space-m) * 4));
    --border: 2px;
    --value: calc(var(--lumo-line-height-m) * var(--lumo-font-size-l) * 2);
    --name: calc(var(--lumo-line-height-m) * var(--lumo-font-size-xxs));
    --height: calc(var(--border) + var(--padding) + var(--value) + var(--name));

    width: calc(var(--height) / 9 * 16);
  }
`;
