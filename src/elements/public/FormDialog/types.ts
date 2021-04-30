import { html, TemplateResult } from 'lit-html';
import { booleanSelectorOf } from '../../../utils/boolean-selector-of';

export type FormRendererContext = {
  html: typeof html;
  href: string;
  lang: string;
  parent: string;
  readonly: ReturnType<typeof booleanSelectorOf>;
  disabled: ReturnType<typeof booleanSelectorOf>;
  excluded: ReturnType<typeof booleanSelectorOf>;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
};

export type FormRenderer = (context: FormRendererContext) => TemplateResult;
