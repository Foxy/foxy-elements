export function define(name: string, constructor: CustomElementConstructor) {
  if (typeof window !== 'undefined' && !window.customElements.get(name)) {
    window.customElements.define(name, constructor);
  }
}
