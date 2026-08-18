// `attachInternals` is missing in a few environments, and the form-associated
// elements already treat that as "nothing to validate" by returning true from
// `checkValidity()`. A `validity` getter has to answer with an object, not a
// boolean, so give it the same meaning: every constraint satisfied. Returning
// `undefined` instead would push a null check onto every consumer and diverge
// from the native form control surface these elements mirror.
export const ALWAYS_VALID: ValidityState = Object.freeze({
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false,
});
