import { css } from 'lit-element';

export const style = css`
  #dialog {
    width: 100dvw;
    max-height: calc(100dvh - var(--lumo-space-m));
    max-width: none;
    opacity: 0;
    transform: translateY(100%);
    transition: all 500ms allow-discrete;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    margin: auto 0 0 0;
    border-radius: var(--lumo-border-radius-l) var(--lumo-border-radius-l) 0 0;
  }

  #dialog::backdrop {
    background-color: transparent;
    transition: all 500ms allow-discrete;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  #dialog[open] {
    opacity: 1;
    transform: none;
  }

  #dialog[open]::backdrop {
    background-color: var(--lumo-shade-50pct);
  }

  @starting-style {
    #dialog[open] {
      opacity: 0;
      transform: translateY(100%);
    }
  }

  @starting-style {
    #dialog[open]::backdrop {
      background-color: transparent;
    }
  }

  @media all and (min-width: 640px) {
    #dialog {
      max-width: 30rem;
      max-height: calc(100dvh - var(--lumo-space-m));
      transform: scale(1.1);
      margin: auto;
      border-radius: var(--lumo-border-radius-l);
    }

    @starting-style {
      #dialog[open] {
        transform: scale(1.1);
      }
    }
  }
`;
