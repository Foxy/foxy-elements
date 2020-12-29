export type Resource = {
  readonly _links: {
    readonly self: {
      readonly href: string;
    };
  };
};

export type RestoreEvent = {
  type: 'RESTORE';
};

export type ReloadEvent = {
  type: 'RELOAD';
};

export type SubmitEvent = {
  type: 'SUBMIT';
};

export type DeleteEvent = {
  type: 'DELETE';
};

export type SetHrefEvent = {
  type: 'SET_HREF';
  data: string | null;
};

export type SetPropertyEvent<T extends Resource = any> = {
  type: 'SET_PROPERTY';
  data: Partial<T>;
};

export type SetResourceEvent<T extends Resource = any> = {
  type: 'SET_RESOURCE';
  data: T | null;
};

export type ElementError = { type: string };

export type ElementEvent<T extends Resource = any> =
  | ReloadEvent
  | SubmitEvent
  | DeleteEvent
  | SetHrefEvent
  | SetResourceEvent<T>
  | SetPropertyEvent<T>;

export type ElementContext<T extends Resource = any> = {
  href: string | null;
  errors: ElementError[];
  backup: T | null;
  element: HTMLElement | null;
  resource: T | null;
};
