/**
 * @param handler
 */
export function prevent<T extends Event = Event>(handler: (evt: T) => unknown) {
  return (evt: T): void => {
    evt.preventDefault();
    handler(evt);
  };
}
