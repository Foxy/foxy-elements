import { DemoDatabase, db, router, whenDbReady } from '../../../server/admin';
import { EventObject, State } from 'xstate';
import { expect, fixture, oneEvent } from '@open-wc/testing';

import { EventExecutor } from '@xstate/test/lib/types';
import { FetchEvent } from './FetchEvent';
import { HALJSONResource } from './types';
import { LitElement } from 'lit-element';
import { NucleonElement } from './NucleonElement';
import { createModel } from './createModel';
import { createTestMachine } from './createTestMachine';
import get from 'lodash-es/get';
import { html } from 'lit-html';

/**
 * @param element
 */
export function getRefs<TRefs extends Record<string, Element | Element[]>>(
  element: LitElement
): TRefs {
  const classes = Array.from(element.renderRoot.querySelectorAll('[data-testclass]')).reduce(
    (classMap, classRef) => {
      const className = classRef.getAttribute('data-testclass') as string;
      const classList = className.split(' ');

      return classList.reduce((updatedClassMap, classListItem) => {
        const updatedClassRefs = [...(updatedClassMap[classListItem] ?? []), classRef];
        return { ...updatedClassMap, [classListItem]: updatedClassRefs };
      }, classMap);
    },
    {} as Record<string, Element[]>
  );

  const ids = Array.from(element.renderRoot.querySelectorAll('[data-testid]')).reduce(
    (idMap, idRef) => ({ ...idMap, [idRef.getAttribute('data-testid')!]: idRef }),
    {} as Record<string, Element>
  );

  return { ...classes, ...ids } as TRefs;
}

/**
 * @param tests
 * @param state
 * @param context
 * @param event
 */
function runCustomTests<
  TData extends HALJSONResource,
  TElement extends NucleonElement<TData>,
  TRefs extends Record<string, Element | Element[]>,
  TEvent extends EventObject
>(
  tests: TestMap<TData, TElement, TRefs>,
  state: string,
  context: TestContext<TElement>,
  event: TEvent
) {
  let test = get(tests, `${state}.test`);
  if (typeof test !== 'function') test = get(tests, state);

  if (typeof test === 'function') {
    const refs = getRefs<TRefs>(context.element);
    return test({ ...context, refs }, event);
  }
}

type TestContext<TElement extends HTMLElement> = {
  element: TElement;
  events: FetchEvent[];
};

interface TestMap<
  TData extends HALJSONResource,
  TElement extends NucleonElement<TData>,
  TRefs extends Record<string, Element | Element[]>
> {
  [key: string]:
    | EventExecutor<TestContext<TElement> & { refs: TRefs }>
    | TestMap<TData, TElement, TRefs>;
}

type ElementConfig<
  TData extends HALJSONResource,
  TElement extends NucleonElement<TData>,
  TRefs extends Record<string, Element | Element[]>
> = {
  parent: string;
  maxTestsPerState: number;
  href: string;
  tag: string;
  assertions?: TestMap<TData, TElement, TRefs>;
  invalidate?: (form: TData) => TData;
  isEmptyValid?: boolean;
  actions?: {
    edit?: (context: TestContext<TElement> & { refs: TRefs; form: TData }) => Promise<void>;
    undo?: (context: TestContext<TElement> & { refs: TRefs }) => Promise<void>;
    delete?: (context: TestContext<TElement> & { refs: TRefs }) => Promise<void>;
    submit?: (context: TestContext<TElement> & { refs: TRefs }) => Promise<void>;
  };
};

/**
 * @param maxTimes
 */
function testDeepestAtMost(maxTimes: number) {
  const seenStates = new Map<string, number>();

  return (state: State<any, any, any>) => {
    const strings = state.toStrings();
    const depth = strings.length;
    const outermostNode = strings[0];

    const isDeepest =
      (outermostNode === 'fail' && depth === 1) ||
      (outermostNode === 'busy' && depth === 2) ||
      (outermostNode === 'idle' && depth === 4);

    if (isDeepest) {
      const deepestNode = strings[depth - 1] as string;
      const visitsSoFar = seenStates.get(deepestNode) ?? 0;

      seenStates.set(deepestNode, visitsSoFar + 1);
      return visitsSoFar <= maxTimes;
    }

    return true;
  };
}

/**
 * @param config
 */
export function generateTests<
  TData extends HALJSONResource,
  TElement extends NucleonElement<TData>,
  TRefs extends Record<string, Element | Element[]>
>(config: ElementConfig<TData, TElement, TRefs>): void {
  const model = createModel<TestContext<TElement>>(
    createTestMachine({
      hasDeleteButton: !!config.actions?.delete,
      hasSubmitButton: !!config.actions?.submit,
      hasUndoButton: !!config.actions?.undo,
      canBeInvalid: !!config.invalidate,
      isEmptyValid: config.isEmptyValid,
      isEditable: !!config.actions?.edit,
    }),
    {
      events: {
        async SET_HREF_VIA_ATTRIBUTE({ element }) {
          element.setAttribute('href', config.href);
          await element.updateComplete;
          expect(element).to.have.attribute('href', config.href);
          expect(element).to.have.property('href', config.href);
        },

        async SET_HREF_VIA_PROPERTY({ element }) {
          element.href = config.href;
          await element.updateComplete;
          expect(element).to.have.property('href', config.href);
        },

        async DONE_FETCHING({ element, events }) {
          const lastEvent = events[events.length - 1];
          const lastRequest = lastEvent.request;
          const method = lastRequest.method;
          const headers = lastRequest.headers;
          const request = new Request(config.href, { method, headers });

          lastEvent.respondWith(router.handleRequest(request)!.handlerPromise);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async FAIL_FETCHING({ element, events }) {
          const whenResponseReady = Promise.resolve(new Response(null, { status: 500 }));
          events[events.length - 1].respondWith(whenResponseReady);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async FAIL_DELETING({ element, events }) {
          const whenResponseReady = Promise.resolve(new Response(null, { status: 500 }));
          events[events.length - 1].respondWith(whenResponseReady);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async DONE_CREATING({ element, events }) {
          const lastEvent = events[events.length - 1];
          const lastRequest = lastEvent.request;
          const body = await lastRequest.clone().text();
          const method = lastRequest.method;
          const headers = lastRequest.headers;
          const request = new Request(config.parent, { body, method, headers });

          lastEvent.respondWith(router.handleRequest(request)!.handlerPromise);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async FAIL_CREATING({ element, events }) {
          const whenResponseReady = Promise.resolve(new Response(null, { status: 500 }));
          events[events.length - 1].respondWith(whenResponseReady);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async DONE_UPDATING({ element, events }) {
          const lastEvent = events[events.length - 1];
          const lastRequest = lastEvent.request;
          const body = await lastRequest.clone().text();
          const method = lastRequest.method;
          const headers = lastRequest.headers;
          const request = new Request(config.href, { body, method, headers });

          lastEvent.respondWith(router.handleRequest(request)!.handlerPromise);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async FAIL_UPDATING({ element, events }) {
          const whenResponseReady = Promise.resolve(new Response(null, { status: 500 }));
          events[events.length - 1].respondWith(whenResponseReady);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async DONE_DELETING({ element, events }) {
          const lastEvent = events[events.length - 1];
          const mockHandler = router.handleRequest(new Request(lastEvent.request.url))!; // don't actually delete, just send GET

          lastEvent.respondWith(mockHandler.handlerPromise);
          await oneEvent(element, 'update');
          await element.updateComplete;
        },

        async EDIT_INVALID_VIA_UI({ element, events }) {
          const response = await router.handleRequest(new Request(config.href))!.handlerPromise;
          const validForm = (await response.json()) as TData;

          await config.actions?.edit?.({
            form: config.invalidate!(validForm),
            refs: getRefs<TRefs>(element),
            element,
            events,
          });

          await element.updateComplete;
        },

        async EDIT_VALID_VIA_UI({ element, events }) {
          const response = await router.handleRequest(new Request(config.href))!.handlerPromise;

          await config.actions?.edit?.({
            form: (await response.json()) as TData,
            refs: getRefs<TRefs>(element),
            element,
            events,
          });

          await element.updateComplete;
        },

        async DELETE_VIA_API({ element }) {
          element.delete();
          await element.updateComplete;
        },

        async DELETE_VIA_UI({ element, events }) {
          await config.actions?.delete?.({ refs: getRefs<TRefs>(element), element, events });
          await element.updateComplete;
        },

        async SUBMIT_VIA_UI({ element, events }) {
          await config.actions?.submit?.({ refs: getRefs<TRefs>(element), element, events });
          await element.updateComplete;
        },

        async UNDO_VIA_UI({ element, events }) {
          await config.actions?.undo?.({ refs: getRefs<TRefs>(element), element, events });
          await element.updateComplete;
        },

        async SET_INVALID_DATA_VIA_PROPERTY({ element }) {
          const response = await router.handleRequest(new Request(config.href))!.handlerPromise;
          const validForm = (await response.json()) as TData;
          const invalidForm = config.invalidate!(validForm);

          element.data = invalidForm;
          await element.updateComplete;
          expect(element).to.have.deep.property('data', invalidForm);
          expect(element).to.have.deep.property('form', invalidForm);
        },

        async SET_VALID_DATA_VIA_PROPERTY({ element }) {
          const response = await router.handleRequest(new Request(config.href))!.handlerPromise;
          const validForm = (await response.json()) as TData;

          element.data = validForm;
          await element.updateComplete;
          expect(element).to.have.deep.property('data', validForm);
          expect(element).to.have.deep.property('form', validForm);
        },

        async SET_NULL_DATA_VIA_PROPERTY({ element }) {
          element.data = null;
          await element.updateComplete;
          expect(element).to.have.property('data', null);
          expect(element).to.have.deep.property('form', {});
        },

        async SET_LANG_VIA_PROPERTY({ element }) {
          element.lang = 'pt-br';
          await element.updateComplete;
          expect(element).to.have.property('lang', 'pt-br');
        },

        async SET_LANG_VIA_ATTRIBUTE({ element }) {
          element.setAttribute('lang', 'pt-br');
          await element.updateComplete;
          expect(element).to.have.attribute('lang', 'pt-br');
          expect(element).to.have.property('lang', 'pt-br');
        },

        async SET_GROUP_VIA_PROPERTY({ element }) {
          element.group = 'foo';
          await element.updateComplete;
          expect(element).to.have.property('group', 'foo');
        },

        async SET_GROUP_VIA_ATTRIBUTE({ element }) {
          element.setAttribute('group', 'foo');
          await element.updateComplete;
          expect(element).to.have.attribute('group', 'foo');
          expect(element).to.have.property('group', 'foo');
        },

        async SET_PARENT_VIA_PROPERTY({ element }) {
          element.parent = config.parent;
          await element.updateComplete;
          expect(element).to.have.property('parent', config.parent);
        },

        async SET_PARENT_VIA_ATTRIBUTE({ element }) {
          element.setAttribute('parent', config.parent);
          await element.updateComplete;
          expect(element).to.have.attribute('group', config.parent);
          expect(element).to.have.property('group', config.parent);
        },

        async EDIT_INVALID_VIA_API({ element }) {
          const response = await router.handleRequest(new Request(config.href))!.handlerPromise;
          const validForm = (await response.json()) as TData;
          const invalidForm = config.invalidate!(validForm);

          element.edit(invalidForm);
          await element.updateComplete;
          expect(element.form).to.deep.equal(invalidForm);
        },

        async EDIT_VALID_VIA_API({ element }) {
          const response = await router.handleRequest(new Request(config.href))!.handlerPromise;
          const validForm = (await response.json()) as TData;

          element.edit(validForm);
          await element.updateComplete;
          expect(element.form).to.deep.equal(validForm);
        },

        async SUBMIT_VIA_API({ element }) {
          element.submit();
          await element.updateComplete;
        },

        async UNDO_VIA_API({ element }) {
          element.undo();
          await element.updateComplete;
        },
      },

      tests: {
        async busy(context, event) {
          const match = context.element.in('busy');
          expect(match, 'matches state: busy').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'busy', context, event);
          }
        },

        async 'busy.fetching'(context, event) {
          const match = context.element.in({ busy: 'fetching' });
          expect(match, 'matches state: busy.fetching').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'busy.fetching', context, event);
          }
        },

        async 'busy.creating'(context, event) {
          const match = context.element.in({ busy: 'creating' });
          expect(match, 'matches state: busy.creating').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'busy.creating.test', context, event);
          }
        },

        async 'busy.updating'(context, event) {
          const match = context.element.in({ busy: 'updating' });
          expect(match, 'matches state: busy.updating').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'busy.updating', context, event);
          }
        },

        async 'busy.deleting'(context, event) {
          const match = context.element.in({ busy: 'deleting' });
          expect(match, 'matches state: busy.deleting').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'busy.deleting', context, event);
          }
        },

        async idle(context, event) {
          const match = context.element.in('idle');
          expect(match, 'matches state: idle').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle', context, event);
          }
        },

        async 'idle.template'(context, event) {
          const match = context.element.in({ idle: 'template' });
          expect(match, 'matches state: idle.template').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template', context, event);
          }
        },

        async 'idle.template.clean'(context, event) {
          const match = context.element.in({ idle: { template: 'clean' } });
          expect(match, 'matches state: idle.template.clean').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template.clean', context, event);
          }
        },

        async 'idle.template.clean.valid'(context, event) {
          const match = context.element.in({ idle: { template: { clean: 'valid' } } });
          expect(match, 'matches state: idle.template.clean.valid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template.clean.valid', context, event);
          }
        },

        async 'idle.template.clean.invalid'(context, event) {
          const match = context.element.in({ idle: { template: { clean: 'invalid' } } });
          expect(match, 'matches state: idle.template.clean.invalid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template.clean.invalid', context, event);
          }
        },

        async 'idle.template.dirty'(context, event) {
          const match = context.element.in({ idle: { template: 'dirty' } });
          expect(match, 'matches state: idle.template.dirty').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template.dirty', context, event);
          }
        },

        async 'idle.template.dirty.valid'(context, event) {
          const match = context.element.in({ idle: { template: { dirty: 'valid' } } });
          expect(match, 'matches state: idle.template.dirty.valid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template.dirty.valid', context, event);
          }
        },

        async 'idle.template.dirty.invalid'(context, event) {
          const match = context.element.in({ idle: { template: { dirty: 'invalid' } } });
          expect(match, 'matches state: idle.template.dirty.invalid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.template.dirty.invalid', context, event);
          }
        },

        async 'idle.snapshot'(context, event) {
          const match = context.element.in({ idle: 'snapshot' });
          expect(match, 'matches state: idle.snapshot').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot', context, event);
          }
        },

        async 'idle.snapshot.clean'(context, event) {
          const match = context.element.in({ idle: { snapshot: 'clean' } });
          expect(match, 'matches state: idle.snapshot.clean').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot.clean', context, event);
          }
        },

        async 'idle.snapshot.clean.valid'(context, event) {
          const match = context.element.in({ idle: { snapshot: { clean: 'valid' } } });
          expect(match, 'matches state: idle.snapshot.clean.valid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot.clean.valid', context, event);
          }
        },

        async 'idle.snapshot.clean.invalid'(context, event) {
          const match = context.element.in({ idle: { snapshot: { clean: 'invalid' } } });
          expect(match, 'matches state: idle.snapshot.clean.invalid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot.clean.invalid', context, event);
          }
        },

        async 'idle.snapshot.dirty'(context, event) {
          const match = context.element.in({ idle: { snapshot: 'dirty' } });
          expect(match, 'matches state: idle.snapshot.dirty').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot.dirty', context, event);
          }
        },

        async 'idle.snapshot.dirty.valid'(context, event) {
          const match = context.element.in({ idle: { snapshot: { dirty: 'valid' } } });
          expect(match, 'matches state: idle.snapshot.dirty.valid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot.dirty.valid', context, event);
          }
        },

        async 'idle.snapshot.dirty.invalid'(context, event) {
          const match = context.element.in({ idle: { snapshot: { dirty: 'invalid' } } });
          expect(match, 'matches state: idle.snapshot.dirty.invalid').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'idle.snapshot.dirty.invalid', context, event);
          }
        },

        async fail(context, event) {
          const match = context.element.in('fail');
          expect(match, 'matches state: fail').to.be.true;

          if (config.assertions) {
            await runCustomTests(config.assertions, 'fail', context, event);
          }
        },
      },
    }
  );

  const render = new Function(
    'html',
    'onFetch',
    `return html\`<${config.tag} @fetch=\${onFetch}></${config.tag}>\``
  );

  model.getSimplePathPlans({ filter: testDeepestAtMost(config.maxTestsPerState) }).forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const events: FetchEvent[] = [];
          const element = await fixture<TElement>(
            render(html, (evt: Event) => {
              if (evt instanceof FetchEvent) {
                evt.stopImmediatePropagation();
                evt.preventDefault();

                if (
                  evt.request.url === location.href ||
                  evt.request.url === element.href ||
                  evt.request.url === element.parent
                ) {
                  events.push(evt);
                } else {
                  router.handleEvent(evt);
                }
              }
            })
          );

          await path.test({ element, events });
          await whenDbReady;
          await DemoDatabase.fill(db.backendDB());
        });
      });
    });
  });
}
