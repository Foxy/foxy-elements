import { TemplateResult, html } from 'lit-html';

import { FormDialog } from '.';

export type FormRendererContext = {
  html: typeof html;
  dialog: FormDialog;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
};

export type FormRenderer = (context: FormRendererContext) => TemplateResult;
