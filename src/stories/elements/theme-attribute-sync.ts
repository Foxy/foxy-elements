type ThemeAttributeMapEntry = {
  attribute: string;
  cssVariable: `--${string}`;
  fallback: string;
};

type ShadcnInputMetrics = {
  outerHeightPx: number;
  paddingX: string;
  paddingY: string;
  fontSize: string;
};

const SHADCN_INPUT_PROBE_CLASS_NAME =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

function readCssVarValue(
  styles: CSSStyleDeclaration,
  cssVariable: `--${string}`,
  fallback: string,
): string {
  const value = styles.getPropertyValue(cssVariable).trim();
  return value || fallback;
}

export function applyThemeAttributeMap(
  element: HTMLElement,
  map: ThemeAttributeMapEntry[],
): void {
  const styles = getComputedStyle(document.documentElement);

  for (const entry of map) {
    element.setAttribute(
      entry.attribute,
      readCssVarValue(styles, entry.cssVariable, entry.fallback),
    );
  }
}

export function bindThemeAttributes<T extends HTMLElement>(
  elements: T | T[],
  apply: (element: T) => void,
): void {
  const targets = Array.isArray(elements) ? elements : [elements];

  const reapply = () => {
    for (const target of targets) {
      apply(target);
    }
  };

  const stopIfDetached = () => {
    if (targets.every((target) => !target.isConnected)) {
      cleanup();
    }
  };

  const themeObserver = new MutationObserver(() => {
    reapply();
    stopIfDetached();
  });

  const themeMutationConfig: MutationObserverInit = {
    attributes: true,
    attributeFilter: ["class", "data-theme", "style"],
  };

  themeObserver.observe(document.documentElement, themeMutationConfig);
  if (document.body) {
    themeObserver.observe(document.body, themeMutationConfig);
  }

  const lifecycleObserver = new MutationObserver(() => {
    stopIfDetached();
  });

  if (document.body) {
    lifecycleObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    reapply();
    stopIfDetached();
  };

  mediaQuery.addEventListener("change", onMediaChange);

  function cleanup() {
    themeObserver.disconnect();
    lifecycleObserver.disconnect();
    mediaQuery.removeEventListener("change", onMediaChange);
  }

  reapply();
}

export function getShadcnInputMetrics(): ShadcnInputMetrics {
  const probe = document.createElement("input");
  probe.type = "text";
  probe.className = SHADCN_INPUT_PROBE_CLASS_NAME;
  probe.tabIndex = -1;
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  probe.style.left = "-10000px";
  probe.style.top = "0";

  document.body.append(probe);

  const computed = getComputedStyle(probe);
  const height = probe.getBoundingClientRect().height;
  const heightPx = `${Math.max(Math.round(height), 0)}px`;

  const metrics: ShadcnInputMetrics = {
    outerHeightPx: Number.parseInt(heightPx, 10),
    paddingX: computed.paddingLeft,
    paddingY: computed.paddingTop,
    fontSize: computed.fontSize,
  };

  probe.remove();
  return metrics;
}

export type { ThemeAttributeMapEntry, ShadcnInputMetrics };