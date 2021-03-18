import { Condition, DoneInvokeEvent } from 'xstate';
import { Context, Page, SetFirstEvent, SetPagesEvent } from './types';

export const isCollectionEmpty: Condition<Context, DoneInvokeEvent<Page>> = (_, evt) => {
  // `total_items` is a string due to a bug(?) in hAPI
  return evt.data.total_items == 0;
};

export const isEmptyString: Condition<Context, SetFirstEvent> = (_, evt) => {
  return evt.data.trim().length === 0;
};

export const isEmptyArray: Condition<Context, SetPagesEvent> = (_, evt) => {
  return evt.data.length === 0;
};

export const isLastPage: Condition<Context, DoneInvokeEvent<Page>> = (_, evt) => {
  return evt.data.returned_items < evt.data.limit;
};
