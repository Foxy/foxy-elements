import {
  ElementContext,
  ElementEvent,
  SetHrefEvent,
  SetPropertyEvent,
  SetResourceEvent,
} from './types';
import { assign, createMachine } from 'xstate';

import { RequestEvent } from '../../../events/request';
import config from './config.json';

export const machine = createMachine<ElementContext, ElementEvent>(config, {
  guards: {
    hasFatalErrors: ctx => ctx.errors.some(err => err.type === 'fatal'),
    hasInputErrors: ctx => ctx.errors.some(err => err.type === 'input'),
    hasResource: ctx => ctx.resource !== null,
    hasBackup: ctx => ctx.backup === null,
  },

  actions: {
    reset: assign<ElementContext, ElementEvent>({
      resource: null,
      backup: null,
      errors: [],
    }),

    setHref: assign({
      href: (_, evt) => (evt as SetHrefEvent).data,
    }),

    handleFatalError: assign({
      errors: (ctx, evt) => {
        console.error(evt);
        return [...ctx.errors, { type: 'fatal' }];
      },
    }),

    setPartialResource: assign({
      resource: (ctx, evt) => ({
        ...ctx.resource!,
        ...(evt as SetPropertyEvent).data,
      }),
    }),

    validateResource: assign<ElementContext, ElementEvent>({
      errors: [], // TODO
    }),

    backupResource: assign({
      backup: ctx => ctx.resource,
    }),

    restore: assign<ElementContext, ElementEvent>({
      resource: (ctx: ElementContext) => ctx.backup,
      backup: null,
    }),

    setResource: assign({
      resource: (_, evt) => (evt as SetResourceEvent).data,
      href: (_, evt) => (evt as SetResourceEvent).data?._links.self.href ?? null,
    }),
  },

  services: {
    async fetchResource(ctx: ElementContext) {
      const response = await RequestEvent.emit({
        source: ctx.element!,
        init: [ctx.href!],
      });

      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    },

    async createResource(ctx: ElementContext) {
      const response = await RequestEvent.emit({
        source: ctx.element!,
        init: ['foxy://create', { method: 'POST', body: JSON.stringify(ctx.resource) }],
      });

      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    },

    async updateResource(ctx: ElementContext) {
      const response = await RequestEvent.emit({
        source: ctx.element!,
        init: [ctx.href!, { method: 'PUT', body: JSON.stringify(ctx.resource) }],
      });

      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    },

    async deleteResource(ctx: ElementContext) {
      const response = await RequestEvent.emit({
        source: ctx.element!,
        init: [ctx.href!, { method: 'DELETE' }],
      });

      if (!response.ok) throw new Error(response.statusText);
      return null;
    },
  },
});
