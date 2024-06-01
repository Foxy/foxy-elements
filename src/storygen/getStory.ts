import { TemplateResult, html } from 'lit-html';

import { Args } from './Args';
import { Summary } from './Summary';
import { getStoryArgs } from './getStoryArgs';
import { getStoryCode } from './getStoryCode';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

type Story = ((args: Args) => TemplateResult) & { args: Args };
type Params = Summary & { code?: boolean; ext?: string };
type TemplateArgs = {
  readonlyControls: string;
  disabledControls: string;
  hiddenControls: string;
  storyArgs: Args;
  readonly: boolean;
  disabled: boolean;
  hidden: boolean;
  parent: string;
  href: string;
  base: string;
  lang: string;
  code: TemplateResult;
  html: typeof html;
  unsafeHTML: typeof unsafeHTML;
};

export function getStory(params: Params): Story {
  const { sections = [], buttons = [], inputs = [] } = params.configurable ?? {};

  const interactiveControls = [...buttons, ...inputs];
  const allControls = [...sections, ...buttons, ...inputs];
  const localName = params.localName;
  const isNarrow = localName.endsWith('-form') || localName.endsWith('-card');

  const getTemplate = new Function(
    'args',
    `return args.html\`
      <div class="foxy-story ${isNarrow ? 'foxy-story--narrow' : ''}">
        <${params.localName}
          ${interactiveControls.length > 0 ? 'disabledcontrols="${args.disabledControls}"' : ''}
          ${inputs.length > 0 ? 'readonlycontrols="${args.readonlyControls}"' : ''}
          ${allControls.length > 0 ? 'hiddencontrols="${args.hiddenControls}"' : ''}
          ${params.parent ? 'parent=${args.parent}' : ''}
          ${params.href ? 'href=${args.href}' : ''}
          ${params.base ? 'base=${args.base}' : ''}
          ${params.translatable ? 'lang=${args.lang}' : ''}
          ${allControls.length > 0 ? 'mode="development"' : ''}
          ?disabled=\${args.disabled}
          ?readonly=\${args.readonly}
          ?hidden=\${args.hidden}
          class="foxy-story__preview"
          simplify-ns-loading
          ${params.ext ?? ''}
        >
          ${allControls
            .reduce<string[]>((slots, name) => {
              if (name.endsWith('default')) return [...slots, name];
              return [...slots, `${name}:before`, `${name}:after`];
            }, [])
            .reduce<string>((innerHTML, slot) => {
              const content = `args.storyArgs["${slot}"]`;
              const template = `args.html\`<template slot="${slot}"><div>\${args.unsafeHTML(${content})}</div></template>\``;
              return `${innerHTML}\${${content} ? ${template} : ''}`;
            }, '')}
        </${params.localName}>
        
        ${params.code ? '<pre>${args.code}</pre>' : ''}
      </div>
    \`
  `
  ) as (args: TemplateArgs) => TemplateResult;

  const Story = function (args: Args) {
    return getTemplate({
      readonlyControls: args.readonlyControls?.join(' ') ?? '',
      disabledControls: args.disabledControls?.join(' ') ?? '',
      hiddenControls: args.hiddenControls?.join(' ') ?? '',
      storyArgs: args,
      readonly: !!args.readonly,
      disabled: !!args.disabled,
      hidden: !!args.hidden,
      parent: args.parent ?? '',
      href: args.href ?? '',
      base: args.base ?? '',
      lang: args.lang ?? '',
      code: params.code ? getStoryCode(params, args) : html``,
      html,
      unsafeHTML,
    });
  };

  Story.args = getStoryArgs(params);

  return Story;
}
