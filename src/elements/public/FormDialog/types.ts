import { Part, TemplateResult, html } from 'lit-html';

export type FormRenderer = (context: {
  html: typeof html;
  href: string;
  lang: string;
  parent: string;
  readonly: (part: Part) => void;
  disabled: (part: Part) => void;
  excluded: (part: Part) => void;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
}) => TemplateResult;
