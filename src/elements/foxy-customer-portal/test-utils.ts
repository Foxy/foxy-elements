/**
 * Sets a controlled input's value the way a user would, so React's onChange fires.
 *
 * React tracks each input's last value on the DOM node. A direct
 * `input.value = x` updates that tracker as a side effect, so React concludes
 * nothing changed and skips the change event. Writing through the prototype's
 * own setter leaves the tracker stale, which is what makes React notice.
 */
export function setInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
