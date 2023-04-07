import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html, svg } from 'lit-html';

const NS = 'downloadable-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying a downloadable resource (`fx:downloadable`).
 * Icons by {@link https://heroicons.com}.
 *
 * @element foxy-downloadable-card
 * @since 1.22.0
 */
export class DownloadableCard extends Base<Data> {
  renderBody(): TemplateResult {
    const extension = this.__extension;

    return html`
      <div class="flex gap-s">
        <div class="w-s h-s flex-shrink-0 rounded-s bg-contrast-5 flex" aria-hidden="true">
          ${extension.length < 5
            ? this.__renderExtension(extension)
            : svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="m-auto" style="width: 64%; height: 64%"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`}
        </div>
        <div class="flex-1 min-w-0">
          ${super.renderBody({
            title: data => html`
              <span class="inline-flex w-full items-center">
                <span class="mr-auto truncate min-w-0">${data.name} &bull; ${data.code}</span>
                <span class="text-s text-tertiary font-normal flex-shrink-0">
                  ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline" style="width: 1.15em; height: 1.15em"><path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" /><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clip-rule="evenodd" /></svg>`}
                  ${this.__formattedPrice}
                </span>
              </span>
            `,
            subtitle: data => html`${data.file_name} (${this.__formattedFileSize})`,
          })}
        </div>
      </div>
    `;
  }

  private get __formattedFileSize() {
    const fileSize = this.data?.file_size ?? 0;

    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    const options: Intl.NumberFormatOptions = { maximumFractionDigits: 2 };
    const lang = this.lang || 'en';

    try {
      if (fileSize / GB > 1) return `${(fileSize / GB).toLocaleString(lang, options)} GB`;
      if (fileSize / MB > 1) return `${(fileSize / MB).toLocaleString(lang, options)} MB`;
      if (fileSize / KB > 1) return `${(fileSize / KB).toLocaleString(lang, options)} KB`;

      return `${fileSize.toLocaleString(lang, options)} B`;
    } catch {
      return `${fileSize} B`;
    }
  }

  private get __formattedPrice() {
    const price = this.data?.price ?? 0;

    try {
      return price.toLocaleString(this.lang || 'en', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
    } catch {
      return String(price);
    }
  }

  private get __extension() {
    const parts = this.data?.file_name.split('.').filter(v => !!v) ?? [];
    return parts.length < 2 ? '?????' : (parts.pop() as string);
  }

  private __renderExtension(ext: string) {
    const style = `font: 700 calc(var(--lumo-size-s) / ${Math.max(2, ext.length)}) sans-serif`;
    return html`<span style=${style} class="m-auto font-medium uppercase">${ext}</span>`;
  }
}
