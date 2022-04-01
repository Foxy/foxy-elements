import { TemplateResult, html } from 'lit-html';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { HALJSONResource } from '../NucleonElement/types';
import { Renderer } from '../../../mixins/configurable';
import { spread } from '@open-wc/lit-helpers';

export type Page = HALJSONResource & { _embedded: Record<string, HALJSONResource[]> };
export type ExtractItem<T> = T extends { _embedded: Record<string, (infer U)[]> } ? U : never;

export type ItemRendererContext<TItem extends HALJSONResource = HALJSONResource> = {
  readonlyControls: BooleanSelector;
  disabledControls: BooleanSelector;
  hiddenControls: BooleanSelector;
  templates: Partial<Record<string, Renderer<any>>>;
  readonly: boolean;
  disabled: boolean;
  previous: TItem | null;
  hidden: boolean;
  parent: string;
  spread: typeof spread;
  props: Record<string, unknown>;
  group: string;
  html: typeof html;
  lang: string;
  href: string;
  data: TItem | null;
  next: TItem | null;
  ns: string;
};

export type ItemRenderer<TItem extends HALJSONResource = HALJSONResource> = (
  ctx: ItemRendererContext<TItem>
) => TemplateResult;
