export const onEnter = (listener: (evt: KeyboardEvent) => void) => {
  return (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') listener(evt);
  };
};
