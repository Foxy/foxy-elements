import { PropertyDeclarations } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';

export abstract class CollectionTableCell<T> extends Translatable {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      context: { attribute: false },
    };
  }

  context: T | null = null;
}
