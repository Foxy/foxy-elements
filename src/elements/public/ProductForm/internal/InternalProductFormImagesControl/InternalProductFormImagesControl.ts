import type { ProductDefinitionImage } from '../../types';
import type { ProductForm } from '../../ProductForm';
import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-element';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';

/**
 * A product's images: upload, alt text, remove, and which one comes first.
 * Uploads go straight to storage when picked, so the product must be saved
 * first; the first image is the one the cart shows.
 *
 * @element foxy-internal-product-form-images-control
 */
export class InternalProductFormImagesControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __uploading: { attribute: false },
      __error: { attribute: false },
    };
  }

  private __uploading = 0;

  private __error = '';

  renderControl(): TemplateResult {
    const form = this.nucleon as ProductForm | null;
    const images = this.__images;
    const inherited = form?.data?.compiled_definition?.images ?? [];
    const canUpload = !!form?.data?._links['fx:create_upload_url'];
    const locked = this.disabled || this.readonly;

    return html`
      <div class="grid gap-s">
        <div class="flex items-center justify-between">
          <span class="text-l font-medium">${this.t('label')}</span>
          <label
            class="text-s font-medium ${canUpload && !locked
              ? 'text-primary cursor-pointer'
              : 'text-disabled'}"
          >
            ${this.__uploading ? this.t('uploading') : this.t('add')}
            <input
              class="sr-only"
              type="file"
              accept=${ACCEPTED_TYPES}
              multiple
              ?disabled=${!canUpload || locked}
              @change=${this.__handleFiles}
            />
          </label>
        </div>

        ${!canUpload ? html`<p class="text-s text-secondary">${this.t('save_first')}</p>` : ''}
        ${this.__error ? html`<p class="text-s text-error">${this.__error}</p>` : ''}
        ${images.length === 0 && inherited.length > 0
          ? html`<p class="text-s text-secondary">
              ${this.t('inherited', { count: inherited.length })}
            </p>`
          : ''}
        ${images.map(
          (image, index) => html`
            <div class="flex items-start" style="gap: 0.75rem">
              <img
                class="h-l w-l object-cover rounded-s bg-contrast-5 flex-shrink-0"
                src=${image.src}
                alt=${image.alt ?? ''}
              />
              <div class="flex-1 min-w-0 grid gap-xs">
                <vaadin-text-field
                  class="w-full"
                  label=${this.t('alt_label')}
                  helper-text=${this.t('alt_helper_text')}
                  .value=${image.alt ?? ''}
                  ?disabled=${locked}
                  @change=${(evt: Event) => {
                    const alt = (evt.currentTarget as HTMLInputElement).value;
                    this.__setImages(images.map((v, i) => (i === index ? { ...v, alt } : v)));
                  }}
                >
                </vaadin-text-field>
                <div class="flex text-s" style="gap: 1rem">
                  ${index === 0
                    ? html`<span class="text-secondary">${this.t('main')}</span>`
                    : html`
                        <button
                          class="text-primary"
                          ?disabled=${locked}
                          @click=${() =>
                            this.__setImages([image, ...images.filter((_, i) => i !== index)])}
                        >
                          ${this.t('make_main')}
                        </button>
                      `}
                  <button
                    class="text-error"
                    ?disabled=${locked}
                    @click=${() => this.__setImages(images.filter((_, i) => i !== index))}
                  >
                    ${this.t('remove')}
                  </button>
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private get __images(): ProductDefinitionImage[] {
    const form = this.nucleon as ProductForm | null;
    return form?.form.definition?.images ?? [];
  }

  private __setImages(images: ProductDefinitionImage[]) {
    const form = this.nucleon as ProductForm | null;
    form?.edit({ definition: { ...form.form.definition, images } });
  }

  private async __handleFiles(evt: Event) {
    const input = evt.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const form = this.nucleon as ProductForm | null;
    input.value = '';
    if (!form || files.length === 0) return;

    const name = form.form.definition?.name || form.data?.compiled_definition?.name || '';
    this.__error = '';
    this.__uploading += files.length;

    for (const file of files) {
      try {
        const src = await form.uploadImage(file);
        // A starting point the merchant should replace with a real description.
        const alt = name ? this.t('alt_default', { name }) : '';
        this.__setImages([...this.__images, { src, alt }]);
      } catch {
        this.__error = this.t('error_upload', { file: file.name });
      } finally {
        this.__uploading -= 1;
      }
    }
  }
}
