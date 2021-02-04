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

  foxy-attribute-card {
    padding: calc(var(--lumo-space-m) / var(--lumo-line-height-s)) var(--lumo-space-m);
  }

  foxy-address-card {
    padding: calc(var(--lumo-space-m) / var(--lumo-line-height-m)) var(--lumo-space-m);
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
`;
