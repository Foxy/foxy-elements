import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Themeable } from '../../../../mixins/themeable';
import { PictureGrid } from './PictureGrid';
import { Picture } from './Picture';

class Bundle extends PictureGrid<PreviewItem[]> {
  public static get scopedElements(): ScopedElementsMap {
    return { ...super.scopedElements, 'x-pic': Picture };
  }
}

class BundleGrid extends PictureGrid<PreviewItem[][]> {
  public static get scopedElements(): ScopedElementsMap {
    return { ...super.scopedElements, 'x-pic': Bundle };
  }
}

export interface PreviewItem {
  quantity: number;
  image: string;
}

export class Preview extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-picture': Picture,
      'x-bundle-grid': BundleGrid,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      quantity: { attribute: false },
      image: { attribute: false },
      items: { attribute: false },
    };
  }

  public quantity = 0;

  public image?: string;

  public items: PreviewItem[] = [];

  public render(): TemplateResult {
    const { quantity, image = '' } = this;
    const empty = quantity === 0;
    const style = 'w-full h-full';

    if (this.items.length === 0) {
      return html`<x-picture class=${style} .data=${{ quantity, image }}></x-picture>`;
    } else {
      const data = new Array(Math.max(1, quantity)).fill(this.items);
      return html`<x-bundle-grid class=${style} .empty=${empty} .data=${data}></x-bundle-grid>`;
    }
  }
}
