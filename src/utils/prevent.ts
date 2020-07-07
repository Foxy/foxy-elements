export function prevent<T extends Event = Event>(handler: (evt: T) => unknown) {
  return (evt: T) => {
    evt.preventDefault();
    handler(evt);
  };
}
