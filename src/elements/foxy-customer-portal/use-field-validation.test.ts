import { afterEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { useFieldValidation, type FieldRules } from "./use-field-validation";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

function renderHook(rules: FieldRules) {
  let result: ReturnType<typeof useFieldValidation> | undefined;

  function Probe() {
    result = useFieldValidation(rules);
    return null;
  }

  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);

  act(() => {
    root!.render(createElement(IntlProvider, { locale: "en-US" }, createElement(Probe)));
  });

  return {
    getResult: () => result!,
    rerenderWith: (fn: () => void) => act(fn),
  };
}

describe("useFieldValidation", () => {
  it("reports no error for an untouched field", () => {
    const { getResult } = renderHook({ email: { required: true } });
    expect(getResult().errors.email).toBeUndefined();
  });

  it("flags a required field left blank", () => {
    const { getResult, rerenderWith } = renderHook({ email: { required: true } });

    rerenderWith(() => getResult().validateField("email", ""));

    expect(getResult().errors.email).toMatch(/required/i);
  });

  it("treats a whitespace-only value as blank for a required field", () => {
    const { getResult, rerenderWith } = renderHook({ name: { required: true } });

    rerenderWith(() => getResult().validateField("name", "   "));

    expect(getResult().errors.name).toMatch(/required/i);
  });

  it("passes a required field with a real value", () => {
    const { getResult, rerenderWith } = renderHook({ email: { required: true } });

    rerenderWith(() => getResult().validateField("email", "ada@example.com"));

    expect(getResult().errors.email).toBeNull();
  });

  it("flags a value longer than maxLength, with the limit in the message", () => {
    const { getResult, rerenderWith } = renderHook({ name: { maxLength: 5 } });

    rerenderWith(() => getResult().validateField("name", "123456"));

    expect(getResult().errors.name).toMatch(/5/);
  });

  it("passes a value at exactly maxLength", () => {
    const { getResult, rerenderWith } = renderHook({ name: { maxLength: 5 } });

    rerenderWith(() => getResult().validateField("name", "12345"));

    expect(getResult().errors.name).toBeNull();
  });

  it("does not flag length on an empty optional field", () => {
    const { getResult, rerenderWith } = renderHook({ name: { maxLength: 5 } });

    rerenderWith(() => getResult().validateField("name", ""));

    expect(getResult().errors.name).toBeNull();
  });

  it("flags a malformed email", () => {
    const { getResult, rerenderWith } = renderHook({ email: { email: true } });

    rerenderWith(() => getResult().validateField("email", "not-an-email"));

    expect(getResult().errors.email).toMatch(/valid email/i);
  });

  it("passes a well-formed email", () => {
    const { getResult, rerenderWith } = renderHook({ email: { email: true } });

    rerenderWith(() => getResult().validateField("email", "ada@example.com"));

    expect(getResult().errors.email).toBeNull();
  });

  it("does not flag email format on an empty optional email field", () => {
    const { getResult, rerenderWith } = renderHook({ email: { email: true } });

    rerenderWith(() => getResult().validateField("email", ""));

    expect(getResult().errors.email).toBeNull();
  });

  it("does nothing for a field with no matching rule", () => {
    const { getResult, rerenderWith } = renderHook({ email: { required: true } });

    rerenderWith(() => getResult().validateField("unrelated", ""));

    expect(getResult().errors.unrelated).toBeNull();
  });

  it("validateAll returns false and populates every failing field when any rule fails", () => {
    const { getResult, rerenderWith } = renderHook({
      email: { required: true },
      name: { maxLength: 3 },
    });

    let passed: boolean | undefined;
    rerenderWith(() => {
      passed = getResult().validateAll({ email: "", name: "toolong" });
    });

    expect(passed).toBe(false);
    expect(getResult().errors.email).toMatch(/required/i);
    expect(getResult().errors.name).toMatch(/3/);
  });

  it("validateAll returns true and clears every field when all rules pass", () => {
    const { getResult, rerenderWith } = renderHook({
      email: { required: true },
      name: { maxLength: 10 },
    });

    let passed: boolean | undefined;
    rerenderWith(() => {
      passed = getResult().validateAll({ email: "ada@example.com", name: "Ada" });
    });

    expect(passed).toBe(true);
    expect(getResult().errors.email).toBeNull();
    expect(getResult().errors.name).toBeNull();
  });

  it("validateAll treats a value missing from the input object as an empty string", () => {
    const { getResult, rerenderWith } = renderHook({ email: { required: true } });

    let passed: boolean | undefined;
    rerenderWith(() => {
      passed = getResult().validateAll({});
    });

    expect(passed).toBe(false);
    expect(getResult().errors.email).toMatch(/required/i);
  });
});
