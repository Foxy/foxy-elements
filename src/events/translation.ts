interface TranslationEventDetail {
  lang: string;
}

export class TranslationEvent extends CustomEvent<TranslationEventDetail> {
  constructor(detail: TranslationEventDetail) {
    super('translation', { detail });
  }
}
