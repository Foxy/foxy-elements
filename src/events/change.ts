export class ChangeEvent<TContext extends { resource?: object }> extends CustomEvent<
  TContext['resource']
> {
  constructor(context: TContext) {
    super('change', { detail: context.resource });
  }
}
