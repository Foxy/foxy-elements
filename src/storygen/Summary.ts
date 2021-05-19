export type Summary = {
  /** Set this property if element is using ConfigurableMixin. */
  configurable?: {
    /** Non-interactive controls. */
    sections?: string[];
    /** Interactive, but not editable controls. */
    buttons?: string[];
    /** Editable controls. */
    inputs?: string[];
  };
  /** Set this property if element is using TranslatableMixin. */
  translatable?: boolean;
  /** Lowercase tag name of this element. */
  localName: string;
  /** Set this property if element is extending NucleonElement. */
  nucleon?: boolean;
  /** Sample value for element.parent property. */
  parent?: string;
  /** Sample value for element.href property. */
  href?: string;
};
