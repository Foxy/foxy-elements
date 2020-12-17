type FoxyElement = typeof HTMLElement & {
  defaultNodeName: string;
};

export function define(element: FoxyElement): void {
  if (customElements.get(element.defaultNodeName)) {
    console.info(`@foxy.io/element: using custom ${element.defaultNodeName}`);
  } else {
    customElements.define(element.defaultNodeName, element);
  }
}
