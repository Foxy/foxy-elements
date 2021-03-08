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

  .h-attribute-card {
    --padding: calc((var(--lumo-space-m) * 2));
    --border: 2px;
    --value: calc(var(--lumo-line-height-m) * var(--lumo-font-size-l));
    --name: calc(var(--lumo-line-height-m) * var(--lumo-font-size-xxs));

    height: calc(var(--border) + var(--padding) + var(--value) + var(--name));
  }

  .h-address-card {
    --padding: calc((var(--lumo-space-m) * 2));
    --content: calc(var(--lumo-line-height-m) * var(--lumo-font-size-m) * 3);
    --border: 2px;
    --space: var(--lumo-space-s);
    --label: calc(var(--lumo-line-height-m) * var(--lumo-font-size-xxs));

    height: calc(var(--border) + var(--padding) + var(--label) + var(--space) + var(--content));
  }
`;
