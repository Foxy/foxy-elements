export type Args = { [key: string]: string | undefined } & {
  readonlyControls?: string[];
  readonly?: boolean;
  disabledControls?: string[];
  disabled?: boolean;
  hiddenControls?: string[];
  hidden?: boolean;
  parent?: string;
  href?: string;
  lang?: string;
};
