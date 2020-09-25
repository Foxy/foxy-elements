export class FrequencyModificationRuleRemoveEvent extends CustomEvent<void> {
  constructor() {
    super('remove');
  }
}
