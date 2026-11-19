import { TextFieldElement } from '@vaadin/vaadin-text-field/vaadin-text-field';
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';

type PatchedPrototype = {
  _onInput: (evt: Event) => void;
  __composedInputPatched?: true;
};

// Password managers and other browser extensions fill a field by setting the value of the <input>
// inside Vaadin's shadow root and dispatching their own `input` event. Script-made events aren't
// composed, so they never leave that shadow root and `@input` listeners on the field miss them,
// even though the field shows the new value. Vaadin's private `_onInput` still sees every such
// event, so it re-dispatches the event from the field. Real typing and pasting are composed
// already and are left alone. Email, password, number and integer fields inherit this from
// TextFieldElement.
for (const Field of [TextFieldElement, TextAreaElement]) {
  const proto = Field.prototype as unknown as PatchedPrototype;
  if (proto.__composedInputPatched) continue;

  const onInput = proto._onInput;
  proto.__composedInputPatched = true;
  proto._onInput = function (this: HTMLElement, evt: Event) {
    onInput.call(this, evt);
    if (evt.composed || evt.cancelBubble) return;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };
}
