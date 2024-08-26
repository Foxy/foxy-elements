import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { css } from 'lit-element';

registerStyles(
  'vaadin-checkbox',
  css`
    :host([data-async-list-control]) label {
      display: flex;
    }

    :host([data-async-list-control]) [part='label'] {
      width: 100%;
      margin: 0 !important;
    }
  `
);
