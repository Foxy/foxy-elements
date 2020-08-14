import { Preset } from './defaults';

export interface WidgetEditorSubmitEventDetail {
  index: number | null;
  preset: Preset;
}

export class WidgetEditorSubmitEvent extends CustomEvent<WidgetEditorSubmitEventDetail> {
  constructor(detail: WidgetEditorSubmitEventDetail) {
    super('submit', { detail });
  }
}
