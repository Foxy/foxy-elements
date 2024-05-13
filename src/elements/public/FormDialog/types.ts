import { TemplateResult, html } from 'lit-html';
import { FormDialog } from './FormDialog';
import { spread } from '@open-wc/lit-helpers';

export type FormRendererContext = {
  html: typeof html;
  spread: typeof spread;
  dialog: FormDialog;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
};

export type FormRenderer = (context: FormRendererContext) => TemplateResult;
