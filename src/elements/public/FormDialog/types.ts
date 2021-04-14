import { TemplateResult, html } from 'lit-html';

import { DBC } from '../../../utils/parse-dbc';

export type FormRenderer = (context: {
  html: typeof html;
  href: string;
  lang: string;
  parent: string;
  readonly: boolean | DBC;
  disabled: boolean | DBC;
  excluded: boolean | DBC;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
}) => TemplateResult;
