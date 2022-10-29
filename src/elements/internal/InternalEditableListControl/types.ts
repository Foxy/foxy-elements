import type { TemplateResult } from 'lit-html';

export type Item = { label?: string | TemplateResult; value: string };
export type Option = { label?: string; value: string };
