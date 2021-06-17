import { StateMachine, createMachine } from 'xstate';

type TestMachine = StateMachine<any, any, any>;

export type TestMachineOptions = {
  isEditable?: boolean;
  isEmptyValid?: boolean;
  canBeInvalid?: boolean;
  hasUndoButton?: boolean;
  hasSubmitButton?: boolean;
  hasDeleteButton?: boolean;
};

export const createTestMachine = (options?: TestMachineOptions): TestMachine =>
  createMachine({
    id: 'element',

    on: {
      /** `element.delete()` always triggers resource deletion */
      DELETE_VIA_API: 'busy.deleting',

      ...(options?.canBeInvalid
        ? {
            /** `element.data =invalidValue` always triggers this transition */
            SET_INVALID_DATA_VIA_PROPERTY: 'idle.snapshot.clean.invalid',
          }
        : {}),

      /** `element.setAttribute('group', value)` switches FoxySDK.Core.Rumour instances, but doesn't change state */
      SET_GROUP_VIA_ATTRIBUTE: { internal: true },
      /** `element.group = value` switches FoxySDK.Core.Rumour instances, but doesn't change state */
      SET_GROUP_VIA_PROPERTY: { internal: true },
      /** `element.setAttribute('href', value)` always triggers resource (re)loading */
      SET_HREF_VIA_ATTRIBUTE: 'busy.fetching',
      /** `element.href = value` always triggers resource (re)loading */
      SET_HREF_VIA_PROPERTY: 'busy.fetching',
      /** `element.setAttribute('lang', value)` loads translations and triggers update, but doesn't change state */
      SET_LANG_VIA_ATTRIBUTE: { internal: true },
      /** `element.lang = value` loads translations and triggers update, but doesn't change state */
      SET_LANG_VIA_PROPERTY: { internal: true },
      /** `element.data =null` always triggers this transition */
      SET_NULL_DATA_VIA_PROPERTY: `idle.template.clean.${
        options?.isEmptyValid ? 'valid' : 'invalid'
      }`,
      /** `element.setAttribute('parent', value)` sets collection URI, but doesn't change state */
      SET_PARENT_VIA_ATTRIBUTE: { internal: true },
      /** `element.parent = value` sets collection URI, but doesn't change state */
      SET_PARENT_VIA_PROPERTY: { internal: true },
      /** `element.data =validValue` always triggers this transition */
      SET_VALID_DATA_VIA_PROPERTY: 'idle.snapshot.clean.valid',
    },

    initial: 'idle',

    states: {
      busy: {
        on: {
          ...(options?.canBeInvalid
            ? {
                /** `element.edit(invalidEdit)` has no effect in this state */
                EDIT_INVALID_VIA_API: { internal: true },
              }
            : {}),
          /** `element.edit(validEdit)` has no effect in this state */
          EDIT_VALID_VIA_API: { internal: true },
          /** `element.submit()` has no effect in this state */
          SUBMIT_VIA_API: { internal: true },
          /** `element.undo()` has no effect in this state */
          UNDO_VIA_API: { internal: true },
        },

        states: {
          fetching: {
            on: {
              /** `GET` to `element.href` returns valid resource */
              DONE_FETCHING: '#element.idle.snapshot.clean.valid',
              /** `GET` to `element.href` fails with non-2XX status */
              FAIL_FETCHING: '#element.fail',
            },
          },

          creating: {
            on: {
              /** `POST` to `element.parent` returns valid resource */
              DONE_CREATING: '#element.idle.snapshot.clean.valid',
              /** `POST` to `element.parent` fails with non-2XX status */
              FAIL_CREATING: '#element.fail',
            },
          },

          updating: {
            on: {
              /** `PATCH` to `element.href` returns valid resource */
              DONE_UPDATING: '#element.idle.snapshot.clean.valid',
              /** `PATCH` to `element.href` fails with non-2XX status */
              FAIL_UPDATING: '#element.fail',
            },
          },

          deleting: {
            on: {
              /** `DELETE` to `element.href` succeeds with 2XX status */
              DONE_DELETING: `#element.idle.template.clean.${
                options?.isEmptyValid ? 'valid' : 'invalid'
              }`,
              /** `DELETE` to `element.href` fails with non-2XX status */
              FAIL_DELETING: '#element.fail',
            },
          },
        },
      },

      fail: {
        on: {
          ...(options?.canBeInvalid
            ? {
                /** calling `element.edit(invalidEdit)` has no effect in this state */
                EDIT_INVALID_VIA_API: { internal: true },
              }
            : {}),
          /** calling `element.edit(validEdit)` has no effect in this state */
          EDIT_VALID_VIA_API: { internal: true },
          /** calling `element.submit()` has no effect in this state */
          SUBMIT_VIA_API: { internal: true },
          /** calling `element.undo()` has no effect in this state */
          UNDO_VIA_API: { internal: true },
        },
      },

      idle: {
        initial: 'template',

        on: {
          ...(options?.hasDeleteButton
            ? {
                /** clicking "Delete" triggers `DELETE` to `element.href` */
                DELETE_VIA_UI: 'busy.deleting',
              }
            : {}),
        },

        states: {
          template: {
            initial: 'clean',

            on: {
              ...(options?.canBeInvalid
                ? {
                    /** calling `element.edit(invalidEdit)` always triggers this transition */
                    EDIT_INVALID_VIA_API: '.dirty.invalid',
                  }
                : {}),

              /** calling `element.edit(validEdit)` always triggers this transition */
              EDIT_VALID_VIA_API: '.dirty.valid',
              /** calling `element.undo()` transitions to valid or invalid clean state depending on the config */
              UNDO_VIA_API: '.clean.initial',

              ...(options?.isEditable
                ? {
                    /** entering valid data always triggers this transition */
                    EDIT_VALID_VIA_UI: '.dirty.valid',

                    ...(options?.canBeInvalid
                      ? {
                          /** entering invalid data always triggers this transition */
                          EDIT_INVALID_VIA_UI: '.dirty.invalid',
                        }
                      : {}),
                  }
                : {}),

              ...(options?.hasUndoButton
                ? {
                    /** clicking "Undo" transitions to valid or invalid clean state depending on the config */
                    UNDO_VIA_UI: '.clean.initial',
                  }
                : {}),
            },

            states: {
              clean: {
                initial: options?.isEmptyValid ? 'valid' : 'invalid',

                on: {
                  /** calling `element.submit()` has no effect in this state */
                  SUBMIT_VIA_API: { internal: true },

                  ...(options?.hasSubmitButton
                    ? {
                        /** clicking "Submit" has no effect in this state */
                        SUBMIT_VIA_UI: { internal: true },
                      }
                    : {}),
                },

                states: {
                  invalid: {},
                  valid: {},
                  initial: { type: 'history' },
                },
              },

              dirty: {
                states: {
                  invalid: {
                    on: {
                      /** calling `element.submit()` has no effect in this state */
                      SUBMIT_VIA_API: { internal: true },

                      ...(options?.hasSubmitButton
                        ? {
                            /** clicking "Submit" has no effect in this state */
                            SUBMIT_VIA_UI: { internal: true },
                          }
                        : {}),
                    },
                  },

                  valid: {
                    on: {
                      /** calling `element.submit()` in this state always triggers this transition */
                      SUBMIT_VIA_API: '#element.busy.creating',

                      ...(options?.hasSubmitButton
                        ? {
                            /** clicking "Submit" has no effect in this state */
                            SUBMIT_VIA_UI: '#element.busy.creating',
                          }
                        : {}),
                    },
                  },
                },
              },
            },
          },

          snapshot: {
            initial: 'clean',

            on: {
              ...(options?.canBeInvalid
                ? {
                    /** calling `element.edit(invalidEdit)` always triggers this transition */
                    EDIT_INVALID_VIA_API: '.dirty.invalid',
                  }
                : {}),

              /** calling `element.edit(validEdit)` always triggers this transition */
              EDIT_VALID_VIA_API: '.dirty.valid',
              /** calling `element.undo()` transitions to valid or invalid clean state depending on the config */
              UNDO_VIA_API: '.clean.initial',

              ...(options?.isEditable
                ? {
                    /** entering valid data always triggers this transition */
                    EDIT_VALID_VIA_UI: '.dirty.valid',

                    ...(options?.canBeInvalid
                      ? {
                          /** entering invalid data always triggers this transition */
                          EDIT_INVALID_VIA_UI: '.dirty.invalid',
                        }
                      : {}),
                  }
                : {}),

              ...(options?.hasUndoButton
                ? {
                    /** clicking "Undo" transitions to valid or invalid clean state depending on the config */
                    UNDO_VIA_UI: '.clean.initial',
                  }
                : {}),
            },

            states: {
              clean: {
                initial: options?.isEmptyValid ? 'valid' : 'invalid',

                on: {
                  /** calling `element.submit()` has no effect in this state */
                  SUBMIT_VIA_API: { internal: true },

                  ...(options?.hasSubmitButton
                    ? {
                        /** clicking "Submit" has no effect in this state */
                        SUBMIT_VIA_UI: { internal: true },
                      }
                    : {}),
                },

                states: {
                  invalid: {},
                  valid: {},
                  initial: { type: 'history' },
                },
              },

              dirty: {
                states: {
                  invalid: {
                    on: {
                      /** calling `element.submit()` has no effect in this state */
                      SUBMIT_VIA_API: { internal: true },

                      ...(options?.hasSubmitButton
                        ? {
                            /** clicking "Submit" has no effect in this state */
                            SUBMIT_VIA_UI: { internal: true },
                          }
                        : {}),
                    },
                  },

                  valid: {
                    on: {
                      /** calling `element.submit()` in this state always triggers this transition */
                      SUBMIT_VIA_API: '#element.busy.updating',

                      ...(options?.hasSubmitButton
                        ? {
                            /** clicking "Submit" has no effect in this state */
                            SUBMIT_VIA_UI: '#element.busy.updating',
                          }
                        : {}),
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
