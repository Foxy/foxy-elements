export class NextDateModificationRuleRemoveEvent extends CustomEvent<void> {
  constructor() {
    super('remove');
  }
}
