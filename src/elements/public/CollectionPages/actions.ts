import { Context, Page, SetFirstEvent, SetPagesEvent } from './types';
import { DoneInvokeEvent, assign } from 'xstate';

export const setError = assign<Context, DoneInvokeEvent<Response>>({
  error: (_, evt) => evt.data,
});

export const setFirst = assign<Context, SetFirstEvent>({
  first: (_, evt) => evt.data,
  pages: [],
  error: null,
});

export const setPages = assign<Context, SetPagesEvent>({
  first: (_, evt) => evt.data[0]?._links.self.href ?? '',
  pages: (_, evt) => evt.data,
  error: null,
});

export const addPage = assign<Context, DoneInvokeEvent<Page>>({
  pages: (ctx, evt) => (evt.data.returned_items === 0 ? ctx.pages : [...ctx.pages, evt.data]),
});
