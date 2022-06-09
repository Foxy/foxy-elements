import { Constructor, LitElement, PropertyDeclarations } from 'lit-element';

type Base = Constructor<LitElement> & { properties?: PropertyDeclarations };

export declare class InferrableMixinHost {
  infer: string | null;

  inferProperties(): void;

  inferFromElement(key: string, element: HTMLElement): unknown | undefined;

  inferPropertiesInDescendants(): void;

  applyInferredProperties(context: Map<string, unknown>): void;
}

export const InferrableMixin = <TBase extends Base>(
  BaseElement: TBase
): TBase & Constructor<InferrableMixinHost> & { inferredProperties: string[] } => {
  return class InferrableElement extends BaseElement {
    static get inferredProperties(): string[] {
      return [];
    }

    static get properties(): PropertyDeclarations {
      return {
        ...super.properties,
        infer: { type: String, reflect: true },
      };
    }

    /** Set a name for this element here to enable property inference. Set to `null` to disable. */
    infer: string | null = null;

    inferFromElement(key: string, element: HTMLElement): unknown | undefined {
      if (key in element) return (element as any)[key];
    }

    inferProperties(): void {
      const context = new Map<string, unknown>();
      const constructor = this.constructor as typeof InferrableElement;
      const contextKeysToInfer = new Set(constructor.inferredProperties);

      const processNode = (node: Node | null): void => {
        if (node) {
          if (node instanceof ShadowRoot) {
            processNode(node.host);
          } else if (node instanceof HTMLElement) {
            contextKeysToInfer.forEach(key => {
              const value = this.inferFromElement(key, node);
              if (value !== undefined) {
                context.set(key, value);
                contextKeysToInfer.delete(key);
              }
            });

            if (contextKeysToInfer.size > 0) processNode(node.parentNode);
          }
        }
      };

      processNode(this.parentNode);
      this.applyInferredProperties?.(context);
    }

    inferPropertiesInDescendants(): void {
      const roots = this.renderRoot === this ? [this.renderRoot] : [this.renderRoot, this];

      roots.forEach(root =>
        root
          .querySelectorAll<InferrableMixinHost & HTMLElement>('[infer]')
          .forEach(inferrable => inferrable.inferProperties())
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyInferredProperties(context: Map<string, unknown>): void {
      //
    }

    connectedCallback(): void {
      super.connectedCallback();
      this.inferPropertiesInDescendants();
    }

    updated(changes: Map<keyof this, unknown>): void {
      super.updated(changes);
      this.inferPropertiesInDescendants();
    }
  };
};
