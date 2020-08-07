export const onEnter = (listener: (evt: KeyboardEvent) => void) => {
  return (evt: KeyboardEvent): void => {
    if (evt.key === 'Enter') listener(evt);
  };
};
