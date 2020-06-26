export function define(name: string, constructor: CustomElementConstructor) {
  if (typeof window !== 'undefined' && !window.customElements.get(name)) {
    window.customElements.define(name, constructor);
  }
}

export const onEnter = (listener: (evt: KeyboardEvent) => void) => {
  return (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') listener(evt);
  };
}

export function parseDuration(value: string) {
  return {
    count: parseInt(value.replace(/(y|m|w|d)/, '')),
    units: value.replace(/\d+(\.\d*)?/, '')
  };
}

export function translateWeekday(day: number, locale: string, weekday = 'long') {
  const date = new Date();
  while (date.getDay() !== day) date.setDate(date.getDate() + 1);
  return date.toLocaleDateString(locale, { weekday });
}
