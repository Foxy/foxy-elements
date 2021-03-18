import { TemplateResult, html } from 'lit-html';

export type FormRenderer = (context: {
  html: typeof html;
  href: string;
  lang: string;
  parent: string;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
}) => TemplateResult;
