import { describe, expect, it } from "vitest";
import { formatFullName } from "./full-name";

describe("formatFullName", () => {
  const ada = { first_name: "Ada", last_name: "Lovelace" };

  it("substitutes both tokens", () => {
    expect(formatFullName("{first_name} {last_name}", ada)).toBe(
      "Ada Lovelace",
    );
  });

  it("supports a salutation prefix", () => {
    expect(formatFullName("Dr. {first_name} {last_name}", ada)).toBe(
      "Dr. Ada Lovelace",
    );
  });

  it("supports reordering", () => {
    expect(formatFullName("{last_name}, {first_name}", ada)).toBe(
      "Lovelace, Ada",
    );
  });

  it("treats a missing value as empty and trims the result", () => {
    expect(
      formatFullName("{first_name} {last_name}", { first_name: "Ada" }),
    ).toBe("Ada");
  });

  it("leaves unknown tokens untouched", () => {
    expect(formatFullName("{first_name} {nickname}", ada)).toBe(
      "Ada {nickname}",
    );
  });

  it("does not throw on a malformed template", () => {
    expect(formatFullName("{first_name", ada)).toBe("{first_name");
  });

  it("collapses whitespace left by empty substitutions", () => {
    expect(
      formatFullName("{first_name}  {last_name}", { last_name: "Lovelace" }),
    ).toBe("Lovelace");
  });
});
