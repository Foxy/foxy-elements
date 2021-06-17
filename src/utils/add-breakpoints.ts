// eslint-disable-next-line sort-keys
const breakpoints = Object.entries({ sm: 640, md: 768, lg: 1024, xl: 1280 });

/**
 * @param element
 */
export function addBreakpoints(element: HTMLElement): () => void {
  const observer = new ResizeObserver(entries => {
    entries.forEach(({ contentRect, target }) => {
      breakpoints.forEach(([name, minWidth]) => {
        if (contentRect.width >= minWidth) {
          if (!target.hasAttribute(name)) target.setAttribute(name, '');
        } else {
          if (target.hasAttribute(name)) target.removeAttribute(name);
        }
      });
    });
  });

  observer.observe(element);
  return () => observer.disconnect();
}
