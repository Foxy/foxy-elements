/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Constructor, LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { BooleanSelector } from '@foxy.io/sdk/core';

type Base = Constructor<LitElement> & { properties?: PropertyDeclarations };
type TemplateFunction = typeof html;
export type Renderer<THost> = (html: TemplateFunction, host: THost) => TemplateResult;

export const ConfigurableMixin = <TBase extends Base>(BaseElement: TBase) => {
  return class ConfigurableElement extends BaseElement {
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

    /** Template render functions mapped to their name. */
    templates = {} as Partial<Record<string, Renderer<any>>>;

    /**
     * Toggles additional functionality for developers on and off. In particular,
     * setting this property (or attribute with the same name) to "development" will
     * start tracking changes in templates, allowing developers to edit HTML in the browser
     * and see results without having to refresh the page every time.
     */
    mode: 'development' | 'production' = 'production';

    /**
     * If true, makes every editable control inside of this element read-only.
     * This property is reflected to the `readonly` boolean attribute.
     *
     * @since 1.4.0
     */
    readonly = false;

    /**
     * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
     * controls to render as read-only. Parsed version of the `readonlycontrols` attribute value.
     *
     * @type {BooleanSelector}
     * @since 1.4.0
     * @default BooleanSelector.False
     */
    readonlyControls: BooleanSelector = BooleanSelector.False;

    /**
     * If true, disables every interactive control inside of this element.
     * This property is reflected to the `disabled` boolean attribute.
     *
     * @since 1.4.0
     */
    disabled = false;

    /**
     * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
     * controls to render as disabled.  Parsed version of the `disabledcontrols` attribute value.
     *
     * @type {BooleanSelector}
     * @since 1.4.0
     * @default BooleanSelector.False
     */
    disabledControls: BooleanSelector = BooleanSelector.False;

    /**
     * If true, hides every configurable control inside of this element.
     * This property is reflected to the `hidden` boolean attribute.
     *
     * @since 1.4.0
     */
    hidden = false;

    /**
     * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
     * controls to hide.  Parsed version of the `hiddencontrols` attribute value.
     *
     * @type {BooleanSelector}
     * @since 1.4.0
     * @default BooleanSelector.False
     */
    hiddenControls: BooleanSelector = BooleanSelector.False;

    private readonly __observer = new MutationObserver(() => this.__onMutation());

    /**
     * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `readonlyControls`
     * and `readonly` properties. If `readonly` is true, this selector will match any control,
     * otherwise it will match the same controls as in `readonlyControls`.
     *
     * @since 1.4.0
     */
    get readonlySelector(): BooleanSelector {
      return this.readonly ? BooleanSelector.True : this.readonlyControls;
    }

    /**
     * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `disabledControls`
     * and `disabled` properties. If `disabled` is true, this selector will match any control,
     * otherwise it will match the same controls as in `disabledControls`.
     *
     * @since 1.4.0
     */
    get disabledSelector(): BooleanSelector {
      return this.disabled ? BooleanSelector.True : this.disabledControls;
    }

    /**
     * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `hiddenControls`
     * and `hidden` properties. If `hidden` is true, this selector will match any control,
     * otherwise it will match the same controls as in `hiddenControls`.
     *
     * @since 1.4.0
     */
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

    firstUpdated(...args: Parameters<LitElement['firstUpdated']>): void {
      super.firstUpdated(...args);
      if (this.mode === 'production') this.compileTemplates();
    }

    updated(changes: Map<keyof this, unknown>): void {
      super.updated(changes);

      if (changes.has('mode')) {
        this.__observer.disconnect();
        if (this.mode === 'development') this.__observe();
      }
    }

    compileTemplates(replace = false): void {
      const templates = replace ? {} : { ...this.templates };

      Array.from(this.children).forEach(child => {
        const slot = child.getAttribute('slot');
        if (child.localName !== 'template' || slot === null) return;

        try {
          const script = `return html\`${child.innerHTML}\``;
          templates[slot] = new Function('html', 'host', script) as () => TemplateResult;
        } catch (err) {
          console.error(err);
        }
      });

      this.templates = templates;
    }

    protected _renderTemplateOrSlot(name: string) {
      if (!this.templates[name]) return html`<slot name=${name}></slot>`;

      const render = () => {
        try {
          const target = {} as unknown as this;
          const proxy = new Proxy(target, { get: (_, p) => this[p as keyof this] });
          return this.templates[name]?.(html, proxy);
        } catch (err) {
          console.error(err);
        }
      };

      return html`
        <foxy-internal-sandbox data-testid=${name} .render=${render}></foxy-internal-sandbox>
      `;
    }

    protected _getNestedTemplates<T extends Partial<Record<string, Renderer<any>>>>(id: string): T {
      const nestedTemplates = {} as T;

      Object.entries(this.templates).forEach(([key, value]) => {
        if (key.startsWith(`${id}:`)) {
          const zoomedKey = key.replace(`${id}:`, '');
          nestedTemplates[zoomedKey as keyof T] = value as T[keyof T];
        }
      });

      return nestedTemplates;
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
