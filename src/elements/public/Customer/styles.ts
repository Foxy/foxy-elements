import { css } from 'lit-element';

export const styles = css`
  foxy-payment-method-card,
  foxy-attribute-card,
  foxy-address-card {
    width: 18rem;
  }

  .h-scroll {
    scroll-snap-type: x mandatory;
  }

  .h-scroll > * {
    display: inherit;
    flex: inherit;
  }

  .h-scroll * + * {
    margin-left: var(--lumo-space-m);
  }

  foxy-attribute-card,
  foxy-address-card {
    flex-shrink: 0;
    border: 1px solid var(--lumo-contrast-10pct);
    border-radius: var(--lumo-border-radius-l);
    scroll-snap-align: start;
  }

  foxy-attribute-card,
  foxy-address-card {
    padding: var(--lumo-space-m);
  }

  foxy-attribute-card:hover,
  foxy-address-card:hover {
    border-color: var(--lumo-contrast-30pct);
  }

  foxy-attribute-card:focus-within,
  foxy-address-card:focus-within {
    border-color: var(--lumo-primary-color);
    box-shadow: none;
  }

  foxy-collection-pages[item='foxy-attribute-card'] foxy-spinner,
  foxy-collection-pages[item='foxy-address-card'] foxy-spinner {
    border-radius: var(--lumo-border-radius-l);
    background: var(--lumo-contrast-10pct);
    min-width: 18rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  foxy-collection-pages[item='foxy-attribute-card'] foxy-spinner {
    --padding: calc((var(--lumo-space-m) * 2));
    --border: 2px;
    --value: calc(var(--lumo-line-height-m) * var(--lumo-font-size-l));
    --name: calc(var(--lumo-line-height-m) * var(--lumo-font-size-xxs));

    height: calc(var(--border) + var(--padding) + var(--value) + var(--name));
  }

  foxy-collection-pages[item='foxy-address-card'] foxy-spinner {
    --padding: calc((var(--lumo-space-m) * 2));
    --content: calc(var(--lumo-line-height-m) * var(--lumo-font-size-m) * 3);
    --border: 2px;

    height: calc(var(--border) + var(--padding) + var(--content));
  }
`;
