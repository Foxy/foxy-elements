/**
 * Listens the way 2.0's `foxycart.js` does: jQuery's
 * `$('body').on(type, selector, handler)`, which walks from `event.target`
 * up through `parentNode` to `body`, running the handler for each ancestor
 * matching the selector. It prevents the default, as 2.0 does when it takes
 * over an add. Returns the elements it matched.
 */
export function listenLikeFoxy2(store: string): {
  clicked: HTMLAnchorElement[];
  submitted: HTMLFormElement[];
  stop(): void;
} {
  const clicked: HTMLAnchorElement[] = [];
  const submitted: HTMLFormElement[] = [];

  const delegate =
    <T extends Element>(selector: string, into: T[]) =>
    (event: Event) => {
      for (
        let node = event.target as Node | null;
        node && node !== document.body;
        node = node.parentNode
      ) {
        if (node instanceof Element && node.matches(selector)) {
          into.push(node as T);
          event.preventDefault();
        }
      }
    };

  const onClick = delegate<HTMLAnchorElement>(`a[href*="${store}/cart"]`, clicked);
  const onSubmit = delegate<HTMLFormElement>(`form[action*="${store}/cart"]`, submitted);
  document.body.addEventListener("click", onClick);
  document.body.addEventListener("submit", onSubmit);

  return {
    clicked,
    submitted,
    stop() {
      document.body.removeEventListener("click", onClick);
      document.body.removeEventListener("submit", onSubmit);
    },
  };
}

/** Waits for pending fetches and renders. */
export async function settle(ms = 20): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
