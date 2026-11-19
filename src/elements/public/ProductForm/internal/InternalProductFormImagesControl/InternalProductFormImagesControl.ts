import type { ProductDefinitionImage } from '../../types';
import type { ProductForm } from '../../ProductForm';
import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ImageTooLargeError, isImageUrl } from '../../catalog';
import {
  ACCEPTED_IMAGE_TYPES,
  icon,
  iconButton,
  move,
  previewFallback,
  previewSrc,
  urlField,
} from '../fields';
import { rowStyles } from '../styles';
import { css, html } from 'lit-element';

/**
 * A product's images: upload, alt text, remove, and their order. Uploads go
 * straight to storage when picked, so the product must be saved first. The
 * first image is the main one, and the one the cart shows.
 *
 * @element foxy-internal-product-form-images-control
 */
export class InternalProductFormImagesControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __uploading: { attribute: false },
      __dragFrom: { attribute: false },
      __dragOver: { attribute: false },
      __error: { attribute: false },
      __byUrl: { attribute: false },
      __urlError: { attribute: false },
      getImages: { attribute: false },
      setImages: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      rowStyles,
      css`
        .pd-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
          gap: 0.5rem;
        }

        .pd-image,
        .pd-add {
          box-sizing: border-box;
          min-width: 0;
          border-radius: var(--lumo-border-radius-m);
        }

        .pd-image {
          display: grid;
          /* Without a column of its own the card grows to fit its widest child. */
          grid-template-columns: minmax(0, 1fr);
          align-content: start;
          gap: 0.375rem;
          padding: 0.375rem;
          border: 1px solid var(--lumo-contrast-10pct);
          background: var(--lumo-base-color);
        }

        .pd-image.pd-drop {
          border-color: var(--lumo-primary-color);
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
        }

        .pd-image.pd-dragging {
          opacity: 0.4;
        }

        .pd-image img {
          display: block;
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-contrast-5pct);
        }

        .pd-image img[draggable='true'] {
          cursor: grab;
        }

        .pd-main[aria-pressed='true'] {
          color: var(--lumo-primary-text-color);
          opacity: 1;
        }

        .pd-add {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          min-height: 9rem;
          border: 1px dashed var(--lumo-contrast-30pct);
          color: var(--lumo-primary-text-color);
          font-size: var(--lumo-font-size-s);
          font-weight: 500;
          cursor: pointer;
        }

        .pd-add:hover {
          background: var(--lumo-primary-color-10pct);
        }

        .pd-add:focus-within {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 1px;
        }
      `,
    ];
  }

  /** Reads images other than the form's own, such as a variant's. Uploads still use the form's product. */
  getImages: (() => ProductDefinitionImage[]) | null = null;

  /** Keeps the images that `getImages` reads. */
  setImages: ((images: ProductDefinitionImage[]) => void) | null = null;

  private __uploading = 0;

  private __error = '';

  /** Whether the URL field is in place of the upload, and why the URL in it was refused. */
  private __byUrl = false;

  private __urlError = '';

  /** What takes focus once the URL field opens or closes. */
  private __focusNext = '';

  /** The position of the image being dragged, and of the one it is over. */
  private __dragFrom: number | null = null;

  private __dragOver: number | null = null;

  renderControl(): TemplateResult {
    const form = this.nucleon as ProductForm | null;
    const images = this.__images;
    const inherited = form?.data?.compiled_definition?.images ?? [];
    const locked = this.disabled || this.readonly;
    const canUpload = !!form?.data?._links['fx:create_upload_url'] && !locked;

    return html`
      <div class="grid gap-xs">
        <div class="flex items-center" style="gap: 0.5rem; min-height: 1.875rem">
          <span class="text-s font-medium text-secondary">${this.t('label')}</span>
          ${iconButton({
            icon: 'link',
            label: this.t('by_url'),
            testid: 'images-by-url',
            disabled: locked,
            pressed: this.__byUrl,
            onClick: () => this.__toggleUrl(!this.__byUrl),
          })}
          ${this.__byUrl && !locked
            ? urlField({
                label: this.t('url_label'),
                addLabel: this.t('url_add'),
                error: this.__urlError,
                testid: 'images-url',
                onAdd: url => this.__addByUrl(url),
                onCancel: () => this.__toggleUrl(false),
              })
            : ''}
        </div>

        ${!form?.data
          ? html`<p class="text-s text-secondary" data-testid="save-first">
              ${this.t('save_first')}
            </p>`
          : ''}
        ${this.__error ? html`<p class="text-s text-error" role="alert">${this.__error}</p>` : ''}
        ${images.length === 0 && inherited.length > 0
          ? html`<p class="text-s text-secondary">
              ${this.t('inherited', { count: inherited.length })}
            </p>`
          : ''}
        ${images.length || canUpload
          ? html`
              <div class="pd-images" data-testid="thumbnails">
                ${images.map((image, index) => this.__renderImage(image, index, images, locked))}
                ${canUpload
                  ? html`
                      <label class="pd-add" data-testid="add-images">
                        ${icon('add')} ${this.__uploading ? this.t('uploading') : this.t('add')}
                        <input
                          class="sr-only"
                          type="file"
                          accept=${ACCEPTED_IMAGE_TYPES}
                          multiple
                          @change=${this.__handleFiles}
                        />
                      </label>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private __renderImage(
    image: ProductDefinitionImage,
    index: number,
    images: ProductDefinitionImage[],
    locked: boolean
  ) {
    const isMain = index === 0;
    const dragging = this.__dragFrom !== null;

    return html`
      <div
        class="pd-image ${this.__dragFrom === index ? 'pd-dragging' : ''} ${dragging &&
        this.__dragOver === index &&
        this.__dragFrom !== index
          ? 'pd-drop'
          : ''}"
        data-testid="image"
        @dragover=${(evt: DragEvent) => {
          if (!dragging) return;
          evt.preventDefault();
          this.__dragOver = index;
        }}
        @drop=${(evt: DragEvent) => {
          if (this.__dragFrom === null) return;
          evt.preventDefault();
          const from = this.__dragFrom;
          this.__endDrag();
          if (from !== index) this.__changeImages(move(images, from, index));
        }}
      >
        <img
          src=${previewSrc(image.src, (this.nucleon as ProductForm | null)?.getThumbnailUrl)}
          alt=${image.alt ?? ''}
          @error=${previewFallback(image.src)}
          draggable=${locked ? 'false' : 'true'}
          title=${locked ? '' : this.t('drag')}
          @dragstart=${(evt: DragEvent) => {
            // Firefox starts a drag only when it carries data.
            evt.dataTransfer?.setData('text/plain', String(index));
            if (evt.dataTransfer) evt.dataTransfer.effectAllowed = 'move';
            this.__dragFrom = index;
          }}
          @dragend=${this.__endDrag}
        />
        <div class="flex items-center">
          <button
            type="button"
            class="pd-icon-button pd-main"
            data-testid="image-main"
            aria-pressed=${isMain ? 'true' : 'false'}
            aria-label=${this.t(isMain ? 'main' : 'make_main')}
            title=${this.t(isMain ? 'main' : 'make_main')}
            ?disabled=${locked && !isMain}
            @click=${() => isMain || this.__changeImages(move(images, index, 0))}
          >
            ${icon('star', isMain)}
          </button>
          ${iconButton({
            icon: 'left',
            label: this.t('move_up'),
            testid: 'image-move-left',
            disabled: locked || isMain,
            onClick: () => this.__changeImages(move(images, index, index - 1)),
          })}
          ${iconButton({
            icon: 'right',
            label: this.t('move_down'),
            testid: 'image-move-right',
            disabled: locked || index === images.length - 1,
            onClick: () => this.__changeImages(move(images, index, index + 1)),
          })}
          <span class="flex-1"></span>
          ${iconButton({
            icon: 'remove',
            label: this.t('remove'),
            testid: 'image-remove',
            disabled: locked,
            onClick: () => this.__changeImages(images.filter((_, i) => i !== index)),
            danger: true,
          })}
        </div>
        <input
          class="pd-input pd-input-small"
          data-testid="image-alt"
          aria-label=${this.t('alt_label')}
          placeholder=${this.t('alt_label')}
          title=${this.t('alt_helper_text')}
          .value=${image.alt ?? ''}
          ?disabled=${locked}
          @change=${(evt: Event) => {
            const alt = (evt.currentTarget as HTMLInputElement).value;
            this.__changeImages(images.map((v, i) => (i === index ? { ...v, alt } : v)));
          }}
        />
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (!this.__focusNext) return;
    this.renderRoot.querySelector<HTMLElement>(`[data-testid="${this.__focusNext}"]`)?.focus();
    this.__focusNext = '';
  }

  private __toggleUrl(open: boolean) {
    this.__byUrl = open;
    this.__urlError = '';
    this.__focusNext = open ? 'images-url-input' : 'images-by-url';
  }

  private __addByUrl(src: string) {
    if (!isImageUrl(src)) {
      this.__urlError = this.t('url_invalid');
      return;
    }
    this.__changeImages([...this.__images, { src, alt: this.__defaultAlt }]);
    this.__toggleUrl(false);
  }

  /** A starting point the merchant should replace with a real description. */
  private get __defaultAlt(): string {
    const form = this.nucleon as ProductForm | null;
    const name = form?.form.definition?.name || form?.data?.compiled_definition?.name || '';
    return name ? this.t('alt_default', { name }) : '';
  }

  private __endDrag() {
    this.__dragFrom = null;
    this.__dragOver = null;
  }

  private get __images(): ProductDefinitionImage[] {
    if (this.getImages) return this.getImages();
    const form = this.nucleon as ProductForm | null;
    return form?.form.definition?.images ?? [];
  }

  // Not `__setImages`: Lit keeps the `setImages` property's value under that name.
  private __changeImages(images: ProductDefinitionImage[]) {
    if (this.setImages) return this.setImages(images);
    const form = this.nucleon as ProductForm | null;
    form?.edit({ definition: { ...form.form.definition, images } });
  }

  private async __handleFiles(evt: Event) {
    const input = evt.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const form = this.nucleon as ProductForm | null;
    input.value = '';
    if (!form || files.length === 0) return;

    this.__error = '';
    this.__uploading += files.length;

    for (const file of files) {
      try {
        const src = await form.uploadImage(file);
        this.__changeImages([...this.__images, { src, alt: this.__defaultAlt }]);
      } catch (err) {
        const key = err instanceof ImageTooLargeError ? 'error_too_large' : 'error_upload';
        this.__error = this.t(key, { file: file.name });
      } finally {
        this.__uploading -= 1;
      }
    }
  }
}
