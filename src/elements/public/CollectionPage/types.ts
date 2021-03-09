import { TemplateResult, html } from 'lit-html';

import { HALJSONResource } from '../NucleonElement/types';
import { SpinnerState } from '../Spinner/Spinner';

export type HALJSONCollection = HALJSONResource & { _embedded: Record<string, unknown[]> };

export type SpinnerRendererContext = {
  state: SpinnerState;
  html: typeof html;
  lang: string;
};

export type ItemRendererContext = {
  parent: string;
  html: typeof html;
  lang: string;
  data: any;
};

export type SpinnerRenderer = (ctx: SpinnerRendererContext) => TemplateResult;
export type ItemRenderer = (ctx: ItemRendererContext) => TemplateResult;
