type PatchedField = HTMLElement & {
  value: string;
  _onInput: (evt: Event) => void;
  __composedInputPatched?: true;
};

// Password managers and other browser extensions fill a field by setting the value of the <input>
// inside Vaadin's shadow root and dispatching their own `input` event. Script-made events aren't
// composed, so they never leave that shadow root and `@input` listeners on the field miss them,
// even though the field shows the new value. Vaadin's private `_onInput` still sees every such
// event, so it re-dispatches the event from the field. Real typing and pasting are composed
// already and are left alone. Email, password, number and integer fields inherit this from
// vaadin-text-field. The patch waits for the elements to be defined so that importing it
// doesn't load or register them.
function patch(Field: CustomElementConstructor) {
  const proto = Field.prototype as PatchedField;
  const onInput = proto._onInput;
  // Two builds of this library on one page share the registered class. Only the first one
  // patches it, so the event isn't sent twice.
  if (typeof onInput !== 'function' || proto.__composedInputPatched) return;

  proto.__composedInputPatched = true;
  proto._onInput = function (this: PatchedField, evt: Event) {
    const oldValue = this.value;
    onInput.call(this, evt);
    // `_onInput` can stop the event or, with `preventInvalidInput`, revert the value.
    // Neither is a change to report.
    if (evt.composed || evt.cancelBubble || this.value === oldValue) return;

    // Vaadin elements built on a text field (combo box, date picker, select) treat any input
    // from it as typing and open their overlay. Fills inside them stay as they were.
    const host = (this.getRootNode() as ShadowRoot).host;
    if (host?.localName.startsWith('vaadin-')) return;

    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };
}

for (const tag of ['vaadin-text-field', 'vaadin-text-area']) {
  customElements.whenDefined(tag).then(() => {
    const Field = customElements.get(tag);
    if (Field) patch(Field);
  });
}
