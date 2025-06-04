import type { SVGTemplateResult } from 'lit-html';

export type Status = { key: string; options?: unknown };

export type Badge = ({ key: string } | { text: string }) & {
  class?: string;
  icon?: SVGTemplateResult;
};
