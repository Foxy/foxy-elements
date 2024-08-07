import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { css } from 'lit-element';

registerStyles(
  'vaadin-date-picker-text-field',
  css`
    :host([theme~='summary-item'])::before {
      display: none;
    }

    :host([theme~='summary-item']) .vaadin-text-field-container {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: repeat(3, min-content);
      gap: 0 var(--lumo-space-m);
    }

    :host([theme~='summary-item']) [part='label'] {
      font: normal var(--lumo-font-size-m) var(--lumo-font-family);
      color: var(--lumo-body-text-color) !important;
      grid-row: 1;
      -webkit-text-fill-color: var(--lumo-body-text-color) !important;
    }

    :host([theme~='summary-item']) [part='helper-text'] {
      font: normal var(--lumo-font-size-s) var(--lumo-font-family);
      color: var(--lumo-secondary-text-color) !important;
      grid-row: 2;
    }

    :host([theme~='summary-item']) [part='helper-text']::before {
      display: none;
    }

    :host([theme~='summary-item']) [part='error-message'] {
      font: normal var(--lumo-font-size-s) var(--lumo-font-family);
      color: var(--lumo-error-text-color);
      grid-row: 3;
    }

    :host([theme~='summary-item']) [part='error-message'],
    :host([theme~='summary-item']) [part='helper-text'],
    :host([theme~='summary-item']) [part='label'] {
      line-height: var(--lumo-line-height-xs);
      grid-column: 1;
      padding: 0;
    }

    :host([theme~='summary-item']) [part='input-field'] {
      grid-column: 2;
      grid-row: 1;
      padding: 0;
      background: transparent;
      align-self: start;
      height: 1em;

      --lumo-icon-size-m: 1rem;
    }

    :host([theme~='summary-item']) [part='input-field']::after,
    :host([theme~='summary-item'][readonly]) [part='input-field'] slot[name='suffix'] {
      display: none;
    }

    :host([theme~='summary-item']) [part='value'] {
      line-height: var(--lumo-line-height-xs);
      text-align: right;
      min-height: auto;
      padding: 0;
      margin-right: var(--lumo-space-xs);
      -webkit-mask-image: none;
    }

    :host([theme~='summary-item'][readonly]) [part='value'] {
      margin-right: 0;
    }
  `
);
