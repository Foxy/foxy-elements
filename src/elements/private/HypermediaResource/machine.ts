import {
  ElementContext,
  ElementEvent,
  SetHrefEvent,
  SetParentEvent,
  SetPropertyEvent,
  SetResourceEvent,
} from './types';
import { assign, createMachine } from 'xstate';

import { RequestEvent } from '../../../events/request';
import config from './config.json';
import { isEqual } from 'lodash-es';

export const machine = createMachine<ElementContext, ElementEvent>(config, {
  guards: {
    hasFatalErrors: ctx => ctx.errors.some(err => err.type === 'fatal'),
    hasInputErrors: ctx => ctx.resource === null || ctx.errors.some(err => err.type === 'input'),
    hasSnapshot: ctx => ctx.resource !== null && ctx.href !== null,
    hasHrefOnly: ctx => ctx.href !== null && ctx.resource === null,
    hasChanges: ctx => ctx.backup !== null && !isEqual(ctx.resource, ctx.backup),
  },

  actions: {
    reset: assign<ElementContext, ElementEvent>({
      resource: null,
      backup: null,
      errors: [],
    }),

    setHref: assign<ElementContext, ElementEvent>({
      resource: null,
      backup: null,
      errors: [],
      href: (_, evt) => (evt as SetHrefEvent).data,
    }),

    setParent: assign<ElementContext, ElementEvent>({
      parent: (_, evt) => (evt as SetParentEvent).data,
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
      errors: ctx => {
        const newErrors = ctx.errors.filter(err => err.type !== 'input');

        if (ctx.resource !== null) {
          for (const target in ctx.resourceV8N) {
            for (const validate of ctx.resourceV8N[target]) {
              const code = validate(ctx.resource);

              if (typeof code === 'string') {
                newErrors.push({ type: 'input', code, target });
                break;
              }
            }
          }
        }

        return newErrors;
      },
    }),

    backupResource: assign({
      backup: ctx => ctx.resource,
    }),

    restore: assign<ElementContext, ElementEvent>({
      resource: (ctx: ElementContext) => ctx.backup,
      backup: null,
    }),

    setResource: assign<ElementContext, ElementEvent>({
      resource: (_: ElementContext, evt: ElementEvent) => (evt as SetResourceEvent).data,
      backup: null,
      errors: [],
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
        init: [ctx.parent!, { method: 'POST', body: JSON.stringify(ctx.resource) }],
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
