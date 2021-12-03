import { TemplateResult, html } from 'lit-html';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { Renderer } from '../../../mixins/configurable';
import { spread } from '@open-wc/lit-helpers';

export type Page = {
  _links: { next: { href: string }; self: { href: string } };
  returned_items: number;
  total_items: number;
  limit: number;
};

export type Context<TPage extends Page = Page> = {
  first: string;
  pages: TPage[];
  error: Response | null;
  manual: boolean;
};

export type ResumeEvent = {
  type: 'RESUME';
};

export type SetPagesEvent<TPage extends Page = Page> = {
  type: 'SET_PAGES';
  data: TPage[];
};

export type SetFirstEvent = {
  type: 'SET_FIRST';
  data: string;
};

export type SetManualEvent = {
  type: 'SET_MANUAL';
  data: boolean;
};

export type Event<TPage extends Page = Page> =
  | SetPagesEvent<TPage>
  | SetFirstEvent
  | SetManualEvent
  | ResumeEvent;

export type PageRendererContext<TPage extends Page = Page> = {
  readonlyControls: BooleanSelector;
  disabledControls: BooleanSelector;
  hiddenControls: BooleanSelector;
  templates: Partial<Record<string, Renderer<any>>>;
  readonly: boolean;
  disabled: boolean;
  hidden: boolean;
  spread: typeof spread;
  props: Record<string, unknown>;
  group: string;
  html: typeof html;
  href: string;
  lang: string;
  data: TPage | null;
  ns: string;
};

export type PageRenderer<TPage extends Page = Page> = (
  context: PageRendererContext<TPage>
) => TemplateResult;
