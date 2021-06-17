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
        disabled: {
          on: {
            ENABLE: 'enabled',
            FORCE_TOGGLE: '#checkbox.unchecked.disabled',
          },
        },
        enabled: {
          on: {
            DISABLE: 'disabled',
            FORCE_TOGGLE: '#checkbox.unchecked.enabled',
            TOGGLE: { actions: 'sendChange', target: '#checkbox.unchecked.enabled' },
          },
        },
      },
    },
    unchecked: {
      initial: 'enabled',
      states: {
        disabled: {
          on: {
            DISABLE: 'enabled',
            FORCE_TOGGLE: '#checkbox.checked.disabled',
          },
        },
        enabled: {
          on: {
            DISABLE: 'disabled',
            FORCE_TOGGLE: '#checkbox.checked.enabled',
            TOGGLE: { actions: 'sendChange', target: '#checkbox.checked.enabled' },
          },
        },
      },
    },
  },
});
