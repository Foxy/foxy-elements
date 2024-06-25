import type { TemplateResult } from 'lit-html';

export type Item = { label?: string | TemplateResult; value: string; unit?: string };
export type Unit = { label?: string; value: string };
export type Option = { label?: string; value: string };
