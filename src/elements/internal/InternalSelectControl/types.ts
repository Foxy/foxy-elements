export type Option = (
  | {
      /** I18n label key for the dropdown item. */
      label: string;
    }
  | {
      /** Translated label text. */
      rawLabel: string;
    }
) & {
  /** Dropdown item value. */
  value: string;
};
