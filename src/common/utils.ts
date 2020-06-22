export function define(name: string, constructor: CustomElementConstructor) {
  if (typeof window !== 'undefined' && !window.customElements.get(name)) {
    window.customElements.define(name, constructor);
  }
}

export const onEnter = (listener: (evt: KeyboardEvent) => void) => {
  return (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') listener(evt);
  };
}