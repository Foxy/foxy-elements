import { css } from 'lit-element';

export const vaadinRadioGroupStyles = css`
  :host(.foxy-internal-subscription-settings-form-reattempt-bypass) label {
    padding-bottom: var(--lumo-space-xs);
  }

  :host(.foxy-internal-subscription-settings-form-reattempt-bypass) [part='group-field'] {
    display: flex;
    border: thin solid var(--lumo-contrast-10pct);
    border-radius: var(--lumo-border-radius-l);
    transition: border-color 0.15s ease;
  }

  :host(.foxy-internal-subscription-settings-form-reattempt-bypass:not([disabled]):not([readonly]):hover)
    [part='group-field'] {
    border-color: var(--lumo-contrast-20pct);
  }
`;

export const vaadinRadioButtonStyles = css`
  :host(.foxy-internal-subscription-settings-form-reattempt-bypass) label {
    display: flex;
  }

  :host(.foxy-internal-subscription-settings-form-reattempt-bypass) [part='label'] {
    flex: 1;
  }
`;
