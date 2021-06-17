import { PropertyDeclarations } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';

export class SignableFields extends Translatable {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      open: { type: Object },
      signatures: {
        type: Object,
        converter: value => {
          const v = JSON.parse(value!) as unknown as Record<string, string>;
          for (const k of Object.keys(v)) {
            if ((v[k] as string).length != 64) {
              console.error(
                'There is something wrong with the signature. It should have 64 characters.'
              );
            }
          }
          return v;
        },
      },
    };
  }

  /**
   * Optional open: An Object with key, value pairs where the key is a item
   * attribute and the value is a previously computed HMAC validation code.
   *
   * **Important security information:** this web component does not generate or validates the HMAC validation code.
   * Please, refer to [the Product Verification page](https://wiki.foxycart.com/v/2.0/hmac_validation) for more information and tools for generating the codes.
   */
  public signatures?: Record<string, string>;

  /**
   * Optional open: An Object with key, value pairs where the key is a item
   * attribute and the value is a boolean indicating that the property is editable by the user.
   *
   * **Advanced use only**: this web component does not provide means for the user to alter item attributes.
   *
   * See [Product Verification](https://wiki.foxycart.com/v/2.0/hmac_validation) for more information.
   */
  public open?: Record<string, boolean>;

  /**
   * Concatenates the fieldName and it's signature.
   *
   * This method does not compute the signature. It must be provided.
   * Signatures should not be computed in the frontend.
   *
   * The unaltered field name is returned if there is no available signature.
   *
   * @param fieldName
   * @param fieldName the name of the field to get the signed version.
   */
  public signedName(fieldName: string): string {
    if (this.signatures && this.signatures[fieldName]) {
      return `${fieldName}||${this.signatures[fieldName]}${this.isOpen(fieldName) ? '||open' : ''}`;
    } else {
      return fieldName;
    }
  }

  /**
   * Checks if a given field is user editable.
   *
   * @param fieldName
   * @param fieldName the name of the field to check if it is user editable.
   * @returns editable true if it is editable, false otherwise.
   */
  public isOpen(fieldName: string): boolean {
    return !!(this.open && this.open[fieldName]);
  }
}
