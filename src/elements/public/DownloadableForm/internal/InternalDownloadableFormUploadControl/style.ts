import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { css } from 'lit-element';

registerStyles(
  'vaadin-upload',
  css`
    :host(.foxy-downloadable-form-upload) vaadin-upload-file {
      padding: var(--lumo-space-s) 0 0 0;
      line-height: var(--lumo-line-height-xs);
    }

    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(commands) {
      margin-right: -4px;
    }

    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(progress) {
      margin-right: 2px;
      margin-left: 0;
    }

    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(start-button),
    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(clear-button),
    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(retry-button) {
      display: none;
    }

    :host(.foxy-downloadable-form-upload) [part='upload-button'] {
      margin: 0;
      border-radius: var(--lumo-border-radius-s);
    }

    :host(.foxy-downloadable-form-upload[disabled]) vaadin-upload-file::part(status) {
      color: var(--lumo-disabled-text-color);
    }

    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(warning-icon),
    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(done-icon) {
      width: 0;
      margin: 0;
      opacity: 0;
    }

    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(info) {
      align-items: flex-start;
    }

    :host(.foxy-downloadable-form-upload) vaadin-upload-file::part(name) {
      font-weight: 500;
    }
  `
);
