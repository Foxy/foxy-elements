import type { SVGTemplateResult } from 'lit-html';

export type Status = {
  key: string;
  options?: unknown;
  /** Message style. Defaults to `success`. */
  type?: 'success' | 'error';
};

export type Badge = ({ key: string } | { text: string }) & {
  class?: string;
  icon?: SVGTemplateResult;
};
