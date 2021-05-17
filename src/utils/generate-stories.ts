/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { html } from 'lit-html';
import parserBabel from 'prettier/esm/parser-babel.mjs';
import parserHtml from 'prettier/esm/parser-html.mjs';
import prettier from 'prettier/esm/standalone.mjs';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import hljs from 'highlight.js/lib/core.js';
import xml from 'highlight.js/lib/languages/xml.js';

hljs.registerLanguage('xml', xml);

type Params = {
  readonlyControls?: string[];
  disabledControls?: string[];
  hiddenControls?: string[];
  href: string;
  parent: string;
  title: string;
  tag: string;
};

export function generateStories({
  hiddenControls,
  readonlyControls,
  disabledControls,
  href,
  parent,
  title,
  tag,
}: Params) {
  const controls = Array.from(
    new Set([...(hiddenControls ?? []), ...(disabledControls ?? []), ...(readonlyControls ?? [])])
  );

  const Meta = {
    title,
    component: tag,
    argTypes: {
      lang: { control: { type: 'inline-radio', options: ['en', 'es'] } },
      href: { control: { type: 'text' } },
      parent: { control: { type: 'text' } },

      ...(readonlyControls
        ? {
            readonlyControls: { control: { type: 'check', options: readonlyControls } },
            readonly: { control: { type: 'boolean' } },
            readonlySelector: { control: false },
          }
        : {}),

      ...(disabledControls
        ? {
            disabledControls: { control: { type: 'check', options: disabledControls } },
            disabled: { control: { type: 'boolean' } },
            disabledSelector: { control: false },
          }
        : {}),

      ...(hiddenControls
        ? {
            hiddenControls: { control: { type: 'check', options: hiddenControls } },
            hidden: { control: { type: 'boolean' } },
            hiddenSelector: { control: false },
          }
        : {}),

      templates: { control: false },
      failure: { control: false },
      errors: { control: false },
      group: { control: false },
      form: { control: false },
      data: { control: false },
      mode: { control: false },
      ns: { control: false },
      t: { control: false },

      UpdateEvent: { control: false, table: { category: 'Static' } },
      Rumour: { control: false, table: { category: 'Static' } },
      API: { control: false, table: { category: 'Static' } },

      ...controls.reduce(
        (args, control) => ({
          ...args,
          [`${control}:before`]: { type: 'string', table: { category: 'Slots' } },
          [`${control}:after`]: { type: 'string', table: { category: 'Slots' } },
        }),
        {}
      ),
    },
  };

  const createTemplate = (name: string) => {
    return `
      <template slot="${name}">
        <div>$\{args.unsafeHTML(args["${name}"])}</div>
      </template>
    `;
  };

  const createControlTemplates = (name: string) => {
    const positions = ['before', 'after'];
    return positions.map(position => createTemplate(`${name}:${position}`)).join('');
  };

  const InternalPlayground = new Function(
    'args',
    `return args.html\`
      <div class="box">
        <${tag}
          disabledcontrols="\${args.disabledControls?.join(' ')}"
          readonlycontrols="\${args.readonlyControls?.join(' ')}"
          hiddencontrols="\${args.hiddenControls?.join(' ')}"
          ?disabled=$\{!!args.disabled}
          ?readonly=$\{!!args.readonly}
          ?hidden=$\{!!args.hidden}
          parent=\${args.parent}
          href=\${args.href}
          lang=\${args.lang}
          mode="development"
        >
          ${controls.map(name => createControlTemplates(name)).join('')}
        </${tag}>
      </div>

      <pre class="box"><code>$\{args.code}</code></pre>
    \`
  `
  );

  const InternalIdleTemplateState = new Function(
    'args',
    `return args.html\`
      <${tag}
        disabledcontrols="\${args.disabledControls?.join(' ')}"
        readonlycontrols="\${args.readonlyControls?.join(' ')}"
        hiddencontrols="\${args.hiddenControls?.join(' ')}"
        ?disabled=$\{!!args.disabled}
        ?readonly=$\{!!args.readonly}
        ?hidden=$\{!!args.hidden}
        parent="${parent}"
        lang=\${args.lang}
        mode="development"
      >
        ${controls.map(name => createControlTemplates(name)).join('')}
      </${tag}>
    \`
  `
  );

  const InternalIdleSnapshotState = new Function(
    'args',
    `return args.html\`
      <${tag}
        disabledcontrols="\${args.disabledControls?.join(' ')}"
        readonlycontrols="\${args.readonlyControls?.join(' ')}"
        hiddencontrols="\${args.hiddenControls?.join(' ')}"
        ?disabled=$\{!!args.disabled}
        ?readonly=$\{!!args.readonly}
        ?hidden=$\{!!args.hidden}
        parent="${parent}"
        href="${href}"
        lang=\${args.lang}
        mode="development"
      >
        ${controls.map(name => createControlTemplates(name)).join('')}
      </${tag}>
    \`
  `
  );

  const InternalBusyState = new Function(
    'args',
    `return args.html\`
      <${tag}
        disabledcontrols="\${args.disabledControls?.join(' ')}"
        readonlycontrols="\${args.readonlyControls?.join(' ')}"
        hiddencontrols="\${args.hiddenControls?.join(' ')}"
        ?disabled=$\{!!args.disabled}
        ?readonly=$\{!!args.readonly}
        ?hidden=$\{!!args.hidden}
        href="https://demo.foxycart.com/s/admin/sleep"
        lang=\${args.lang}
        mode="development"
      >
        ${controls.map(name => createControlTemplates(name)).join('')}
      </${tag}>
    \`
  `
  );

  const InternalFailState = new Function(
    'args',
    `return args.html\`
      <${tag}
        disabledcontrols="\${args.disabledControls?.join(' ')}"
        readonlycontrols="\${args.readonlyControls?.join(' ')}"
        hiddencontrols="\${args.hiddenControls?.join(' ')}"
        ?disabled=$\{!!args.disabled}
        ?readonly=$\{!!args.readonly}
        ?hidden=$\{!!args.hidden}
        href="https://demo.foxycart.com/s/admin/not-found"
        lang=\${args.lang}
        mode="development"
      >
        ${controls.map(name => createControlTemplates(name)).join('')}
      </${tag}>
    \`
  `
  );

  const getCode = (args: any) => {
    const templates: string[] = [];
    const attributes: string[] = [];
    const disabledcontrols = args.disabledControls?.join(' ');
    const readonlycontrols = args.readonlyControls?.join(' ');
    const hiddencontrols = args.hiddenControls?.join(' ');

    if (disabledcontrols) attributes.push(`disabledcontrols="${disabledcontrols}"`);
    if (readonlycontrols) attributes.push(`readonlycontrols="${readonlycontrols}"`);
    if (hiddencontrols) attributes.push(`hiddencontrols="${hiddencontrols}"`);
    if (args.parent) attributes.push(`parent="${args.parent}"`);
    if (args.group) attributes.push(`group="${args.group}"`);
    if (args.href) attributes.push(`href="${args.href}"`);
    if (args.lang) attributes.push(`lang="${args.lang}"`);
    if (args.hidden) attributes.push('hidden');
    if (args.disabled) attributes.push('disabled');
    if (args.readonly) attributes.push('readonly');

    controls.forEach(name => {
      ['before', 'after'].forEach(position => {
        const slot = `${name}:${position}`;
        const content = args[slot];

        if (content.includes('${')) {
          templates.push(`<template slot="${slot}"><div>${content}</div></template>`);
        } else if (content) {
          templates.push(`<div slot="${slot}">${content}</div>`);
        }
      });
    });

    try {
      const str = prettier.format(
        `<${tag} ${attributes.join(' ')}>
          ${templates.join('') || 'Hint: use controls to add custom content.'}
        </${tag}>`,
        {
          parser: 'babel',
          plugins: [parserBabel, parserHtml],
          printWidth: 120,
        }
      );

      // remove trailing semicolon
      const noSemiStr = str.substring(0, str.length - 2);
      console.log(hljs);

      return unsafeHTML(hljs.highlightAuto(noSemiStr).value);
    } catch (err) {
      return err.message;
    }
  };

  const Playground = (args: any) => {
    return InternalPlayground({ ...args, html, unsafeHTML, code: getCode(args) });
  };

  const IdleTemplateState = (args: any) => {
    return InternalIdleTemplateState({ ...args, html, unsafeHTML });
  };

  const IdleSnapshotState = (args: any) => {
    return InternalIdleSnapshotState({ ...args, html, unsafeHTML });
  };

  const BusyState = (args: any) => {
    return InternalBusyState({ ...args, html, unsafeHTML });
  };

  const FailState = (args: any) => {
    return InternalFailState({ ...args, html, unsafeHTML });
  };

  const commonArgs = {
    ...(readonlyControls ? { readonlyControls: [], readonly: false } : {}),
    ...(disabledControls ? { disabledControls: [], disabled: false } : {}),
    ...(hiddenControls ? { hiddenControls: [], hidden: false } : {}),

    lang: 'en',
    href: href,
    parent: parent,

    ...controls.reduce(
      (args, control) => ({ ...args, [`${control}:before`]: '', [`${control}:after`]: '' }),
      {}
    ),
  };

  Playground.args = commonArgs;
  IdleTemplateState.args = commonArgs;
  IdleSnapshotState.args = commonArgs;
  BusyState.args = commonArgs;
  FailState.args = commonArgs;

  return { Meta, Playground, IdleTemplateState, IdleSnapshotState, BusyState, FailState };
}
