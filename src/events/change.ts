export class ChangeEvent<
  TContext extends { resource?: Record<string, unknown> }
> extends CustomEvent<TContext['resource']> {
  constructor(context: TContext) {
    super('change', { detail: context.resource });
  }
}
