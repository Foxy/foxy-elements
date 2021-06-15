import { Context, Page, SetFirstEvent, SetManualEvent, SetPagesEvent } from './types';
import { DoneInvokeEvent, assign } from 'xstate';

export const setManual = assign<Context, SetManualEvent>({
  manual: (_, evt) => evt.data,
});

export const setError = assign<Context, DoneInvokeEvent<Response>>({
  error: (_, evt) => evt.data,
});

export const setFirst = assign<Context, SetFirstEvent>({
  error: null,
  first: (_, evt) => evt.data,
  pages: [],
});

export const setPages = assign<Context, SetPagesEvent>({
  error: null,
  first: (_, evt) => evt.data[0]?._links.self.href ?? '',
  pages: (_, evt) => evt.data,
});

export const addPage = assign<Context, DoneInvokeEvent<Page>>({
  pages: (ctx, evt) => (evt.data.returned_items === 0 ? ctx.pages : [...ctx.pages, evt.data]),
});
