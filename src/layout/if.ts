import { TemplateResult, html } from 'lit-html';

type Content = string | TemplateResult;

export function If(condition: boolean, content: () => Content | Content[]) {
  return html`${condition ? content() : ''}`;
}
