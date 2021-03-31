import { Machine } from 'xstate';

interface CheckboxStateSchema {
  states: {
    checked: {
      states: {
        enabled: Record<string, unknown>;
        disabled: Record<string, unknown>;
      };
    };
    unchecked: {
      states: {
        enabled: Record<string, unknown>;
        disabled: Record<string, unknown>;
      };
    };
  };
}

interface CheckboxEvent {
  type: 'DISABLE' | 'ENABLE' | 'TOGGLE' | 'FORCE_TOGGLE';
}

export const CheckboxMachine = Machine<void, CheckboxStateSchema, CheckboxEvent>({
  id: 'checkbox',
  initial: 'unchecked',
  states: {
    checked: {
      initial: 'enabled',
      states: {
        enabled: {
          on: {
            DISABLE: 'disabled',
            TOGGLE: { target: '#checkbox.unchecked.enabled', actions: 'sendChange' },
            FORCE_TOGGLE: '#checkbox.unchecked.enabled',
          },
        },
        disabled: {
          on: {
            ENABLE: 'enabled',
            FORCE_TOGGLE: '#checkbox.unchecked.disabled',
          },
        },
      },
    },
    unchecked: {
      initial: 'enabled',
      states: {
        enabled: {
          on: {
            DISABLE: 'disabled',
            TOGGLE: { target: '#checkbox.checked.enabled', actions: 'sendChange' },
            FORCE_TOGGLE: '#checkbox.checked.enabled',
          },
        },
        disabled: {
          on: {
            DISABLE: 'enabled',
            FORCE_TOGGLE: '#checkbox.checked.disabled',
          },
        },
      },
    },
  },
});
