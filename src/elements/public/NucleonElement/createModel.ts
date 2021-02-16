import { EventExecutor, TestEventConfig, TestModelOptions } from '@xstate/test/lib/types';
import { StateMachine, createMachine } from 'xstate';
import { TestModel, createModel as createXStateModel } from '@xstate/test';
import { clone, set } from 'lodash-es';

import { TestMachineOptions } from './createTestMachine';

type NucleonTestModelOptions<TTestContext> = TestMachineOptions &
  TestModelOptions<TTestContext> & {
    tests?: Record<string, EventExecutor<TTestContext> | TestEventConfig<TTestContext>>;
  };

export function createModel<TTestContext, TContext = any>(
  machine: StateMachine<TContext, any, any>,
  options?: NucleonTestModelOptions<TTestContext>
): TestModel<TTestContext, TContext> {
  const config = clone(machine.config);

  Object.entries(options?.tests ?? {}).forEach(([state, test]) => {
    set(config, `states.${state.split('.').join('.states.')}.meta.test`, test);
  });

  return createXStateModel(createMachine(config), options);
}
