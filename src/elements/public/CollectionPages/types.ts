import { TemplateResult, html } from 'lit-html';

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
};

export type IntersectionEvent = {
  type: 'INTERSECTION';
};

export type SetPagesEvent<TPage extends Page = Page> = {
  type: 'SET_PAGES';
  data: TPage[];
};

export type SetFirstEvent = {
  type: 'SET_FIRST';
  data: string;
};

export type Event<TPage extends Page = Page> =
  | SetPagesEvent<TPage>
  | SetFirstEvent
  | IntersectionEvent;

export type PageRendererContext<TPage extends Page = Page> = {
  group: string;
  html: typeof html;
  href: string;
  lang: string;
  data: TPage | null;
};

export type PageRenderer<TPage extends Page = Page> = (
  context: PageRendererContext<TPage>
) => TemplateResult;
