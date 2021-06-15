/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Constructor, LitElement } from 'lit-element';

export const ResponsiveMixin = <TBase extends Constructor<LitElement>>(
  BaseElement: TBase
): TBase => {
  return class ResponsiveElement extends BaseElement {
    private __removeBreakpoints?: () => void;

    connectedCallback(): void {
      super.connectedCallback();

      const breakpoints = Object.entries({ sm: 640, md: 768, lg: 1024, xl: 1280 });
      const observer = new ResizeObserver(entries => {
        requestAnimationFrame(() => {
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
      });

      observer.observe(this);
      this.__removeBreakpoints = () => observer.disconnect();
    }

    disconnectedCallback(): void {
      super.disconnectedCallback();
      this.__removeBreakpoints?.();
    }
  };
};
