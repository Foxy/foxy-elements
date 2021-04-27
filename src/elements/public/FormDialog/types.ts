import { Part, TemplateResult, html } from 'lit-html';

export type FormRendererContext = {
  html: typeof html;
  href: string;
  lang: string;
  parent: string;
  readonly: (part: Part) => void;
  disabled: (part: Part) => void;
  excluded: (part: Part) => void;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
};

export type FormRenderer = (context: FormRendererContext) => TemplateResult;
