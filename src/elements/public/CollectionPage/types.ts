import { TemplateResult, html } from 'lit-html';

import { HALJSONResource } from '../NucleonElement/types';

export type Page = HALJSONResource & { _embedded: Record<string, HALJSONResource[]> };
export type ExtractItem<T> = T extends { _embedded: Record<string, (infer U)[]> } ? U : never;

export type ItemRendererContext<TItem extends HALJSONResource = HALJSONResource> = {
  parent: string;
  group: string;
  html: typeof html;
  lang: string;
  href: string;
  data: TItem | null;
};

export type ItemRenderer<TItem extends HALJSONResource = HALJSONResource> = (
  ctx: ItemRendererContext<TItem>
) => TemplateResult;
