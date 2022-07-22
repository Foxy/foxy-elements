/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Constructor, LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InferrableMixinHost } from './inferrable';

export declare class ConfigurableMixinHost {
  /** Template render functions mapped to their name. */
  templates: Partial<Record<string, Renderer<any>>>;

  /**
   * Toggles additional functionality for developers on and off. In particular,
   * setting this property (or attribute with the same name) to "development" will
   * start tracking changes in templates, allowing developers to edit HTML in the browser
   * and see results without having to refresh the page every time.
   */
  mode: 'development' | 'production';

  /**
   * If true, makes every editable control inside of this element read-only.
   * This property is reflected to the `readonly` boolean attribute.
   *
   * @since 1.4.0
   */
  readonly: boolean;

  /**
   * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
   * controls to render as read-only. Parsed version of the `readonlycontrols` attribute value.
   *
   * @type {BooleanSelector}
   * @since 1.4.0
   * @default BooleanSelector.False
   */
  readonlyControls: BooleanSelector;

  /**
   * If true, disables every interactive control inside of this element.
   * This property is reflected to the `disabled` boolean attribute.
   *
   * @since 1.4.0
   */
  disabled: boolean;

  /**
   * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
   * controls to render as disabled.  Parsed version of the `disabledcontrols` attribute value.
   *
   * @type {BooleanSelector}
   * @since 1.4.0
   * @default BooleanSelector.False
   */
  disabledControls: BooleanSelector;

  /**
   * If true, hides every configurable control inside of this element.
   * This property is reflected to the `hidden` boolean attribute.
   *
   * @since 1.4.0
   */
  hidden: boolean;

  /**
   * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
   * controls to hide.  Parsed version of the `hiddencontrols` attribute value.
   *
   * @type {BooleanSelector}
   * @since 1.4.0
   * @default BooleanSelector.False
   */
  hiddenControls: BooleanSelector;

  /**
   * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `readonlyControls`
   * and `readonly` properties. If `readonly` is true, this selector will match any control,
   * otherwise it will match the same controls as in `readonlyControls`.
   *
   * @since 1.4.0
   */
  get readonlySelector(): BooleanSelector;

  /**
   * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `disabledControls`
   * and `disabled` properties. If `disabled` is true, this selector will match any control,
   * otherwise it will match the same controls as in `disabledControls`.
   *
   * @since 1.4.0
   */
  get disabledSelector(): BooleanSelector;

  /**
   * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `hiddenControls`
   * and `hidden` properties. If `hidden` is true, this selector will match any control,
   * otherwise it will match the same controls as in `hiddenControls`.
   *
   * @since 1.4.0
   */
  get hiddenSelector(): BooleanSelector;

  /**
   * Looks for templates in element's children and compiles them to render functions.
   *
   * @param replace If true, all existing templates will be removed.
   */
  compileTemplates(replace?: boolean): void;

  /**
   * Renders a template with the given name if available and a slot otherwise.
   * For empty name looks for a "default" template first and renders it if found – otherwise renders a default slot.
   *
   * @param name Name of the template/slot to render.
   * @param context Context to provide template renderer with.
   */
  renderTemplateOrSlot(name?: string, context?: any): void;

  /**
   * Zooms into templates with complex names. For example, zooming on `customer` in `customer:header:before`
   * will return `header:before`.
   *
   * @param id Name to zoom on.
   */
  getNestedTemplates<T extends Partial<Record<string, Renderer<any>>>>(id: string): T;
}

type Base = Constructor<InferrableMixinHost> &
  Constructor<LitElement> & { properties?: PropertyDeclarations; inferredProperties: string[] };

type TemplateFunction = typeof html;

export type Renderer<THost> = (html: TemplateFunction, host: THost) => TemplateResult;

export const ConfigurableMixin = <TBase extends Base>(
  BaseElement: TBase
): TBase & Constructor<ConfigurableMixinHost> => {
  return class ConfigurableElement extends BaseElement {
    static get inferredProperties(): string[] {
      return [
        ...super.inferredProperties,
        'disabledSelector',
        'readonlySelector',
        'hiddenSelector',
        'templates',
        'disabled',
        'readonly',
        'hidden',
        'mode',
      ];
    }

    static get properties(): PropertyDeclarations {
      return {
        ...super.properties,

        templates: { attribute: false },
        mode: { type: String },

        readonly: { type: Boolean, reflect: true },
        readonlyControls: {
          attribute: 'readonlycontrols',
          converter: { fromAttribute: value => new BooleanSelector(value ?? '') },
        },

        disabled: { type: Boolean, reflect: true },
        disabledControls: {
          attribute: 'disabledcontrols',
          converter: { fromAttribute: value => new BooleanSelector(value ?? '') },
        },

        hidden: { type: Boolean, reflect: true },
        hiddenControls: {
          attribute: 'hiddencontrols',
          converter: { fromAttribute: value => new BooleanSelector(value ?? '') },
        },
      };
    }

    templates = {} as Partial<Record<string, Renderer<any>>>;

    mode: 'development' | 'production' = 'production';

    readonly = false;

    readonlyControls: BooleanSelector = BooleanSelector.False;

    disabled = false;

    disabledControls: BooleanSelector = BooleanSelector.False;

    hidden = false;

    hiddenControls: BooleanSelector = BooleanSelector.False;

    private readonly __observer = new MutationObserver(() => this.__onMutation());

    get readonlySelector(): BooleanSelector {
      return this.readonly ? BooleanSelector.True : this.readonlyControls;
    }

    get disabledSelector(): BooleanSelector {
      return this.disabled ? BooleanSelector.True : this.disabledControls;
    }

    get hiddenSelector(): BooleanSelector {
      return this.hidden ? BooleanSelector.True : this.hiddenControls;
    }

    connectedCallback(): void {
      super.connectedCallback();
      if (this.mode === 'development') this.__observe();
    }

    disconnectedCallback(): void {
      super.disconnectedCallback();
      this.__observer.disconnect();
    }

    protected firstUpdated(...args: Parameters<LitElement['firstUpdated']>): void {
      super.firstUpdated(...args);
      if (this.mode === 'production') this.compileTemplates();
    }

    protected updated(changes: Map<keyof this, unknown>): void {
      super.updated(changes);

      this.style.display = this.hidden ? 'none' : '';

      if (changes.has('mode')) {
        this.__observer.disconnect();
        if (this.mode === 'development') this.__observe();
      }
    }

    compileTemplates(replace = false): void {
      const templates = replace ? {} : { ...this.templates };

      Array.from(this.children).forEach(child => {
        if (child.localName !== 'template') return;
        const slot = child.getAttribute('slot') ?? 'default';

        try {
          const script = `return html\`${child.innerHTML}\``;
          templates[slot] = new Function('html', 'host', script) as () => TemplateResult;
        } catch (err) {
          console.error(err);
        }
      });

      this.templates = templates;
    }

    renderTemplateOrSlot(name?: string, context?: any) {
      const templateName = name ?? 'default';
      const template = this.templates[templateName];

      if (!template) return html`<slot name=${ifDefined(name)}></slot>`;

      const renderer = () => {
        try {
          const target = {} as unknown as this;
          const resolvedContext = context ?? this;
          const proxy = new Proxy(target, { get: (_, key) => resolvedContext[key] });

          return template?.(html, proxy);
        } catch (err) {
          console.error(err);
        }
      };

      return html`
        <foxy-internal-sandbox data-testid=${templateName} .render=${renderer}>
        </foxy-internal-sandbox>
      `;
    }

    getNestedTemplates<T extends Partial<Record<string, Renderer<any>>>>(id: string): T {
      const nestedTemplates = {} as T;

      Object.entries(this.templates).forEach(([key, value]) => {
        if (key.startsWith(`${id}:`)) {
          const zoomedKey = key.replace(`${id}:`, '');
          nestedTemplates[zoomedKey as keyof T] = value as T[keyof T];
        }
      });

      return nestedTemplates;
    }

    applyInferredProperties(context: Map<string, unknown>): void {
      super.applyInferredProperties(context);

      type Templates = ConfigurableMixinHost['templates'];
      type Mode = ConfigurableMixinHost['mode'];

      if (this.infer === null) return;

      const disabledSelector = context.get('disabledSelector') as BooleanSelector | undefined;
      const disabled = context.get('disabled') as boolean | undefined;

      const readonlySelector = context.get('readonlySelector') as BooleanSelector | undefined;
      const readonly = context.get('readonly') as boolean | undefined;

      const hiddenSelector = context.get('hiddenSelector') as BooleanSelector | undefined;
      const hidden = context.get('hidden') as boolean | undefined;

      const templates = context.get('templates') as Templates | undefined;
      const mode = context.get('mode') as Mode | undefined;

      const trueAsString = BooleanSelector.True.toString();
      const simplify = (selector: BooleanSelector, fallback?: boolean) => {
        return selector.toString() === trueAsString || (fallback ?? false);
      };

      const zoomIfNested = (selector?: BooleanSelector) => {
        return (this.infer ? selector?.zoom(this.infer) : selector) ?? BooleanSelector.False;
      };

      this.disabledControls = zoomIfNested(disabledSelector);
      this.disabled = simplify(this.disabledControls, disabled);

      this.readonlyControls = zoomIfNested(readonlySelector);
      this.readonly = simplify(this.readonlyControls, readonly);

      this.hiddenControls = zoomIfNested(hiddenSelector);
      this.hidden = simplify(this.hiddenControls, hidden);

      this.templates = templates ?? {};
      if (this.infer) this.templates = this.getNestedTemplates(this.infer);

      this.mode = mode ?? 'production';
    }

    private __observe() {
      this.__observer.observe(this, {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true,
      });

      this.__onMutation();
    }

    private __onMutation() {
      const config: MutationObserverInit = {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true,
      };

      this.__observer.disconnect();
      this.__observer.observe(this, config);

      Array.from(this.children).forEach(child => {
        if (child.localName !== 'template' || !child.hasAttribute('slot')) return;
        this.__observer.observe((child as HTMLTemplateElement).content, config);
      });

      this.compileTemplates(true);
    }
  };
};
