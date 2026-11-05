const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function tabbables(container: HTMLElement): Element[] {
  return [...container.querySelectorAll(TABBABLE)];
}

/** Where focus is among the portal's tabbable controls, or `null` if outside them. */
export function focusIndex(container: HTMLElement): number | null {
  const root = container.getRootNode() as Document | ShadowRoot;
  const active = root.activeElement;
  if (!active) return null;
  const index = tabbables(container).indexOf(active);
  return index < 0 ? null : index;
}

/**
 * Moves focus into the page that just replaced the previous one: to the
 * control at `index` (what a Back returns to), or else to the page's `<h1>`.
 *
 * Swapping pages removes the focused control, which drops focus to `<body>`,
 * and a screen reader then has nothing to say about the new page. Pages load
 * their resource after mounting, so the target may not exist yet: this waits
 * for it, and falls back to the `<h1>` if the control at `index` never comes.
 *
 * Does nothing while focus is somewhere else on the host page: the portal is
 * a guest there, and a browser Back must not pull the customer into it.
 *
 * Returns a function that stops waiting.
 */
export function focusPage(
  container: HTMLElement,
  index: number | null,
  timeoutMs = 2000,
): () => void {
  const root = container.getRootNode();
  const host = root instanceof ShadowRoot ? root.host : null;

  const focusIsOurs = () => {
    const active = document.activeElement;
    return (
      !active ||
      active === document.body ||
      active === host ||
      container.contains(active)
    );
  };

  if (!focusIsOurs()) return () => {};

  let wanted = index;

  const attempt = () => {
    const target = (
      wanted === null
        ? container.querySelector("h1")
        : (tabbables(container)[wanted] ?? null)
    ) as HTMLElement | null;

    if (!target) return false;
    if (!focusIsOurs()) return true;

    // A heading is not focusable on its own. -1 keeps it out of the Tab order.
    if (wanted === null && !target.hasAttribute("tabindex")) {
      target.tabIndex = -1;
    }

    target.focus();
    return true;
  };

  if (attempt()) return () => {};

  const observer = new MutationObserver(() => {
    if (attempt()) stop();
  });

  const timer = setTimeout(() => {
    if (wanted === null) return stop();
    wanted = null;
    if (attempt()) stop();
  }, timeoutMs);

  function stop() {
    observer.disconnect();
    clearTimeout(timer);
  }

  observer.observe(container, { childList: true, subtree: true });
  return stop;
}
